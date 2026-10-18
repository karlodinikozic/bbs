import {useState} from "react";
import type {StorageItem} from "../types/storage-item.ts";

export function useFolderNavigation() {
    const [history, setHistory] = useState<StorageItem[]>([]);

    const currentFolder = history[history.length - 1] ?? null;
    const isRootFolder = history.length === 0;

    function openFolder(folder: StorageItem) {
        setHistory(prev => [...prev, folder])
    }

    function goBack() {
        setHistory(prev => prev.slice(0, -1))
    }

    function goToRoot() {
        setHistory([]);
    }

    function goTo(index: number) {
        setHistory(history.slice(0, index + 1));
    }

    return {currentFolder,history, openFolder, goBack,goToRoot,goTo, isRootFolder};
}