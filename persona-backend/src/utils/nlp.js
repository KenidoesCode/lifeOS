const normalizePriority = (text) => {
  if (/urgent|asap|important|critical/i.test(text)) return "High";
  if (/low priority|whenever/i.test(text)) return "Low";
  return "Medium";
};

const detectRecurring = (text) => {
  if (/every day|daily|every morning/i.test(text)) return "daily";
  if (/every week|weekly/i.test(text)) return "weekly";
  if (/every month|monthly/i.test(text)) return "monthly";
  return null;
};

const detectType = (text, recurring) => {
  if (/goal|my goal|aim to|this year|by end of/i.test(text)) return "goal";
  if (recurring) return "habit";
  return "task";
};

const cleanTitle = (text) =>
  text
    .replace(
      /(tomorrow|today|tonight|next week|next month|urgent|asap|important|every day|daily|every week|weekly|every month|monthly|goal|my goal is|this year|by end of)/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

module.exports = {
  normalizePriority,
  detectRecurring,
  detectType,
  cleanTitle,
};