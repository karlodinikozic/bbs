import {CreateStorageItemData, IStorageItemRepository, StorageItem} from "./storage-item.model";
import { PrismaClient} from "@prisma/client";

export class StorageItemRepository implements IStorageItemRepository {
    private  readonly  prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    findById(id: StorageItem["id"]): Promise<StorageItem | null> {
        return this.prisma.storageItem.findUnique({ where: { id } });
    }

    async existsInFolder(parentId: StorageItem["parentId"], name: StorageItem["name"] ): Promise<boolean> {
        const count  = await this.prisma.storageItem.count({where : {parentId,name }})
        return count > 0;
    }

    create(data: CreateStorageItemData): Promise<StorageItem> {
        return this.prisma.storageItem.create({data})
    }
}