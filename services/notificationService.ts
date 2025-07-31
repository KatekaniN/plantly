import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData extends Record<string, unknown> {
  plantId: string;
  plantName: string;
  type: "watering" | "fertilizing" | "general";
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notifications and request permissions
  async initialize(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Failed to get push token for push notification!");
        return false;
      }

      // Get push token for development
      if (Device.isDevice) {
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          });
          this.expoPushToken = token.data;
          console.log("📱 Expo Push Token:", token.data);
        } catch (error) {
          console.log("Error getting push token:", error);
        }
      } else {
        console.log("Must use physical device for Push Notifications");
      }

      // Configure notification channels for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("plant-care", {
          name: "Plant Care Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4CAF50",
          sound: "default",
        });
      }

      return true;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return false;
    }
  }

  // Schedule a watering reminder
  async scheduleWateringReminder(
    plantId: string,
    plantName: string,
    wateringDate: Date,
    identifier?: string
  ): Promise<string | null> {
    try {
      const notificationId = identifier || `watering-${plantId}-${Date.now()}`;

      // Calculate trigger time (9 AM on the watering date)
      const triggerDate = new Date(wateringDate);
      triggerDate.setHours(9, 0, 0, 0);

      // Don't schedule if the date is in the past
      if (triggerDate <= new Date()) {
        console.log("⏰ Skipping past date notification for", plantName);
        return null;
      }

      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: `🌱 Time to water ${plantName}!`,
          body: `Your ${plantName} is ready for its next watering. Don't let it get thirsty! 💧`,
          data: {
            plantId,
            plantName,
            type: "watering",
            scheduledFor: wateringDate.toISOString(),
          } as NotificationData & { scheduledFor: string },
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: triggerDate,
          channelId: "plant-care",
        },
      });

      console.log(
        `📅 Scheduled watering reminder for ${plantName} at ${triggerDate.toLocaleString()}`
      );
      return notificationId;
    } catch (error) {
      console.error("Error scheduling watering reminder:", error);
      return null;
    }
  }

  // Schedule multiple reminders (day before, day of, overdue)
  async scheduleComprehensiveWateringReminders(
    plantId: string,
    plantName: string,
    wateringDate: Date
  ): Promise<string[]> {
    const scheduledIds: string[] = [];

    try {
      // 1. Day before reminder (8 PM)
      const dayBefore = new Date(wateringDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      dayBefore.setHours(20, 0, 0, 0);

      if (dayBefore > new Date()) {
        const dayBeforeId = await Notifications.scheduleNotificationAsync({
          identifier: `watering-reminder-${plantId}-${Date.now()}`,
          content: {
            title: `🌿 ${plantName} reminder`,
            body: `Tomorrow is watering day for your ${plantName}. Get ready! 🗓️`,
            data: {
              plantId,
              plantName,
              type: "watering",
              scheduledFor: wateringDate.toISOString(),
            } as NotificationData & { scheduledFor: string },
            sound: "default",
          },
          trigger: {
            date: dayBefore,
            channelId: "plant-care",
          },
        });
        scheduledIds.push(dayBeforeId);
      }

      // 2. Day of reminder (9 AM)
      const dayOfId = await this.scheduleWateringReminder(
        plantId,
        plantName,
        wateringDate,
        `watering-dayof-${plantId}-${Date.now()}`
      );
      if (dayOfId) scheduledIds.push(dayOfId);

      // 3. Overdue reminder (next day at 6 PM if not watered)
      const overdue = new Date(wateringDate);
      overdue.setDate(overdue.getDate() + 1);
      overdue.setHours(18, 0, 0, 0);

      const overdueId = await Notifications.scheduleNotificationAsync({
        identifier: `watering-overdue-${plantId}-${Date.now()}`,
        content: {
          title: `🚨 ${plantName} needs water!`,
          body: `Your ${plantName} is overdue for watering. Please check on it soon! 🆘`,
          data: {
            plantId,
            plantName,
            type: "watering",
            scheduledFor: wateringDate.toISOString(),
          } as NotificationData & { scheduledFor: string },
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: overdue,
          channelId: "plant-care",
        },
      });
      scheduledIds.push(overdueId);

      console.log(
        `📱 Scheduled ${scheduledIds.length} reminders for ${plantName}`
      );
      return scheduledIds;
    } catch (error) {
      console.error("Error scheduling comprehensive reminders:", error);
      return scheduledIds;
    }
  }

  // Cancel all notifications for a specific plant
  async cancelPlantNotifications(plantId: string): Promise<void> {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      const plantNotifications = scheduledNotifications.filter(
        (notification) => {
          const data = notification.content.data as unknown as NotificationData;
          return data?.plantId === plantId;
        }
      );

      for (const notification of plantNotifications) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }

      console.log(
        `🗑️ Cancelled ${plantNotifications.length} notifications for plant ${plantId}`
      );
    } catch (error) {
      console.error("Error cancelling plant notifications:", error);
    }
  }

  // Cancel a specific notification
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log(`🗑️ Cancelled notification: ${identifier}`);
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  }

  // Get all scheduled notifications for debugging
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🧹 Cleared all scheduled notifications");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  // Send immediate notification (for testing)
  async sendTestNotification(plantName: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🧪 Test notification`,
          body: `This is a test notification for ${plantName}!`,
          data: { type: "test" },
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }
}

export default NotificationService.getInstance();
