const { parseMemory } = require("./ai/memoryParser");

(async () => {
  const result = await parseMemory(
    "Tomorrow submit assignment urgent. Call mom every week. My goal is to get fit this year."
  );

  console.log(JSON.stringify(result, null, 2));
})();
