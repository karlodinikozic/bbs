import {asClass, asValue, createContainer, InjectionMode} from "awilix";
import {prisma} from "./shared/database/prisma";
import {StorageItemRepository} from "./modules/storage-item.repository";
import {StorageItemController} from "./modules/storage-item.contoller";
import {StorageItemService} from "./modules/storage-item.service";

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