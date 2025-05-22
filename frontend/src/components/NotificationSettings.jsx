// components/notifications/NotificationSettings.jsx
import { useState, useEffect } from "react";
import { Bell, BellOff, Volume2, VolumeX, MessageSquare, Users } from "lucide-react";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    messageNotifications: true,
    friendRequestNotifications: true,
    groupNotifications: true,
    soundEnabled: true,
    browserNotifications: false,
  });

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({
        ...prev,
        browserNotifications: permission === "granted"
      }));
    }
  };

  // Check current browser notification status
  useEffect(() => {
    if ("Notification" in window) {
      setSettings(prev => ({
        ...prev,
        browserNotifications: Notification.permission === "granted"
      }));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify({
      ...settings,
      [key]: value
    }));
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="size-6 text-primary" />
        <h2 className="text-xl font-semibold">Notification Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Message Notifications */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <MessageSquare className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Message Notifications</h3>
              <p className="text-sm text-base-content/70">Get notified when you receive new messages</p>
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={settings.messageNotifications}
            onChange={(e) => handleSettingChange('messageNotifications', e.target.checked)}
          />
        </div>

        {/* Friend Request Notifications */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-success/10">
              <Users className="size-5 text-success" />
            </div>
            <div>
              <h3 className="font-medium">Friend Request Notifications</h3>
              <p className="text-sm text-base-content/70">Get notified about friend requests and acceptances</p>
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={settings.friendRequestNotifications}
            onChange={(e) => handleSettingChange('friendRequestNotifications', e.target.checked)}
          />
        </div>

        {/* Group Notifications */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-info/10">
              <Users className="size-5 text-info" />
            </div>
            <div>
              <h3 className="font-medium">Group Notifications</h3>
              <p className="text-sm text-base-content/70">Get notified about group messages and activities</p>
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={settings.groupNotifications}
            onChange={(e) => handleSettingChange('groupNotifications', e.target.checked)}
          />
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-warning/10">
              {settings.soundEnabled ? (
                <Volume2 className="size-5 text-warning" />
              ) : (
                <VolumeX className="size-5 text-warning" />
              )}
            </div>
            <div>
              <h3 className="font-medium">Sound Notifications</h3>
              <p className="text-sm text-base-content/70">Play sound when you receive notifications</p>
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={settings.soundEnabled}
            onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
          />
        </div>

        {/* Browser Notifications */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary/10">
              {settings.browserNotifications ? (
                <Bell className="size-5 text-secondary" />
              ) : (
                <BellOff className="size-5 text-secondary" />
              )}
            </div>
            <div>
              <h3 className="font-medium">Browser Notifications</h3>
              <p className="text-sm text-base-content/70">Show browser notifications even when tab is not active</p>
            </div>
          </div>
          {settings.browserNotifications ? (
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={true}
              disabled
            />
          ) : (
            <button
              className="btn btn-sm btn-primary"
              onClick={requestNotificationPermission}
            >
              Enable
            </button>
          )}
        </div>
      </div>

      <div className="divider"></div>

      <div className="space-y-3">
        <h3 className="font-medium text-lg">Notification Preview</h3>
        <div className="p-3 rounded-lg bg-base-200 border-l-4 border-primary">
          <div className="flex items-start gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img src="/avatar.png" alt="Demo" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-base-content/80">sent you a message</p>
              <p className="text-xs text-base-content/60 mt-1">2 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;