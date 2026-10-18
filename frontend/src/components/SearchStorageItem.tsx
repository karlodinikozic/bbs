import React, {useState} from 'react';
import {type StorageItem} from "../types/storage-item.ts";
import {searchStorageItem} from "../api/storage-items.api.ts";
import AutoCompleteStorageItem from "./AutoCompleteStorageItem.tsx";


type SearchLocationType = "all" | "folder"

interface SearchStorageItemProps {
    currentFolderId: StorageItem["id"];
    onResults: (items: StorageItem[]) => void;
    onClear: () => void;
}

function SearchStorageItem({currentFolderId, onResults, onClear}: SearchStorageItemProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [scope, setScope] = useState<SearchLocationType>("folder");
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsOpen(false)
        const name = searchTerm.trim()
        if (!name) {
            return;
        }
        setError(null);
        await handleSearch(name);

    }

    function handleClear() {
        setSearchTerm("");
        setError(null);
        onClear();
    }

    async function handleSearch(name: StorageItem["name"]) {
        try {
            const parentId = scope === "folder" ? currentFolderId : null;
            onResults(await searchStorageItem(name, parentId))
        } catch (error: any) {
            setError(error.message);
        }
    }

    async function handleAutoCompleteSelect(item: StorageItem) {
        setSearchTerm(item.name);
        setIsOpen(false);
        await handleSearch(item.name);
    }


    return (
        <form onSubmit={handleSubmit} className="relative space-y-2 w-full ">
            <div className="flex gap-2">
                <input type="text"
                       value={searchTerm}
                       onChange={(e) => {
                           setSearchTerm(e.target.value);
                           setIsOpen(true);
                       }}
                       onBlur={() => setIsOpen(false)}
                       placeholder="Search by name..."
                       className="flex-1 rounded border border-slate-300 px-3 py-1.5"
                />
                <select
                    value={scope}
                    onChange={e => setScope(e.target.value as SearchLocationType)}
                    className="rounded border border-slate-300 px-2 py-1.5">
                    <option value="folder">Folder</option>
                    <option value="all">All</option>
                </select>

                <button
                    type="submit"
                    className="rounded bg-slate-800 px-4 py-1.5 text-white">
                    Search
                </button>
                <button type="button" onClick={handleClear}
                        className="px-2 text-sm text-slate-500 hover:text-slate-800">
                    Clear
                </button>
            </div>
            {searchTerm && <AutoCompleteStorageItem searchTerm={searchTerm} isOpen={isOpen} onSelect={handleAutoCompleteSelect}/>}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
    );
}

export default SearchStorageItem;