# File System

A browser-based file system, similar to Dropbox's web interface. Users can create folders and files, browse nested folders, search by exact name, get autocomplete suggestions while typing, and delete files or whole folders.

Per the task, a file is just its name. There is no file content or upload.

## Tech stack

**Backend:** Node.js 24, Express 5, TypeScript, Prisma 7 with SQLite (`better-sqlite3` driver adapter), Awilix (dependency injection), Zod (validation)

**Frontend:** React, Vite, TypeScript, Tailwind CSS

## Running the app

### Option 1: Docker (one command)

Requirements: Docker with Docker Compose.

```bash
docker compose up --build
```

- App: http://localhost:8080
- API: http://localhost:3000/api

Data is stored in a Docker volume, so it survives restarts. To stop and delete all data:

```bash
docker compose down -v
```

### Option 2: Local development (debug mode)

Requirements: Node.js 24 and npm.

**Backend**

```bash
cd backend
cp .env.example .env
mkdir -p data
npm install                  # also generates the Prisma client
npx prisma migrate deploy    # creates the SQLite database
npm run dev                  # API on http://localhost:3000
```

To run with a debugger attached, use `npm run debug` instead of `npm run dev`. It starts Node with `--inspect` on port 9229:

- **WebStorm:** Run → Attach to Node.js/Chrome, port 9229
- **VS Code:** Run and Debug → "Attach to Node Process"

**Frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev                  # app on http://localhost:5173
```

In development, Vite forwards `/api` requests to the backend on port 3000, so no CORS setup is needed. Source maps are enabled, so breakpoints work in the browser's DevTools.

### Trying the API directly

`backend/requests.http` contains ready-made requests for every endpoint. Run them with WebStorm's built-in HTTP Client or the VS Code REST Client extension.

## API

All endpoints are under `/api/storage-items`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a file or folder. Body: `{ "name": string, "type": "FILE" \| "FOLDER", "parentId"?: string }`. Returns `201` with the created item. |
| `GET` | `/?parentId=` | List the contents of a folder, or the root when `parentId` is omitted. Folders first, then alphabetical. |
| `GET` | `/search?name=&parentId=` | Find items with exactly this name, across everything or inside a folder (including its subfolders). Returns up to 50 results. |
| `GET` | `/autocomplete?prefix=` | Top 10 files whose names start with `prefix`. |
| `DELETE` | `/:id` | Delete a file, or a folder with everything inside it. Returns `204`. |

`GET /api/health` returns `{ "status": "ok" }` and is used by the Docker healthcheck.

**Errors** are returned as JSON with a matching status code:

| Status | When |
|---|---|
| `400` | Invalid input (details per field), or the parent is a file |
| `404` | The item or parent folder doesn't exist, or the route is unknown |
| `409` | An item with the same name already exists in that folder |
| `500` | Unexpected error (details are logged, not exposed) |

## Project structure

```
backend/
├── prisma/                       # schema and migrations
└── src/
    ├── modules/
    │   └── storage-items/        # the feature: model, dto, repository, service, controller, routes
    ├── shared/                   # database client, error classes, error handler
    ├── container.ts              # dependency injection wiring
    ├── app.ts                    # Express app (middleware + routes)
    └── server.ts                 # starts the server

frontend/src/
├── api/                          # API client and one function per endpoint
├── components/                   # UI components
├── hooks/                        # folder navigation state
└── types/                        # shared TypeScript types
```

Requests flow through **routes → controller → service → repository → database**. Each layer has one job:

- **Controllers** validate input with Zod and send responses. They contain no logic.
- **Services** hold all business rules: parent checks, duplicate names, building paths.
- **Repositories** are the only place that talks to Prisma.

The service depends on a repository **interface**, not on Prisma. Awilix wires the concrete classes together in `container.ts`, so the service can be tested with an in-memory fake repository.

## Design decisions

**One table for files and folders.** `StorageItem` has a `type` of `FILE` or `FOLDER`. Files and folders share almost everything, so a single table keeps queries simple.

**UUID v7 IDs.** IDs can be generated anywhere without a central counter, don't reveal how many items exist, and are time-ordered, so they don't fragment the index the way random UUIDs do.

**Tree storage: `parentId` + materialized path.** Each item stores its parent's ID and a `path` made of its ancestors' IDs (e.g. `/kipoId/ladaId`).

- `parentId` makes listing a folder a simple indexed lookup.
- `path` makes subtree operations a single query: deleting a folder removes everything whose path starts with the folder's own path, and folder-scoped search uses the same prefix.

**Indexes.**

- Unique `(parentId, name)` makes folder listings fast and blocks duplicate names in a folder.
- `name` makes search and autocomplete fast.
- `path` makes subtree deletes and folder-scoped search fast.

**Duplicate names at the root.** SQLite treats `NULL` values as distinct in unique indexes, so the database alone wouldn't block two root items with the same name. The service checks for duplicates before inserting, and a unique-constraint violation from a race condition is still mapped to `409`.

**Autocomplete uses a range query, not `LIKE`.** `name >= prefix AND name < prefix + U+10FFFF` matches exactly the names starting with the prefix, but unlike `LIKE 'prefix%'`, SQLite can use the `name` index for it. It stays fast with millions of rows and avoids issues with `%` and `_` in names. Results are limited to 10 in the database query, not in memory.

**Frontend.** The open folder is kept as a history of opened folders, which powers both navigation and breadcrumbs. Autocomplete requests are debounced (300 ms), and outdated requests are cancelled with `AbortController`, so slower old responses can't overwrite newer results.

## Assumptions

- **Search within a folder includes its subfolders.** Because names are unique per folder, searching only direct children could return at most one item.
- **Autocomplete returns files only and searches all files,** as described in the task.
- **Name matching is case-sensitive.**
- **Duplicate names are not allowed within the same folder,** like a real file system. The same name in different folders is fine.

## Known limitations and future improvements

- **Case-insensitive search:** add a lowercase `nameLower` column with its own index.
- **Breadcrumbs after search:** opening a folder from search results appends it to the current breadcrumb trail instead of showing its real ancestors. An endpoint returning a folder's ancestors (their IDs are already in `path`) would fix this.
- **Pagination** for very large folders and search results.
- **Rename and move:** moving a folder would also need to update the `path` of everything inside it, in one transaction.
- **Real file storage:** file bytes would go to disk or S3-compatible storage (e.g. MinIO), with `storageKey`, `size`, and `mimeType` added to `StorageItem`.