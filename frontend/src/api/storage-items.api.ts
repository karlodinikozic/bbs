import type {StorageItem, StorageItemType} from "../types/storage-item.ts";
import {request} from "./api-client.ts";

const BASE_PATH = "/storage-items";

export function getStorageItems(parentId: string | null): Promise<StorageItem[]> {
    if (parentId === null) {
        return request(BASE_PATH);
    }
    return request(`${BASE_PATH}?parentId=${parentId}`)

}

export interface CreateStorageItemRequest {
    name: string;
    type: StorageItemType;
    parentId: string | null;
}

export function createStorageItem(data: CreateStorageItemRequest): Promise<StorageItem> {
    return request(BASE_PATH, {
        method: "POST",
        body: JSON.stringify(data),
    })
}


export function deleteStorageItem(id: string) {
    return request(`${BASE_PATH}/${id}`, {method: "DELETE"})
}

export function searchStorageItem(name: StorageItem["name"], parentId: StorageItem["parentId"]): Promise<StorageItem[]> {
    const params = new URLSearchParams({name});
    if (parentId) {
        params.set("parentId", parentId);
    }
    return request(`${BASE_PATH}/search?${params}`)
}

export function autoCompleteStorageItem(prefix: string, signal?: AbortSignal): Promise<StorageItem[]>  {
    const params = new URLSearchParams({prefix});
    return request(`${BASE_PATH}/autoComplete?${params}`, {signal});
}