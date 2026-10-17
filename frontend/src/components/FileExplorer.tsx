import React, {useEffect, useState} from 'react';
import type {StorageItem} from "../types/storage-item.ts";
import {getStorageItems} from "../api/storage-items.api.ts";
import StorageItemList from "./StorageItemList.tsx";

function FileExplorer() {
    const [items, setItems] = React.useState<StorageItem[]>([]);
    const [folderParentId, setFolderParentID] = useState<StorageItem["parentId"]>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getStorageItems(folderParentId)
            .then((items) => setItems(items))
            .catch((error) => setError(error.message));
    }, [folderParentId]);

    function handleFolderChange(item: StorageItem) {
     
        setFolderParentID(item.id);
    }


    if (error) {
        return <p className="text-red-600">Error: {error}</p>;
    }


    return (
        <div className="space-y-4">
            <StorageItemList onFolderClick={handleFolderChange} items={items} />
        </div>
    );
}

export default FileExplorer;