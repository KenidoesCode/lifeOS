export const scheduleNotification = async (title: string, body: string) => {
  console.log(`[Notification] ${title}: ${body}`);
};

export const requestNotificationPermission = async () => {
  return { granted: true };
};
