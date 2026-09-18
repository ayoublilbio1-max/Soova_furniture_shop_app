// src/lib/notification-scheduler.ts — local, on-device reminder
// notifications (no backend/push service involved). Reschedules three
// independent repeating reminders — cart, wishlist, best seller — every
// time this is called, based on the app's live state at that moment. Each
// reminder only gets (re)scheduled if its condition is currently true; if
// a condition is no longer true, its notification is canceled instead.
//
// LIMITATION: because these are local notifications, their content is
// fixed at scheduling time — the OS fires them independently of the app
// process, so it can't re-check cart/wishlist state at the moment of
// firing. Content is only as fresh as the last time this function ran
// (called from Home whenever cart/wishlist state changes). If the user
// checks out between reschedules, the cart reminder may still fire once
// more with stale content until the next reschedule cancels it.

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CART_REMINDER_ID = "cart-reminder";
const WISHLIST_REMINDER_ID = "wishlist-reminder";
const BEST_SELLER_REMINDER_ID = "best-seller-reminder";

const REPEAT_INTERVAL_SECONDS = 2 * 60 * 60; // every 2 hours

// --- Show the alert even while the app is in the foreground, not just
// when backgrounded ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let androidChannelReady = false;

async function ensureAndroidChannel() {
  if (Platform.OS !== "android" || androidChannelReady) return;

  await Notifications.setNotificationChannelAsync("reminders", {
    name: "Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  androidChannelReady = true;
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelReminder(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Nothing was scheduled under this id — safe to ignore.
  }
}

async function scheduleRepeatingReminder(
  id: string,
  title: string,
  body: string,
) {
  await cancelReminder(id);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: REPEAT_INTERVAL_SECONDS,
      repeats: true,
    },
  });
}

async function sendImmediateReminder(title: string, body: string) {
  // trigger: null fires the notification right away, as a one-shot —
  // separate from the repeating background schedule below.
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}

export type ReminderConditions = {
  cartHasItems: boolean;
  wishlistHasItems: boolean;
  bestSellerName: string | null;
};

// --- Call this once per app open (Home does this on mount). Fires an
// immediate notification for each condition that's currently true, so
// opening the app itself is a trigger — separate from the every-2-hours
// background schedule below. ---
export async function sendAppOpenReminders({
  cartHasItems,
  wishlistHasItems,
  bestSellerName,
}: ReminderConditions) {
  await ensureAndroidChannel();
  const granted = await ensurePermission();
  if (!granted) return;

  if (cartHasItems) {
    await sendImmediateReminder(
      "You left something behind",
      "There's still an item in your cart — complete your order before it's gone.",
    );
  }

  if (wishlistHasItems) {
    await sendImmediateReminder(
      "Your wishlist misses you",
      "Take another look at the pieces you saved and treat yourself.",
    );
  }

  if (bestSellerName) {
    await sendImmediateReminder(
      "Trending right now",
      `${bestSellerName} is one of our best sellers — check it out.`,
    );
  }
}

// --- Call this whenever cart/wishlist state changes (Home does this).
// Each of the three reminders is independently scheduled or canceled
// based on whether its own condition currently holds. This is what keeps
// firing every 2 hours in the background, even while the app is closed —
// the OS owns this schedule once it's set. ---
export async function rescheduleReminderNotifications({
  cartHasItems,
  wishlistHasItems,
  bestSellerName,
}: ReminderConditions) {
  await ensureAndroidChannel();
  const granted = await ensurePermission();
  if (!granted) return;

  if (cartHasItems) {
    await scheduleRepeatingReminder(
      CART_REMINDER_ID,
      "You left something behind",
      "There's still an item in your cart — complete your order before it's gone.",
    );
  } else {
    await cancelReminder(CART_REMINDER_ID);
  }

  if (wishlistHasItems) {
    await scheduleRepeatingReminder(
      WISHLIST_REMINDER_ID,
      "Your wishlist misses you",
      "Take another look at the pieces you saved and treat yourself.",
    );
  } else {
    await cancelReminder(WISHLIST_REMINDER_ID);
  }

  if (bestSellerName) {
    await scheduleRepeatingReminder(
      BEST_SELLER_REMINDER_ID,
      "Trending right now",
      `${bestSellerName} is one of our best sellers — check it out.`,
    );
  } else {
    await cancelReminder(BEST_SELLER_REMINDER_ID);
  }
}
