export type StorageItemType = "FILE" | "FOLDER"


export interface StorageItem {
    id: string;
    parentId: string | null;
    name: string;
    type: StorageItemType;
    path: string;
    createdAt: Date;
}

export type CreateStorageItemData = Omit<StorageItem, "id" | "createdAt">;

export interface IStorageItemRepository  {
    findById(id: StorageItem["id"]): Promise<StorageItem | null>;
    existsInFolder(parentId: StorageItem["parentId"], name: StorageItem["name"]): Promise<boolean>;
    create(data: CreateStorageItemData): Promise<StorageItem>;
}