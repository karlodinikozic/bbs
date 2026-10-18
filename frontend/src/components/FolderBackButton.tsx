
interface FolderBackButtonProps {
    onClick?: () => void;
}

function FolderBackButton({onClick}: FolderBackButtonProps) {
    return (
        <button onClick={onClick} className="text-sm text-blue-700 hover:underline"> BACK </button>
    );
}

export default FolderBackButton;