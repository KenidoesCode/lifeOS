const Mistral = require("@mistralai/mistralai");
const chrono = require("chrono-node");

const client = new Mistral.Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function parseMemory(text) {
  const now = new Date();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 0, 0);

  const prompt = `Extract tasks from this text. For each task return ONLY:
- title: clean title, remove "I need to/have to/should"
- type: "task", "habit", or "goal"
- priority: "High" if urgent/exam/deadline/tax OR if "today" is mentioned OR if "buy/get/pick up/groceries" + "today", "Low" if this weekend/weekend/someday/eventually, else "Medium"
- recurring: "daily" if every day/morning/night, "weekly" if every week, else null
- dueAt: today if "today/tonight/now" mentioned, this coming Saturday if "this weekend", next [day] if "by next [day]/next [weekday]", else let chrono-node parse

Return ONLY raw JSON:
{"tasks":[{"title":"...","type":"...","priority":"...","dueAt":"...","recurring":null}]}

Text: ${text}`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" },
  });

  const content = response.choices[0].message.content.trim();
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Handle dates with chrono-node (reliable)
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  
  const tasksWithDates = parsed.tasks.map((task) => {
  // Find the sentence that best matches this task
  const titleWords = task.title.toLowerCase().split(" ").filter(w => w.length > 3);
  const matchedSentence = sentences.find(s => 
    titleWords.some(w => s.toLowerCase().includes(w))
  ) || text;
  
  const t = matchedSentence.toLowerCase();
  const todayWords = ["today", "tonight", "now", "urgent", "asap", "keep forgetting", "already late", "badly", "before they die", "nothing at home"];
  const isTodayTask = todayWords.some(w => t.includes(w));

  let dueAt = null;
  
  // 1. Check if isTodayTask (strict today keywords) → dueAt = today
  if (isTodayTask) {
    dueAt = todayEnd.toISOString();
  }
  // 2. ELSE check if task.recurring → dueAt = today (habits always today)
  else if (task.recurring) {
    dueAt = todayEnd.toISOString();
  }
  // 3. ELSE run chrono.parse for future dates
  else {
    const parsed2 = chrono.parse(matchedSentence, now, { forwardDate: true });
    if (parsed2.length > 0) {
      dueAt = parsed2[0].start.date().toISOString();
    }
  }

  // 4. ELSE if still no date → set 6 months future
  if (!dueAt) {
    const farFuture = new Date();
    farFuture.setMonth(farFuture.getMonth() + 6);
    farFuture.setHours(23, 59, 0, 0);
    dueAt = farFuture.toISOString();
  }

  return { ...task, dueAt };
});

  return { tasks: tasksWithDates };
}

module.exports = { parseMemory };
