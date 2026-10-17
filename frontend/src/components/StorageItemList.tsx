import type {StorageItem} from "../types/storage-item.ts";
import StorageItemComponent from "./StorageItemComponent.tsx";

interface StorageItemListProps {
    items: StorageItem[];
    onFolderClick: (item: StorageItem) => void;
}

function StorageItemList({items,onFolderClick}: StorageItemListProps) {
    if (!items || items.length < 1) {
        return <p className="py-4 text-slate-500">This folder is empty.</p>;
    }

    return (
        <div className="divide-y divide-slate-100 rounded border border-slate-200">
            {items.map(item => {
                return <StorageItemComponent onClick={onFolderClick} item={item} key={item.id}/>;
            })}
        </div>
    );
}

export default StorageItemList;