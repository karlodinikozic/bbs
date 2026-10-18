import  {useEffect, useState} from 'react';
import type {StorageItem} from "../types/storage-item.ts";
import {useDebounce} from "use-debounce";
import {autoCompleteStorageItem} from "../api/storage-items.api.ts";
import {File} from "lucide-react";

interface AutoCompleteStorageItemProps {
    searchTerm: string;
    isOpen: boolean;
    onSelect: (item: StorageItem) => void;
}

function AutoCompleteStorageItem({searchTerm, onSelect, isOpen}: AutoCompleteStorageItemProps) {
    const [dSearchTerm] = useDebounce(searchTerm,300)

    const [itemList, setItemList] = useState<StorageItem[]>([]);

    useEffect(() => {
        const prefix =dSearchTerm.trim()
        if(!prefix){
            return;
        }
        const controller = new AbortController()
        autoCompleteStorageItem(prefix, controller.signal)
            .then(setItemList)
            .catch(console.error)

        return () => controller.abort()

    }, [dSearchTerm]);

    if(!isOpen || itemList.length < 1 || dSearchTerm.trim().length === 0){
        return <p>No items for suggestion</p>
    }

    return (
        <div className="inset-x-0 top-full z-10 mt-1 rounded border border-slate-200 bg-white shadow-sm">
            {itemList.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelect(item)}
                    className="block w-full px-3 py-1.5 text-left hover:bg-slate-50"
                >
                    <div className="flex items-center gap-2 px-3 py-2">
                        <File className="size-4  text-slate-400" aria-hidden="true"/>
                        {item.name}
                    </div>
                </button>
            ))}
        </div>
    );
}

export default AutoCompleteStorageItem;