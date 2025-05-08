import {create} from 'zustand'

export const useThemeStore = create((set)=>({
    theme: localStorage.getItem("chat-thene") || "light",
    setTheme: (theme)=>  set({theme})
}));
