import {type StorageItem, StorageItemType} from "../types/storage-item.ts";
import {File, Folder} from "lucide-react";

interface StorageItemProps {
    item: StorageItem;
    onClick: (item: StorageItem) => void;
}

function StorageItemComponent(props: StorageItemProps) {
    if (props.item.type === StorageItemType.FOLDER) {
        return <StorageItemFolder {...props} />
    }
    return <StorageItemFile {...props} />
}

function StorageItemFile({item}: StorageItemProps) {
    return <div className="flex items-center gap-2 px-3 py-2">
        <File className="size-4 text-slate-400" aria-hidden="true"/>
        {item.name}
    </div>
}

function StorageItemFolder({item, onClick}: StorageItemProps) {
    return <button onClick={onClick.bind(null, item)} type="button" className="flex items-center gap-2 px-3 py-2">
        <Folder className="size-4 text-slate-400" aria-hidden="true"/>
        {item.name}
    </button>
}


export default StorageItemComponent;