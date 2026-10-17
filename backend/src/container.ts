import {asClass, asValue, createContainer, InjectionMode} from "awilix";
import {prisma} from "./shared/database/prisma";
import {StorageItemRepository} from "./modules/storage-items/storage-item.repository";
import {StorageItemService} from "./modules/storage-items/storage-item.service";
import {StorageItemController} from "./modules/storage-items/storage-item.controller";

export interface Cradle{
    prisma: typeof prisma
    storageItemRepository: StorageItemRepository
    storageItemService: StorageItemService
    storageItemController: StorageItemController
}

export const container = createContainer({
    injectionMode: InjectionMode.PROXY,
    strict: true
})

container.register({
    prisma: asValue(prisma),
    storageItemRepository: asClass(StorageItemRepository).singleton(),
    storageItemService: asClass(StorageItemService).singleton(),
    storageItemController: asClass(StorageItemController).singleton(),
})