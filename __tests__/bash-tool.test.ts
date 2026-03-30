// Smoke test for bash-tool — run with: npx tsx __tests__/bash-tool.test.ts
import { initBashWithFiles, listBashFiles, readBashFile, bashExec } from "../lib/agents/bash-tool";

const ctx = { toolCallId: "t1", messages: [] as never[], abortSignal: new AbortController().signal };

async function run(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}: ${e}`);
    process.exitCode = 1;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function main() {
  console.log("bash-tool smoke tests\n");

  // Setup
  await initBashWithFiles({
    "/data/test.csv": "name,age\nAlice,30\nBob,25",
    "/data/results.json": '{"count":2,"items":["a","b"]}',
  });

  await run("echo command works", async () => {
    const r = await bashExec.execute({ command: "echo hello" }, ctx);
    assert(r.stdout.trim() === "hello", `expected "hello", got "${r.stdout.trim()}"`);
    assert(r.exitCode === 0, `expected exit 0, got ${r.exitCode}`);
  });

  await run("reads seeded CSV", async () => {
    const r = await bashExec.execute({ command: "cat /data/test.csv" }, ctx);
    assert(r.stdout.includes("Alice,30"), "missing Alice,30");
  });

  await run("writes and reads files", async () => {
    await bashExec.execute({ command: 'printf "x,y\\n1,2" > /data/new.csv' }, ctx);
    const r = await bashExec.execute({ command: "cat /data/new.csv" }, ctx);
    assert(r.stdout.includes("x,y"), "missing x,y in new.csv");
  });

  await run("unavailable commands fail", async () => {
    const r = await bashExec.execute({ command: "python3 --version" }, ctx);
    assert(r.exitCode !== 0 || r.stderr.length > 0, "python3 should fail");
  });

  await run("listBashFiles returns files with sizes", async () => {
    const files = await listBashFiles();
    const paths = files.map((f) => f.path);
    assert(paths.includes("/data/test.csv"), "missing test.csv");
    assert(paths.includes("/data/results.json"), "missing results.json");
    assert(paths.includes("/data/new.csv"), "missing new.csv");
    for (const f of files) {
      assert(f.size > 0, `${f.path} has size ${f.size}`);
    }
  });

  await run("readBashFile returns content", async () => {
    const content = await readBashFile("/data/results.json");
    const parsed = JSON.parse(content);
    assert(parsed.count === 2, `expected count 2, got ${parsed.count}`);
  });

  await run("readBashFile returns empty for missing file", async () => {
    const content = await readBashFile("/data/nope.txt");
    assert(content === "", `expected empty, got "${content}"`);
  });

  console.log("\ndone");
}

main();
