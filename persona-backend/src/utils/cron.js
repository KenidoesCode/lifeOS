const fetch = require("node-fetch");

async function sendPushNotification(pushToken, title, body) {
  if (!pushToken) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: pushToken, title, body }),
  });
}

module.exports = { sendPushNotification };