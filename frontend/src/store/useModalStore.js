import { create } from "zustand";

export const useModalStore = create((set) => ({
  
  
  isSearchModalOpen: false,
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),

  
  isCreateGroupModalOpen: false,
  openCreateGroupModal: () => set({ isCreateGroupModalOpen: true }),
  closeCreateGroupModal: () => set({ isCreateGroupModalOpen: false }),
}));
