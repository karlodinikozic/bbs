import React, {useCallback, useEffect, useState} from 'react';
import {type StorageItem, StorageItemType} from "../types/storage-item.ts";
import {deleteStorageItem, getStorageItems} from "../api/storage-items.api.ts";
import StorageItemList from "./StorageItemList.tsx";
import {useFolderNavigation} from "../hooks/useFolderNavigation.ts";
import FolderBackButton from "./FolderBackButton.tsx";
import CreateStorageItemForm from "./CreateStorageItemForm.tsx";
import SearchStorageItem from "./SearchStorageItem.tsx";
import Breadcrumbs from "./Breadcrumbs.tsx";

function FileExplorer() {
    const [items, setItems] = React.useState<StorageItem[]>([]);
    const [searchResults, setSearchResults] = useState<StorageItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const {currentFolder,history, goBack,goTo,goToRoot, isRootFolder, openFolder} = useFolderNavigation()

    const loadItems = useCallback(() => {
        getStorageItems(currentFolder?.id ?? null)
            .then(setItems)
            .catch((err: Error) => setError(err.message));
    }, [currentFolder?.id, setItems]);

    useEffect(() => {
        loadItems()
    }, [loadItems]);

    function handleFolderChange(folder: StorageItem) {
        setSearchResults(null)
        openFolder(folder);
    }

    async function handleDelete(item: StorageItem) {
        const msg = item.type === StorageItemType.FOLDER ?
            `Delete Folder ${item.name} and everything inside it ?` :
            `Delete File ${item.name} `;
        const confirmed = window.confirm(msg)
        if (!confirmed) {
            return;
        }

        try {
            await deleteStorageItem(item.id)
            loadItems()
        } catch (error: any) {
            setError(error.message)
        }

    }


    const isSearching = searchResults !== null;
    if (error) {
        return <p className="text-red-600">Error: {error}</p>;
    }

    return (
        <div className="space-y-4">
            <SearchStorageItem
                currentFolderId={currentFolder?.id ?? null}
                onResults={setSearchResults}
                onClear={() => setSearchResults(null)}
            />

            {!isSearching && <CreateStorageItemForm onCreated={loadItems} parentId={currentFolder?.id ?? null}/>}
            {!isRootFolder && !isSearching && <FolderBackButton onClick={goBack}/>}
            {!isSearching && (
                <Breadcrumbs history={history} onRootClick={goToRoot} onFolderClick={goTo} />
            )}
            <StorageItemList
                onDelete={handleDelete}
                onFolderClick={handleFolderChange}
                items={isSearching ? searchResults : items}/>
        </div>
    );
}

export default FileExplorer;