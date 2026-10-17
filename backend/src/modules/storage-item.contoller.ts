import {Request, Response} from "express";
import {
    autocompleteStorageItemSchema,
    createStorageItemSchema,
    deleteStorageItemSchema,
    listStorageItemsSchema,
    searchStorageItemSchema
} from "./storage-item.dto";
import {StorageItemService} from "./storage-item.service";
import {Cradle} from "../container";


export class StorageItemController {
    private readonly service: StorageItemService;

    constructor(cradle: Cradle) {
        this.service = cradle.storageItemService
    }

    create = async (req: Request, res: Response) => {
        const dto = createStorageItemSchema.parse(req.body);
        const item = await this.service.create(dto);

        return res.status(201).json(item);
    }

    search = async (req: Request, res: Response) => {
        const dto = searchStorageItemSchema.parse(req.query);
        const items = await this.service.search(dto);
        return res.json(items);
    }

    autocomplete = async (req: Request, res: Response) => {
        const dto = autocompleteStorageItemSchema.parse(req.query);
        const items = await this.service.autocomplete(dto);
        return res.json(items);
    }

    list = async (req: Request, res: Response) => {
        const dto = listStorageItemsSchema.parse(req.query);
        const items = await this.service.listChildren(dto)

        return res.json(items);
    }

    delete = async (req: Request, res: Response) => {
        const dto = deleteStorageItemSchema.parse(req.params);
        await this.service.delete(dto);
        return res.status(204).send()
    }

}