-- CreateTable
CREATE TABLE "StorageItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StorageItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "StorageItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StorageItem_name_idx" ON "StorageItem"("name");

-- CreateIndex
CREATE INDEX "StorageItem_path_idx" ON "StorageItem"("path");

-- CreateIndex
CREATE UNIQUE INDEX "StorageItem_parentId_name_key" ON "StorageItem"("parentId", "name");
