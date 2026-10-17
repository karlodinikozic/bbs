import {StorageItemController} from "./storage-item.controller";
import express from "express";

export function storageItemRoutes(controller: StorageItemController) {
    const router = express.Router();

    router.get("/", controller.list);
    router.post("/",controller.create)
    router.delete("/:id",controller.delete);
    router.get("/search",controller.search);
    router.get("/autocomplete",controller.autocomplete);

    return router;

}