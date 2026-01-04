import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/* =========================
   CONFIGURA COMO NOTIFICA
========================= */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // mostra popup
    shouldPlaySound: true,     // toca som
    shouldSetBadge: false,    // badge no ícone (opcional)
  }),
});

/* =========================
   PERMISSÃO
========================= */
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/* =========================
   ANDROID: CANAL
========================= */
export async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("debts", {
      name: "Debt reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }
}
