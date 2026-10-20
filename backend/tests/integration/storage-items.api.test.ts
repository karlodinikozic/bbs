import request from "supertest";
import {afterAll, beforeEach, describe, it, expect} from "vitest";
import {prisma} from "../../src/shared/database/prisma";
import {app} from "../../src/app";
import {StorageItemType} from "../../src/generated/prisma/enums";
import {randomUUID} from "node:crypto";

const API = "/api/storage-items"

describe("Storage items API", async () => {
    beforeEach(async () => {
        await prisma.storageItem.deleteMany()
    })

    afterAll(async () => {
        await prisma.$disconnect()
    })

    it("Should Create File Folder, Search Autocomplete & Deletes folders file ", async () => {
        const parentFolder = await request(app).post(API).send({name: "parentFolder", type: StorageItemType.FOLDER})
        expect(parentFolder.status).toBe(201)

        const childFolder = await request(app).post(API).send({
            name: "childFolder",
            parentId: parentFolder.body.id,
            type: StorageItemType.FOLDER
        })
        expect(childFolder.status).toBe(201)

        const file = await request(app).post(API).send({
            name: "file.txt",
            parentId: childFolder.body.id,
            type: StorageItemType.FILE
        })
        expect(file.status).toBe(201)

        const fileAtRoot = await request(app).post(API).send({
            name: "fileAtRoot.txt",
            type: StorageItemType.FILE
        })
        expect(fileAtRoot.status).toBe(201)


        //Get Parent Folder Children
        const children = await request(app).get(API).query({parentId: parentFolder.body.id})
        expect(children.status).toBe(200)
        expect(children.body[0]?.name).toBe("childFolder")

        //Search File inside parentFolder
        const search = await request(app).get(`${API}/search`).query({name: "file.txt", parentId: parentFolder.body.id})
        expect(search.status).toBe(200)
        expect(search.body).toHaveLength(1)

        //Autocomplete
        const autocomplete =  await request(app).get(`${API}/autocomplete`).query({prefix: "fi"})
        expect(autocomplete.body[0]?.name).toBe("file.txt")

        //Delete parentFolder
        const deleted = await request(app).delete(`${API}/${parentFolder.body.id}`)
        expect(deleted.status).toBe(204)

        const root = await request(app).get(API)
        expect(root.body[0]?.name).toBe("fileAtRoot.txt")

        const searchAfterDelete = await request(app).get(`${API}/search`).query({name: "file.txt"})
        expect(searchAfterDelete.status).toBe(200)
        expect(searchAfterDelete.body).toHaveLength(0)
    });

    it("Should return proper error Responses", async () => {

        //Duplicate entry
        await request(app).post(API).send({name: "folder", type: StorageItemType.FOLDER})
        const duplicate = await request(app).post(API).send({name: "folder", type: StorageItemType.FOLDER})
        expect(duplicate.status).toBe(409)

        //Invalid Type
        const invalid = await request(app).post(API).send({name: "folder", type: "Milk"})
        expect(invalid.status).toBe(400)
        expect(invalid.body.details).toBeDefined()
        expect(invalid.body.details[0]?.message).toBe(`Invalid option: expected one of "FILE"|"FOLDER"`)

        //Wrong parent Id
        const wrongParent = await request(app).post(API).send({name: "file.txt",parentId: randomUUID(), type: StorageItemType.FILE})
        expect(wrongParent.status).toBe(404)

        //Unknow route
        const unknownRoute = await request(app).get("/api/some-wrong-route")
        expect(unknownRoute.status).toBe(404)
    })
})