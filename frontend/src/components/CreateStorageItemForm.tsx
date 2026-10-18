import React, {useState} from 'react';
import {StorageItemType} from "../types/storage-item";

import {createStorageItem} from "../api/storage-items.api.ts";

interface CreateStorageItemFormProps {
    parentId: string | null;
    onCreated:() => void;
}

function CreateStorageItemForm({parentId,onCreated}: CreateStorageItemFormProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<StorageItemType>(StorageItemType.FOLDER);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        try {
            await createStorageItem({name, type, parentId});
            setName("");
            onCreated()
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
                <input
                    onChange={e => setName(e.target.value)}
                    type="text"
                    value={name}
                    placeholder="File name"
                    className="flex-1 rounded border border-slate-300 px-3 py-1.5"
                />
                <select
                    value={type}
                    onChange={e => setType(e.target.value as StorageItemType)}
                    className="rounded border border-slate-300 px-2 py-1.5">
                    <option value={StorageItemType.FOLDER}>{StorageItemType.FOLDER}</option>
                    <option value={StorageItemType.FILE}>{StorageItemType.FILE}</option>
                </select>
                <button
                    type="submit"
                    disabled={name.trim().length === 0}
                    className="rounded bg-slate-800 px-4 py-1.5 text-white disabled:opacity-50">
                    Create {type}
                </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
    );
}

export default CreateStorageItemForm;