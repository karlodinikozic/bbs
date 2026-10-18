import {type StorageItem, StorageItemType} from "../types/storage-item.ts";
import {File, Folder, Trash2} from "lucide-react";

interface StorageItemProps {
    item: StorageItem;
    onClick: (folderId: StorageItem) => void;
    onDelete: (item: StorageItem) => void;
}

function StorageItemComponent(props: StorageItemProps) {
    function handleItemDelete() {
        props.onDelete(props.item)
    }

    if (props.item.type === StorageItemType.FOLDER) {
        return <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-50">
            <StorageItemFolder {...props} />
            <button type="button" onClick={handleItemDelete}
                    className="text-slate-400 hover:text-red-600">
                <Trash2 className="size-4 text-red-600"/>
            </button>
        </div>
    }
    return <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-50">
        <StorageItemFile {...props} />
        <button type="button" onClick={handleItemDelete} className="text-slate-400 hover:text-red-600">
            <Trash2 className="size-4 text-red-600"/>
        </button>
    </div>
}

export function StorageItemFile({item}: StorageItemProps) {
    return <div className="flex items-center gap-2 px-3 py-2">
        <File className="size-4  text-slate-400" aria-hidden="true"/>
        {item.name}
    </div>
}

function StorageItemFolder({item, onClick}: StorageItemProps) {
    return <button onClick={onClick.bind(null, item)} type="button"
                   className="flex w-full items-center gap-2 px-3 py-2">
        <Folder className="size-4 text-orange-400" aria-hidden="true"/>
        {item.name}
    </button>
}


export default StorageItemComponent;