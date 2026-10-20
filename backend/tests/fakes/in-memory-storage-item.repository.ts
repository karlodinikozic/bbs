import {
    CreateStorageItemData,
    IStorageItemRepository,
    StorageItem, StorageItemType
} from "../../src/modules/storage-items/storage-item.model";
import { randomUUID } from "node:crypto";

export class InMemoryStorageItemRepository implements IStorageItemRepository {
    items: StorageItem[] = []

    async create(data: CreateStorageItemData): Promise<StorageItem> {
        const item: StorageItem = {...data,id: randomUUID(),createdAt: new Date()};
        this.items.push(item);
        return item;
    }

    async deleteWithDescendants(id: string, descendantsPath: string): Promise<void> {
        this.items = this.items.filter(item => item.id !== id && !item.path.startsWith(descendantsPath));
        return;
    }

    async existsInFolder(parentId: StorageItem["parentId"], name: StorageItem["name"]): Promise<boolean> {
        return this.items.some(item => item.parentId === parentId  && item.name === name)
    }

    async findById(id: StorageItem["id"]): Promise<StorageItem | null> {
        return this.items.find(item => item.id === id) ?? null;
    }

    async findByName(name: StorageItem["name"], pathPrefix: string | null, limit: number): Promise<StorageItem[]> {
       return this.items
           .filter(item => item.name === name)
           .filter(item => pathPrefix === null || item.path.startsWith(pathPrefix))
           .slice(0,limit)
    }

    async findChildren(parentId: StorageItem["parentId"]): Promise<StorageItem[]> {
      return this.items.filter(item => item.parentId === parentId)
    }

    async findFilesByPrefix(prefix: string, limit: number): Promise<StorageItem[]> {
        return this.items
            .filter(item => item.type === StorageItemType.FILE && item.name.startsWith(prefix))
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0,limit)
    }
}