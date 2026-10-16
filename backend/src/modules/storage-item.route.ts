import {StorageItemController} from "./storage-item.contoller";
import express from "express";

export function storageItemRoutes(controller: StorageItemController) {
    const router = express.Router();

    router.get("/", controller.list);
    router.post("/",controller.create)
    router.delete("/:id",controller.delete);


    return router;

}