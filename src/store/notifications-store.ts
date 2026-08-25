import { Ionicons } from "@expo/vector-icons";
import { create } from "zustand";

export type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

type NotificationsState = {
  notifications: NotificationItem[];
  markAsRead: (id: string, read: boolean) => void;
  deleteOne: (id: string) => void;
  bulkMarkAsRead: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    icon: "checkmark-circle-outline",
    title: "Order Shipped",
    message:
      "Your order #SF-10482 has shipped and is on its way. Estimated delivery in 3-5 business days.",
    time: "2h ago",
    isRead: false,
  },
  {
    id: "n2",
    icon: "flash-outline",
    title: "Flash Sale Started",
    message:
      "Up to 50% off selected chairs, for a limited time. Don't miss out on this weekend's deals.",
    time: "5h ago",
    isRead: false,
  },
  {
    id: "n3",
    icon: "person-outline",
    title: "Welcome to Soova",
    message:
      "Complete your profile to get personalized picks and faster checkout on future orders.",
    time: "1d ago",
    isRead: true,
  },
];

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: INITIAL_NOTIFICATIONS,
  markAsRead: (id, read) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, isRead: read } : item
      ),
    })),
  deleteOne: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
    })),
  bulkMarkAsRead: (ids) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        ids.includes(item.id) ? { ...item, isRead: true } : item
      ),
    })),
  bulkDelete: (ids) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (item) => !ids.includes(item.id)
      ),
    })),
}));