import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const mcp = JSON.parse(readFileSync('./mcp.json', 'utf8'));

mcp.version = pkg.version;

writeFileSync('./mcp.json', `${JSON.stringify(mcp, null, 2)}\n`);

console.log(`mcp.json version synced to ${pkg.version}`);
