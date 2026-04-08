# Configuration

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `DEBUG_RECORDER_DB` | `~/.mcp-debug-recorder/sessions.db` | Overrides the SQLite database location. |
| `PORT` | `3000` | HTTP port for `npm run start:http`. |
| `LOG_LEVEL` | `info` | Minimum structured log level: `debug`, `info`, `warn`, or `error`. |
| `FUZZY_THRESHOLD` | `0.5` | Fuse.js threshold used by search reranking and fallback fuzzy search. |

## Example

```bash
DEBUG_RECORDER_DB=/tmp/debug-memory.db LOG_LEVEL=warn FUZZY_THRESHOLD=0.4 npx mcp-debug-recorder
```

## Operational guidance

- Use a dedicated `DEBUG_RECORDER_DB` path for scratch imports or project-isolated histories.
- Lower `FUZZY_THRESHOLD` for stricter search results; raise it slightly for typo-heavy workflows.
- Set `LOG_LEVEL=warn` in CI and e2e runs to reduce noise from migration logs.
