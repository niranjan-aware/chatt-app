import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

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
    set({ isUsersLoading: true }); // ✅ fixed typo here
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
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      console.log(selectedUser._id);
      
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  createGroup: async (payload) => {
    try {
      const res = await axiosInstance.post("/groups/create", payload);

      toast.success("Group create");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  sendFriendRequest: async(toUserId)=> {
    try {
      const res = await axiosInstance.post("/users/request",toUserId);
      toast.success("Friend request sent")
    } catch (error) {
      toast.error(error.response?.data?.message, "Unable to sent request");
    }
  },

  removeFriend: async(friendId)=>{
    try {
      const res = await axiosInstance.post("/users/remove",friendId);
      toast.success("Friend removed successfully")
    } catch (error) {
      toast.error(error.response?.data?.message, "Unable to remove friend");
    }
  }
}));
