import express from "express";
import cors from "cors";
import {storageItemRoutes} from "./modules/storage-item.route";
import {container} from "./container";

export const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/storage-items",storageItemRoutes(container.resolve("storageItemController")))

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});