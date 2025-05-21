// components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useModalStore } from "../store/useModalStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useEffect, useState, useRef } from "react";

import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  Search,
  Users,
  Bell,
} from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { openSearchModal, openCreateGroupModal } = useModalStore();
  const { 
    unreadCount, 
    getUnreadCount,
    subscribeToNotifications,
    unsubscribeFromNotifications 
  } = useNotificationStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef();
  
  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Get initial notification count and set up socket listeners
  useEffect(() => {
    if (authUser) {
      getUnreadCount();
      subscribeToNotifications();
      
      return () => unsubscribeFromNotifications();
    }
  }, [authUser, getUnreadCount, subscribeToNotifications, unsubscribeFromNotifications]);
  
  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <button className="flex gap-2 items-center" onClick={openCreateGroupModal}>
                  <Users className="size-5" />
                  <span className="hidden sm:inline">Create Group</span>
                </button>
                <button
                  className="flex gap-2 items-center"
                  onClick={openSearchModal}
                >
                  <Search className="size-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>

                <Link to={"/profile"} className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <div className="relative" ref={notificationRef}>
                  <button 
                    className="btn btn-sm btn-circle relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-error text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </div>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {showNotifications && <NotificationDropdown />}
                </div>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;