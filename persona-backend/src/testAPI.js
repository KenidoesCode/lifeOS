const fetch = require("node-fetch");

async function test() {
  try {
    const res = await fetch("http://localhost:5000/health");
    const data = await res.json();
    console.log("✅ Backend reachable:", data);

    const res2 = await fetch("http://localhost:5000/api/ai/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Tomorrow submit assignment urgent. Call mom every week."
      })
    });
    const data2 = await res2.json();
    console.log("✅ AI parsing works:", JSON.stringify(data2, null, 2));
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

test();
