const { Expo } = require('expo-server-sdk');

const expo = new Expo();

// Görev atandığında bildirim gönder
const sendTaskAssignedNotification = async (pushToken, taskTitle, projectName) => {
  
  if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
    console.log('Geçersiz push token:', pushToken);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: 'Yeni Görev Atandı 📋',
    body: `"${taskTitle}" görevi sana atandı — ${projectName}`,
    data: { type: 'task_assigned' },
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Bildirim gönderildi:', ticket);
  } catch (error) {
    console.error('Bildirim hatası:', error);
  }
};

module.exports = { sendTaskAssignedNotification };