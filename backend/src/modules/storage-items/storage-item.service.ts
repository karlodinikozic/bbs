import {IStorageItemRepository, StorageItem, StorageItemType} from "./storage-item.model";
import {
    AutocompleteStorageItemDTO,
    CreateStorageItemDTO,
    DeleteStorageItemDTO,
    ListStorageItemsDTO,
    SearchStorageItemDTO
} from "./storage-item.dto";
import {Cradle} from "../../container";
import {BadRequestError, ConflictError, NotFoundError} from "../../shared/errors/app-errors";

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
                throw new NotFoundError("Parent folder not found");
            }

            if (parent.type !== StorageItemType.FOLDER) {
                throw new BadRequestError("Parent must be a folder");
            }
            path = `${parent.path}/${parent.id}`;
        }

        if (await this.repository.existsInFolder(parentId, dto.name)) {
            throw new ConflictError("Name already exists in this folder");
        }

        return await this.repository.create({name, type: dto.type, parentId, path})
    }

    private static readonly SEARCH_LIMIT = 50;
    async search(dto: SearchStorageItemDTO): Promise<StorageItem[]> {
        let pathPrefix: string | null = null;
        if(dto.parentId){
            const parent = await this.repository.findById(dto.parentId);
            if(!parent) {
                throw new NotFoundError("Folder not found");
            }
            if(parent.type !== StorageItemType.FOLDER) {
                throw new BadRequestError("Parent must be a folder");
            }

            pathPrefix = `${parent.path}/${parent.id}`;
        }
        return this.repository.findByName(dto.name,pathPrefix, StorageItemService.SEARCH_LIMIT);
    }

    private static readonly AUTOCOMPLETE_LIMIT = 10;
    autocomplete(dto: AutocompleteStorageItemDTO): Promise<StorageItem[]> {
        return this.repository.findFilesByPrefix(dto.prefix,StorageItemService.AUTOCOMPLETE_LIMIT)
    }

    async listChildren(dto: ListStorageItemsDTO): Promise<StorageItem[]> {
        const parentId = dto.parentId ?? null;
        if (parentId) {
            const parent = await this.repository.findById(parentId);
            if (!parent) {
                throw new NotFoundError("Folder not found");
            }
            if (parent.type !== StorageItemType.FOLDER) {
                throw new BadRequestError("Not a folder");
            }
        }
        return this.repository.findChildren(parentId)
    }

    async delete(dto: DeleteStorageItemDTO): Promise<void> {
        const item = await this.repository.findById(dto.id);
        if(!item) {
            throw new NotFoundError("Item not found");
        }
        await this.repository.deleteWithDescendants(item.id, `${item.path}/${item.id}`)
    }
}