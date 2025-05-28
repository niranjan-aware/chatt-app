import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { IoPersonRemove } from "react-icons/io5";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, getUsers, removeFriend } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const handleRemoveFriend = async (userId) => {
    try {
      
      await removeFriend({ friendId: userId });
      await getUsers();
      setSelectedUser(null)
    } catch (error) {
      console.error("Failed to remove friend:", error);
      
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.username}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="right-end flex items-center">
          {selectedUser.type === "user" && (
            <div className="rm-btn">
              <button
                className="btn btn-sm btn-primary mr-3 hidden md:inline-flex"
                onClick={() => handleRemoveFriend(selectedUser._id)}
              >
                Remove Friend
              </button>
              <div
                className="md:hidden tooltip tooltip-bottom"
                data-tip="Remove Friend"
              >
                <IoPersonRemove className="cursor-pointer text-red-500" onClick={() => handleRemoveFriend(item._id)}/>
              </div>
            </div>
          )}
          {/* Close button */}
          <button onClick={() => setSelectedUser(null)} className="pr-3">
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
