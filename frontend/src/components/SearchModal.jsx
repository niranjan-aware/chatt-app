import debounce from "lodash.debounce";
import React, { useState, useEffect, useCallback } from "react";
import { useModalStore } from "../store/useModalStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

export default function SearchModal() {
  const { isSearchModalOpen, closeSearchModal } = useModalStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Local state to track relationship status changes
  const [pendingRequests, setPendingRequests] = useState([]);
  const [localFriends, setLocalFriends] = useState([]);

  const { searchUser, sendFriendRequest, removeFriend, getUsers, friendsAndGroups } = useChatStore();
  const { authUser } = useAuthStore();

  // Initialize local state from authUser when it changes
  useEffect(() => {
    if (authUser) {
      if (authUser.friends) {
        setLocalFriends(authUser.friends);
      }
      if (authUser.friendRequests) {
        setPendingRequests(authUser.friendRequests);
      }
    }
  }, [authUser]);

  const handleSearch = useCallback(
    debounce(async (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setResults([]);
        setError("");
        return;
      }
      
      setIsLoading(true);
      try {
        const data = await searchUser(value);
        setResults(data);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }, 400),
    [searchUser, authUser]
  );

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch, friendsAndGroups]);

  const isFriend = (userId) => {
    // Check local state first, then fall back to authUser
    return localFriends.includes(userId) || 
           (authUser?.friends && authUser.friends.includes(userId));
  };

  const isPendingRequest = (userId) => {
    // Check local state first, then fall back to authUser
    return pendingRequests.includes(userId) || 
           (authUser?.friendRequests && authUser.friendRequests.some(req => req === userId));
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      // Update local state immediately
      setPendingRequests(prev => [...prev, userId]);
      
      // Send request to backend
      await sendFriendRequest({ toUserId: userId });
      
      // Refresh data from backend
      await getUsers();
    } catch (error) {
      console.error("Failed to send friend request:", error);
      
      // Rollback local state if there was an error
      setPendingRequests(prev => prev.filter(id => id !== userId));
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      // Update local state immediately
      setLocalFriends(prev => prev.filter(id => id !== userId));
      
      // Send request to backend
      await removeFriend({ friendId: userId });
      
      // Refresh data from backend
      await getUsers();
      handleSearch(query);
    } catch (error) {
      console.error("Failed to remove friend:", error);
      
      // Rollback local state if there was an error
      if (authUser?.friends && authUser.friends.includes(userId)) {
        setLocalFriends(prev => [...prev, userId]);
      }
    }
  };

  const renderActionButton = (item) => {
    // For group type items
    if (item.type === "group") {
      return <button className="btn btn-sm btn-secondary">View</button>;
    }
    
    // Don't show action button for own profile
    if (authUser && item._id === authUser._id) {
      return null;
    }
 
    // Show "Remove Friend" for existing friends
    if (isFriend(item._id)) {
      return (
        <button 
          className="btn btn-sm btn-error" 
          onClick={() => handleRemoveFriend(item._id)}
        >
          Remove Friend
        </button>
      );
    }
    
    // Show disabled "Request Pending" button for pending requests
    if (isPendingRequest(item._id)) {
      return (
        <button className="btn btn-sm btn-warning" disabled>
          Request Pending
        </button>
      );
    }
    
    // Default: Show "Add Friend" button
    return (
      <button 
        className="btn btn-sm btn-primary" 
        onClick={() => handleSendFriendRequest(item._id)}
      >
        Add Friend
      </button>
    );
  };

  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
          onClick={closeSearchModal}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Search Users or Groups
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="max-h-60 overflow-y-auto space-y-2">
          {isLoading && (
            <p className="text-center text-gray-500">Searching...</p>
          )}
          {!isLoading && results.length === 0 && !error && query && (
            <p className="text-center text-gray-500">No results</p>
          )}
          {!isLoading && results.length === 0 && !error && !query && (
            <p className="text-center text-gray-500">Type to search</p>
          )}
          {results.map((item) => (
            <div
              key={item._id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={item.profilePic || "/avatar.png"}
                  alt={item.username}
                  className="size-12 object-cover rounded-full"
                />
              </div>
              <p className="font-medium">{item.username}</p>
              <div className="flex gap-2">
                {renderActionButton(item)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}