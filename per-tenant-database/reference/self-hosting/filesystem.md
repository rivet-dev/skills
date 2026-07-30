# File System

> Source: `src/content/docs/self-hosting/filesystem.mdx`
> Canonical URL: https://rivet.dev/docs/self-hosting/filesystem
> Description: The file system backend stores all data on the local disk. This is suitable for single-node deployments, development, and testing.

---
For a single-node deployment, use the file system backend (RocksDB-based). For multi-node deployments, PostgreSQL is the recommended backend, production-ready for light-to-moderate workloads (up to roughly 1,000 concurrent actors). Enterprise teams running larger or high-throughput realtime workloads can contact [enterprise support](https://rivet.dev/sales) about FoundationDB.

## Configuration

```json Configuration-file
{
  "file_system": {
    "path": "/var/lib/rivet/data"
  }
}
```

```bash Environment-variables
RIVET__file_system__path="/var/lib/rivet/data"
```

## Default Paths

If no path is specified, Rivet uses platform-specific default locations:

- Linux: `~/.local/share/rivet-engine/db`
- macOS: `~/Library/Application Support/rivet-engine/db`
- Windows: `%APPDATA%\rivet-engine\db`

When running in a container or as a service, the path defaults to `./data/db` relative to the working directory.

## When to Use File System

The file system backend is ideal for:

- Local development
- Single-node deployments
- Testing and prototyping
- Air-gapped environments without database infrastructure

Use this backend for single-node setups. For multi-node deployments, PostgreSQL is the recommended backend, production-ready for light-to-moderate workloads (up to roughly 1,000 concurrent actors). Enterprise teams running larger or high-throughput realtime workloads can contact [enterprise support](https://rivet.dev/sales) about FoundationDB.

_Source doc path: /docs/self-hosting/filesystem_
