#!/Users/muhammed/.bun/bin/bun

try {
  await import(new URL("../src/commands/lanes-cli.ts", import.meta.url).href);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
