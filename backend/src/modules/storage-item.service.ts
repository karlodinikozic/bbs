import {IStorageItemRepository, StorageItem, StorageItemType} from "./storage-item.model";
import {CreateStorageItemDTO, DeleteStorageItemDTO, ListStorageItemsDTO} from "./storage-item.dto";
import {Cradle} from "../container";

export class StorageItemService {
    private readonly repository: IStorageItemRepository;

    constructor(cradle: Cradle) {
        this.repository = cradle.storageItemRepository;
    }

    async create(dto: CreateStorageItemDTO): Promise<StorageItem> {
        const name = dto.name.trim()
        const parentId = dto.parentId ?? null;
        let path = "";

        if (parentId) {
            const parent = await this.repository.findById(parentId);
            if (!parent) {
                throw new Error("Parent folder not found");
            }

            if (parent.type !== StorageItemType.FOLDER) {
                throw new Error("Parent must be a folder");
            }
            path = `${path}/${parent.id}`;
        }

        if (await this.repository.existsInFolder(parentId, dto.name)) {
            throw new Error("Name already exists in this folder");
        }

        return await this.repository.create({name, type: dto.type, parentId, path})
    }

    async listChildren(dto: ListStorageItemsDTO): Promise<StorageItem[]> {
        const parentId = dto.parentId ?? null;
        if (parentId) {
            const parent = await this.repository.findById(parentId);
            if (!parent) {
                throw new Error("Folder not found");
            }
            if (parent.type !== StorageItemType.FOLDER) {
                throw new Error("Not a folder");
            }
        }
        return this.repository.findChildren(parentId)
    }

    async delete(dto: DeleteStorageItemDTO): Promise<void> {
        const item = await this.repository.findById(dto.id);
        if(!item) {
            throw new Error("Item not found");
        }
        await this.repository.deleteWithDescendants(item.id, `${item.path}/${item.id}`)
    }
}