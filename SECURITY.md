# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |

## Reporting a Vulnerability

Do not open a public GitHub issue for a security problem.

Use GitHub Security Advisories from the repository Security tab and choose **Report a vulnerability**.

### Response targets

- Acknowledgement: 48 hours
- Initial assessment: 5 business days
- Critical fix target: 30 days

## Scope

Examples of issues that are in scope:

- SQL injection or unsafe query handling
- Path traversal via `DEBUG_RECORDER_DB`
- Sensitive data exposure in logs
- FTS5 query handling flaws

## Data Privacy

All session data is stored locally at `~/.mcp-debug-recorder/sessions.db` unless you override `DEBUG_RECORDER_DB`.

The package does not send debug history to external services. Streamable HTTP mode listens on localhost unless you place it behind your own proxy or tunnel.
