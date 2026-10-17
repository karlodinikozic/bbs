import {StorageItemType} from "./storage-item.model";
import {z} from "zod";

export const createStorageItemSchema = z.object({
    name: z.string().trim().min(1).max(255),
    type: z.enum(StorageItemType),
    parentId: z.uuid().nullable().optional()
})
export type CreateStorageItemDTO = z.infer<typeof createStorageItemSchema>;


export const listStorageItemsSchema = z.object({
    parentId: z.uuid().optional()
})

export type ListStorageItemsDTO = z.infer<typeof listStorageItemsSchema>;

export const deleteStorageItemSchema = z.object({
    id:  z.uuid(),
})

export type DeleteStorageItemDTO = z.infer<typeof deleteStorageItemSchema>;


export const searchStorageItemSchema = z.object({
    name: z.string().trim().min(1),
    parentId: z.uuid().optional()
})

export type SearchStorageItemDTO = z.infer<typeof searchStorageItemSchema>;

export const autocompleteStorageItemSchema = z.object({
    prefix: z.string().trim().min(1).max(255),
})
export type AutocompleteStorageItemDTO = z.infer<typeof autocompleteStorageItemSchema>;