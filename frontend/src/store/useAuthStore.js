import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set)=>({
    authUser: null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth: true,

    checkAuth: async()=>{
        try {
            const res = await axiosInstance("/auth/check");
            set({authUser: res.data});
        } catch (error) {
            console.error("Error in checkAuth useStoreAuth", error.message);
        } finally{
            set({isCheckingAuth: false});
        }
    },
    signup:async(data)=>{
        try {
            const res = await axiosInstance.post('/auth/signup',data);
            toast.success("Account created successfully");
            set({authUser:res.data});
        } catch (error) {
            toast.error(error.message.data.response);
        }finally{
            set({isSigningUp:false});
        }
    },
    login:async(data)=>{
        try {
            const res = await axiosInstance.post('/auth/login',data)
            toast.success("Logged in successfully");
            set({authUser:res.data});
        } catch (error) {
            toast.error(error.message.data.response);
        }finally{
            set({isSigningUp:false});
        }
    },
    logout:async()=>{
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser:null});
            toast.success("Loggerd out suceesfully");
        } catch (error) {
            toast.error(error.message.data.response)
        }
    },
    updateProfile:async(data)=>{
        try {
            
        } catch (error) {
            toast.error(error.message.data.response)
        }
    }
}));
