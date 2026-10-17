export const  StorageItemType = {
    FILE: "FILE",
    FOLDER : "FOLDER",
} as const;

export type StorageItemType = (typeof StorageItemType)[keyof typeof StorageItemType];

export interface StorageItem {
    id: string;
    name: string;
    type: StorageItemType;
    parentId: string | null;
    path: string;
    createdAt: string;
}