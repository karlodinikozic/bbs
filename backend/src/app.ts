import express from "express";
import cors from "cors";
import {container} from "./container";
import {errorHandler, notFoundHandler} from "./shared/errors/error-handler";
import {storageItemRoutes} from "./modules/storage-items/storage-item.route";

export const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/storage-items",storageItemRoutes(container.resolve("storageItemController")))

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use(notFoundHandler)
app.use(errorHandler);