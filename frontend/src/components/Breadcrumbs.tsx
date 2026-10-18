import type {StorageItem} from "../types/storage-item.ts";

interface BreadcrumbsProps {
    history: StorageItem[];
    onRootClick: () => void;
    onFolderClick: (index: number) => void;
}

function Breadcrumbs({history, onRootClick, onFolderClick}: BreadcrumbsProps) {
    const isAtRoot = history.length === 0;

    return (
        <div className="flex flex-wrap items-center gap-1 text-sm">
            {isAtRoot ? (
                <span className="font-medium">Root</span>
            ) : (
                <button type="button" onClick={onRootClick} className="text-blue-700 hover:underline">
                    Root
                </button>
            )}

            {history.map((item, index) => {
                const isLast = index === history.length - 1;
                return (
                    <span key={item.id} className="flex items-center gap-1">
            <span className="text-slate-400">/</span>
                        {isLast ? (
                            <span className="font-medium">{item.name}</span>
                        ) : (
                            <button type="button" onClick={() => onFolderClick(index)}
                                    className="text-blue-700 hover:underline">
                                {item.name}
                            </button>
                        )}
          </span>
                );
            })}
        </div>
    );
}

export default Breadcrumbs;