import {CreateStorageItemData, IStorageItemRepository, StorageItem} from "./storage-item.model";
import {PrismaClient} from "../generated/prisma/client";
import {Cradle} from "../container";

export class StorageItemRepository implements IStorageItemRepository {
    private readonly prisma: PrismaClient;

    constructor(cradle: Cradle) {
        this.prisma = cradle.prisma;
    }

    findChildren(parentId: StorageItem["parentId"]): Promise<StorageItem[]> {
        return this.prisma.storageItem.findMany({
            where: {parentId},
            orderBy: [{type: "desc"}, {name: "asc"}]
        })
    }

    findById(id: StorageItem["id"]): Promise<StorageItem | null> {
        return this.prisma.storageItem.findUnique({where: {id}});
    }

    async existsInFolder(parentId: StorageItem["parentId"], name: StorageItem["name"]): Promise<boolean> {
        const count = await this.prisma.storageItem.count({where: {parentId, name}})
        return count > 0;
    }

    create(data: CreateStorageItemData): Promise<StorageItem> {
        return this.prisma.storageItem.create({data})
    }

    async deleteWithDescendants(id: string, descendantsPath: string): Promise<void> {
        await this.prisma.storageItem.deleteMany({
            where: {
                OR: [{id}, {path: {startsWith: descendantsPath}}],
            }
        });
    }
}