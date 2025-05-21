// store/useModalStore.js
import { create } from "zustand";

export const useModalStore = create((set) => ({
  // Search modal
  isSearchModalOpen: false,
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
  
  // Create group modal
  isCreateGroupModalOpen: false,
  openCreateGroupModal: () => set({ isCreateGroupModalOpen: true }),
  closeCreateGroupModal: () => set({ isCreateGroupModalOpen: false }),
  
  // Message reply modal (for notifications)
  isMessageModalOpen: false,
  messageModalData: null,
  openMessageModal: (data) => set({ 
    isMessageModalOpen: true,
    messageModalData: data 
  }),
  closeMessageModal: () => set({ 
    isMessageModalOpen: false,
    messageModalData: null
  }),
  
  // Notification view modal (for viewing details of a notification)
  isNotificationViewModalOpen: false,
  notificationViewData: null,
  openNotificationViewModal: (notification) => set({
    isNotificationViewModalOpen: true,
    notificationViewData: notification
  }),
  closeNotificationViewModal: () => set({
    isNotificationViewModalOpen: false,
    notificationViewData: null
  })
}));