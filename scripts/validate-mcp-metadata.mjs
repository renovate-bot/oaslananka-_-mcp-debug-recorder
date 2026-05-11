import fs from 'node:fs';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const pkg = readJson('package.json');
const mcp = readJson('mcp.json');
const server = readJson('server.json');

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(pkg.name === 'mcp-debug-recorder', 'package.json name must be mcp-debug-recorder');
assert(pkg.mcpName === 'io.github.oaslananka/mcp-debug-recorder', 'package.json mcpName must match registry id');
assert(mcp.mcpName === pkg.mcpName, 'mcp.json mcpName must match package.json');
assert(server.name === pkg.mcpName, 'server.json name must match package.json mcpName');
assert(server.packages?.[0]?.identifier === pkg.name, 'server.json npm identifier must match package name');
assert(server.packages?.[0]?.version === pkg.version, 'server.json version must match package version');
assert(server.repository?.url === 'https://github.com/oaslananka-lab/mcp-debug-recorder', 'server.json repository must point at the org CI/CD repo');
for (const file of ['dist', 'mcp.json', 'server.json', 'README.md', 'LICENSE', 'CHANGELOG.md', 'SECURITY.md']) {
  assert(pkg.files?.includes(file), `package files must include ${file}`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('MCP metadata OK');
