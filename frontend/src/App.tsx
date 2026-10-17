import FileExplorer from "./components/FileExplorer.tsx";

function App() {
    return (
        <main className="mx-auto max-w-3xl p-8 text-slate-800">
            <h1 className="mb-6 text-2xl font-semibold">File System</h1>
            <FileExplorer/>
        </main>
    )
}

export default App
