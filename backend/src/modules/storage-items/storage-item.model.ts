export const StorageItemType = {
    FILE: "FILE",
    FOLDER: "FOLDER",
} as const;

export type StorageItemType = (typeof StorageItemType)[keyof typeof StorageItemType];

export interface StorageItem {
    id: string;
    parentId: string | null;
    name: string;
    type: StorageItemType;
    path: string;
    createdAt: Date;
}

export type CreateStorageItemData = Omit<StorageItem, "id" | "createdAt">;

export interface IStorageItemRepository {
    findById(id: StorageItem["id"]): Promise<StorageItem | null>;

    findChildren(parentId: StorageItem["parentId"]): Promise<StorageItem[]>;

    existsInFolder(parentId: StorageItem["parentId"], name: StorageItem["name"]): Promise<boolean>;

    create(data: CreateStorageItemData): Promise<StorageItem>;

    deleteWithDescendants(id: string, descendantsPath: string): Promise<void>;

    findByName(name: StorageItem["name"], pathPrefix:string | null, limit: number): Promise<StorageItem[]>;

    findFilesByPrefix(prefix: string,limit: number): Promise<StorageItem[]>;
}