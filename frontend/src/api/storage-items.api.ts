import type {StorageItem} from "../types/storage-item.ts";
import {request} from "./api-client.ts";

const BASE_PATH = "/storage-items";

export function getStorageItems(parentId: string | null): Promise<StorageItem[]>{
    if(parentId === null) {
        return request(BASE_PATH);
    }
    return request(`${BASE_PATH}?parentId=${parentId}`)

}