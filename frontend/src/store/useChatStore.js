// store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useNotificationStore } from "./useNotificationStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  friendsAndGroups: [],
  selectedUser: null,
  isfriendsAndGroupsLoading: false,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isfriendsAndGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ friendsAndGroups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isfriendsAndGroupsLoading: false });
    }
  },

  searchUser: async (username) => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/search", {
        params: { query: username },
      });
      set({ users: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
      throw error;
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
  const { selectedUser } = get();
  set({ isMessagesLoading: true });

  try {
    const res = await axiosInstance.get(
      `/messages/${userId}?type=${selectedUser?.type}`
    );
    set({ messages: res.data });
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to load messages");
  } finally {
    set({ isMessagesLoading: false });
  }
},

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const recipientId = messageData.receiverId || selectedUser._id;
      const isGroup = selectedUser?.type === "group"; // Determine if it's a group chat

      const res = await axiosInstance.post(`/messages/send/${recipientId}`, {
        text: messageData.text,
        image: messageData.image,
        isGroup: selectedUser.type === "group" ? true : false
      });

      // Update local messages only if it's the currently selected chat
      if (recipientId === selectedUser?._id) {
        set({ messages: [...messages, res.data] });
      }

      // Emit socket event
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("send-message", {
          to: recipientId,
          message: res.data,
          isGroup, // true for group, false for user
          activeChatUserId: selectedUser?._id,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // Listen for received messages (from socket)
    socket.on("receive-message", (data) => {
      const { from, message, isGroup } = data;
      const { selectedUser, messages } = get();

      // Add this check: if message with same _id already exists, skip it
      const isDuplicate = messages.some((m) => m._id === message._id);

      if (!isGroup && from === selectedUser._id && !isDuplicate) {
        set({
          messages: [...messages, message],
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("receive-message");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  createGroup: async (payload) => {
    try {
      const res = await axiosInstance.post("/groups/create", payload);
      toast.success("Group created");

      // Refresh friends and groups list
      get().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  },

  sendFriendRequest: async (toUserId) => {
    try {
      
      const res = await axiosInstance.post("/users/request", { toUserId });

      // Emit socket event for real-time notification
      const socket = useAuthStore.getState().socket;
      const authUser = useAuthStore.getState().authUser;

      if (socket && authUser) {
        socket.emit("friend-request", {
          to: toUserId,
          from: authUser._id,
        });
      }

      toast.success("Friend request sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send request");
    }
  },

  acceptFriendRequest: async (fromUserId) => {
    try {
      const res = await axiosInstance.post("/users/accept", { fromUserId });

      // Emit socket event for real-time notification
      const socket = useAuthStore.getState().socket;
      const authUser = useAuthStore.getState().authUser;

      if (socket && authUser) {
        socket.emit("friend-accept", {
          to: fromUserId,
          from: authUser._id,
        });
      }

      toast.success("Friend request accepted");

      // Refresh friends list
      get().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to accept request");
    }
  },

  removeFriend: async (friendId) => {
    try {
      const res = await axiosInstance.post("/users/remove", { friendId });
      toast.success("Friend removed successfully");

      // Refresh friends list
      get().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove friend");
    }
  },

  // Mark message notifications as read when opening a chat
  markMessageNotificationsAsRead: async (senderId) => {
    try {
      const { notifications } = useNotificationStore.getState();

      // Find unread message notifications from this sender
      const unreadMessageNotifications = notifications
        .filter(
          (notif) =>
            notif.type === "message" &&
            notif.sender._id === senderId &&
            !notif.isRead
        )
        .map((notif) => notif._id);

      if (unreadMessageNotifications.length > 0) {
        await useNotificationStore
          .getState()
          .markAsRead(unreadMessageNotifications);
      }
    } catch (error) {
      console.error("Error marking message notifications as read:", error);
    }
  },
}));
