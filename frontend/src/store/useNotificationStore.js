// store/useNotificationStore
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";


export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isCountLoading: false,

  getNotifications: async () => {
    const selectedUser = useChatStore.getState().selectedUser;
    const selectedUserId = selectedUser?._id || null
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/notifications");
      const allNotifications = res.data;
      console.log(selectedUserId, get().unreadCount, allNotifications);
      
    const filteredNotifications = selectedUserId
      ? allNotifications.filter(notif => notif.sender._id !== selectedUserId)
      : allNotifications;

    set({ notifications: filteredNotifications })
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load notifications");
    } finally {
      set({ isLoading: false });
    }
  },

  getUnreadCount: async () => {
    set({ isCountLoading: true });
    try {
      const res = await axiosInstance.get("/notifications/unread-count");
      set({ unreadCount: res.data.count });
    } catch (error) {
      console.error("Failed to get notification count:", error);
    } finally {
      set({ isCountLoading: false });
    }
  },

  markAsRead: async (notificationIds) => {
    try {
      await axiosInstance.put("/notifications/mark-read", { notificationIds });
      
      set(state => ({
        notifications: state.notifications.map(notif => 
          notificationIds.includes(notif._id) 
            ? { ...notif, isRead: true } 
            : notif
        ),
        unreadCount: state.unreadCount - notificationIds.filter(id => 
          state.notifications.find(n => n._id === id && !n.isRead)
        ).length
      }));
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await axiosInstance.put("/notifications/mark-all-read");
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
        unreadCount: 0
      }));
      
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      
      // Update local state
      set(state => {
        const notif = state.notifications.find(n => n._id === notificationId);
        const unreadDelta = notif && !notif.isRead ? 1 : 0;
        
        return {
          notifications: state.notifications.filter(notif => notif._id !== notificationId),
          unreadCount: Math.max(0, state.unreadCount - unreadDelta)
        };
      });
      
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  },

  acceptFriendRequest: async (notificationId) => {
    try {
      const res = await axiosInstance.post(`/notifications/friend-request/${notificationId}/accept`);
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        ),
        unreadCount: state.unreadCount - (state.notifications.find(n => n._id === notificationId && !n.isRead) ? 1 : 0)
      }));
      
      toast.success("Friend request accepted");
      
      // Return the new friend data for potential use
      return res.data.friend;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept friend request");
      return null;
    }
  },

  declineFriendRequest: async (notificationId) => {
    try {
      await axiosInstance.post(`/notifications/friend-request/${notificationId}/decline`);
      
      // Update local state
      set(state => {
        const notif = state.notifications.find(n => n._id === notificationId);
        const unreadDelta = notif && !notif.isRead ? 1 : 0;
        
        return {
          notifications: state.notifications.filter(notif => notif._id !== notificationId),
          unreadCount: Math.max(0, state.unreadCount - unreadDelta)
        };
      });
      
      toast.success("Friend request declined");
    } catch (error) {
      toast.error("Failed to decline friend request");
    }
  },

  // Add a new notification (used with socket)
  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  // Handle when a notification is marked read via socket
  handleNotificationsMarkedRead: (notificationIds) => {
    set(state => ({
      notifications: state.notifications.map(notif => 
        notificationIds.includes(notif._id) 
          ? { ...notif, isRead: true } 
          : notif
      ),
      unreadCount: state.unreadCount - notificationIds.filter(id => 
        state.notifications.find(n => n._id === id && !n.isRead)
      ).length
    }));
  },

  // Handle when all notifications are marked read via socket
  handleAllNotificationsMarkedRead: () => {
    set(state => ({
      notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
      unreadCount: 0
    }));
  },

  // Handle when a notification is deleted via socket
  handleNotificationDeleted: (notificationId) => {
    set(state => {
      const notif = state.notifications.find(n => n._id === notificationId);
      const unreadDelta = notif && !notif.isRead ? 1 : 0;
      
      return {
        notifications: state.notifications.filter(notif => notif._id !== notificationId),
        unreadCount: Math.max(0, state.unreadCount - unreadDelta)
      };
    });
  },

  // Set up socket listeners
  subscribeToNotifications: () => {
    const socket = useAuthStore.getState().socket;
    const { 
      addNotification, 
      handleNotificationsMarkedRead, 
      handleAllNotificationsMarkedRead,
      handleNotificationDeleted
    } = get();

    // Listen for new notifications
    socket.on("notification", (notification) => {
      addNotification(notification);
      
      // Play notification sound
      const audio = new Audio("/notification-sound.mp3");
      audio.play().catch(e => console.log("Audio play prevented:", e));
    });

    // Listen for friend request accepted
    socket.on("friend-request-accepted", (data) => {
      const { notification } = data;
      addNotification(notification);
      
      // Play notification sound
      const audio = new Audio("/notification-sound.mp3");
      audio.play().catch(e => console.log("Audio play prevented:", e));
      
      toast.success(`${data.username} accepted your friend request!`);
    });

    // Listen for notifications marked as read
    socket.on("notifications-marked-read", (notificationIds) => {
      handleNotificationsMarkedRead(notificationIds);
    });

    // Listen for all notifications marked as read
    socket.on("all-notifications-marked-read", () => {
      handleAllNotificationsMarkedRead();
    });

    // Listen for notification deleted
    socket.on("notification-deleted", (notificationId) => {
      handleNotificationDeleted(notificationId);
    });
  },

  // Remove socket listeners
  unsubscribeFromNotifications: () => {
    const socket = useAuthStore.getState().socket;
    
    socket.off("notification");
    socket.off("friend-request-accepted");
    socket.off("notifications-marked-read");
    socket.off("all-notifications-marked-read");
    socket.off("notification-deleted");
  },
}));