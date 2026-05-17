const { parseMemory } = require("./ai/memoryParser");

async function main() {
  try {
    const result = await parseMemory(
      "Tomorrow submit assignment urgent. Call mom every week. I want to get fit this year."
    );
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ testMemory failed:", err?.message || err);
    process.exitCode = 1;
  }
}

main();
