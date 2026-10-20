import {beforeEach, describe, it, expect} from "vitest";
import {IStorageItemRepository, StorageItemType} from "../../src/modules/storage-items/storage-item.model";
import {StorageItemService} from "../../src/modules/storage-items/storage-item.service";
import {InMemoryStorageItemRepository} from "../fakes/in-memory-storage-item.repository";
import {Cradle} from "../../src/container";
import {BadRequestError, ConflictError, NotFoundError} from "../../src/shared/errors/app-errors";
import {randomUUID} from "node:crypto";


describe("StorageItemService.create", () => {
    let repository: IStorageItemRepository;
    let service: StorageItemService;

    beforeEach(() => {
        repository = new InMemoryStorageItemRepository()
        service = new StorageItemService({storageItemRepository: repository} as Cradle)
    })

    it("create root folder with an empty path", async () => {
        const folder = await service.create({name: "testFolder", type: StorageItemType.FOLDER})

        expect(folder.name).toEqual("testFolder")
        expect(folder.path).toBe("")
        expect(folder.parentId).toBeNull()
    })

    it("Create a folder inside another folder, and create a file inside that folder.", async () => {
        const parentFolder = await service.create({name: "parentFolder", type: StorageItemType.FOLDER})
        const childFolder = await service.create({
            name: "childFolder",
            parentId: parentFolder.id,
            type: StorageItemType.FOLDER
        })
        const file = await service.create({name: "file", parentId: childFolder.id, type: StorageItemType.FILE})

        expect(file.type).toEqual(StorageItemType.FILE)
        expect(childFolder.path).toEqual(`/${parentFolder.id}`)
        expect(file.path).toEqual(`/${parentFolder.id}/${childFolder.id}`)

    })

    it("Prevent duplicate names within the same folder.", async () => {
        await service.create({name: "testFolder", type: StorageItemType.FOLDER})

        await expect(service.create({
            name: "testFolder",
            type: StorageItemType.FOLDER
        })).rejects.toBeInstanceOf(ConflictError)
    })

    it("Allow duplicate names within the different folders.", async () => {
        const testFolder1 = await service.create({name: "testFolder1", type: StorageItemType.FOLDER})
        const testFolder2 = await service.create({name: "testFolder2", type: StorageItemType.FOLDER})

        await service.create({name: "testInnerFolder", parentId: testFolder1.id, type: StorageItemType.FOLDER})
        await expect(service.create({
            name: "testInnerFolder",
            parentId: testFolder2.id,
            type: StorageItemType.FOLDER
        })).resolves.toBeDefined()
    })

    it("Prevent creation unexisting id of parent folder", async () => {
        await expect(service.create({
            name: "testFolder",
            type: StorageItemType.FOLDER,
            parentId: randomUUID()
        })).rejects.toBeInstanceOf(NotFoundError)
    })

    it("Prevent file as a parent", async () => {
        const file = await service.create({name: "testFile.txt", type: StorageItemType.FILE})

        await expect(service.create({
            name: "testFolder",
            type: StorageItemType.FOLDER,
            parentId: file.id
        })).rejects.toBeInstanceOf(BadRequestError)
    })

})

describe("StorageItemService.delete", () => {
    let repository: IStorageItemRepository;
    let service: StorageItemService;

    beforeEach(() => {
        repository = new InMemoryStorageItemRepository()
        service = new StorageItemService({storageItemRepository: repository} as Cradle)
    })

    it("Delete a file", async () => {
        const file = await service.create({name: "testFile.txt", type: StorageItemType.FILE})

        await service.delete({id: file.id})

        expect(await service.listChildren({})).toEqual([])
    })

    it("Delete a folder and everything in it", async () => {
        const parentFolder = await service.create({name: "parentFolder", type: StorageItemType.FOLDER})
        const childFolder = await service.create({
            name: "childFolder",
            parentId: parentFolder.id,
            type: StorageItemType.FOLDER
        })
        const file = await service.create({name: "file.txt", parentId: childFolder.id, type: StorageItemType.FILE})

        await service.delete({id: parentFolder.id})

        expect(await service.search({name: childFolder.name})).toEqual([])
        expect(await service.search({name: file.name})).toEqual([])
    })

    it("Delete Items only inside of given folder nothing else", async () => {
        const parentFolder = await service.create({name: "testFolder", type: StorageItemType.FOLDER})
        await service.create({name: "fileInside.txt", parentId: parentFolder.id, type: StorageItemType.FILE})
        await service.create({name: "fileOutside.txt", type: StorageItemType.FILE})

        await service.delete({id: parentFolder.id})

        const items = await service.listChildren({})

        expect(items).toHaveLength(1)
        expect(items[0].name).toEqual("fileOutside.txt")
    })

})

describe("StorageItemService.search", () => {
    let repository: IStorageItemRepository;
    let service: StorageItemService;

    beforeEach(() => {
        repository = new InMemoryStorageItemRepository()
        service = new StorageItemService({storageItemRepository: repository} as Cradle)
    })

    it("find an exact name in every folder", async () => {
        const testFolder1 = await service.create({name: "testFolder1", type: StorageItemType.FOLDER})
        const testFolder2 = await service.create({name: "testFolder2", type: StorageItemType.FOLDER})

        await service.create({name: "file.txt", parentId: testFolder1.id, type: StorageItemType.FILE})
        await service.create({name: "file.txt", parentId: testFolder2.id, type: StorageItemType.FILE})

        const res = await service.search({name: "file.txt"})
        expect(res).toHaveLength(2)
    })

    it("Verify that search matches only exact names, not partial matches", async () => {
        await service.create({name: "lada", type: StorageItemType.FOLDER})
        await service.create({name: "lada.mala.txt", type: StorageItemType.FILE})

        const res = await service.search({name: "lada"})

        expect(res).toHaveLength(1)
        expect(res.at(0)?.name).toEqual("lada")
    })

    it("Search inside a folder and it's subfolders", async () => {
        const parentFolder = await service.create({name: "parentFolder", type: StorageItemType.FOLDER})
        const childFolder = await service.create({
            name: "childFolder",
            parentId: parentFolder.id,
            type: StorageItemType.FOLDER
        })
        await service.create({name: "file.txt", parentId: childFolder.id, type: StorageItemType.FILE})
        await service.create({name: "file.txt", type: StorageItemType.FILE})

        const res = await service.search({name: "file.txt", parentId: parentFolder.id})

        expect(res).toHaveLength(1)
        expect(res.at(0)?.parentId).toEqual(childFolder.id)
    })

    it("Reject a folder that doesn't exist", async () => {
        await expect(
            service.search({name: "file.txt", parentId: randomUUID()})
        ).rejects.toBeInstanceOf(NotFoundError)
    })

    it("Reject a file as parentId in search", async () => {
        const file = await service.create({name: "file.txt", type: StorageItemType.FILE})
        await expect(
            service.search({name: "file.txt", parentId: file.id})
        ).rejects.toBeInstanceOf(BadRequestError)
    })

})

describe("StorageItemService.autocomplate", () => {
    let repository: IStorageItemRepository;
    let service: StorageItemService;

    beforeEach(() => {
        repository = new InMemoryStorageItemRepository()
        service = new StorageItemService({storageItemRepository: repository} as Cradle)
    })

    it("Return only files with right prefix", async () => {
        await service.create({name: "doodles.txt", type: StorageItemType.FILE})
        await service.create({name: "file.txt", type: StorageItemType.FILE})
        await service.create({name: "doers", type: StorageItemType.FOLDER})

        const res = await service.autocomplete({prefix: "do"})

        expect(res).toHaveLength(1)
        expect(res.at(0)?.name).toEqual("doodles.txt")
    })

    it("Find files in nested folders", async () => {
        const parentFolder = await service.create({name: "parentFolder", type: StorageItemType.FOLDER})
        const childFolder = await service.create({
            name: "childFolder",
            parentId: parentFolder.id,
            type: StorageItemType.FOLDER
        })
        await service.create({name: "file.txt", parentId: childFolder.id, type: StorageItemType.FILE})
        await service.create({name: "file2.txt", parentId: childFolder.id, type: StorageItemType.FILE})

        const res = await service.autocomplete({prefix: "fil"})
        expect(res).toHaveLength(2)
        expect(res.at(0)?.name).toEqual("file.txt")
        expect(res.at(1)?.name).toEqual("file2.txt")

    })

    it("Return 10 top files", async () => {
        for (let i = 0; i < 25; i++) {
            await service.create({name: `file-${i}.txt`, type: StorageItemType.FILE})
        }
        const res = await service.autocomplete({prefix: "fil"})
        expect(res).toHaveLength(10)

    })

    it("Differentiates between uppercase and lowercase", async () => {
        await service.create({name: "Doodles.txt", type: StorageItemType.FILE})

        const res = await service.autocomplete({prefix: "do"})
        expect(res).toHaveLength(0)
    })
})