import debounce from "lodash.debounce";
import React, { useState, useEffect, useCallback } from "react";
import { useModalStore } from "../store/useModalStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

export default function CreateGroupModal() {
  const { isCreateGroupModalOpen, closeCreateGroupModal } = useModalStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const { searchUser } = useChatStore();
  const { authUser } = useAuthStore();

  // State for group form
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]); // Array of user objects
  const [admins, setAdmins] = useState([]); // Subset of members

  // Debounced search function
  const handleSearch = useCallback(
    debounce(async (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setResults([]);
        setError("");
        return;
      }
      try {
        const data = await searchUser(value);
        setResults(data);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong");
      }
    }, 400),
    [searchUser]
  );

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  // Add user to members (if not already added)
  const addMember = (user) => {
    if (!members.some((m) => m._id === user._id)) {
      setMembers((prev) => [...prev, user]);
    }
  };

  // Remove member (also remove from admins if present)
  const removeMember = (userId) => {
    setMembers((prev) => prev.filter((m) => m._id !== userId));
    setAdmins((prev) => prev.filter((a) => a._id !== userId));
  };

  // Toggle admin status (only if user is a member)
  const toggleAdmin = (user) => {
    if (!members.some((m) => m._id === user._id)) return; // must be member
    if (admins.some((a) => a._id === user._id)) {
      setAdmins((prev) => prev.filter((a) => a._id !== user._id));
    } else {
      setAdmins((prev) => [...prev, user]);
    }
  };

  // Submit handler (replace with your API call)
  const handleSubmit = () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }
    if (members.length === 0) {
      setError("Add at least one member");
      return;
    }

    // Example payload
    const payload = {
      name: groupName.trim(),
      createdBy: authUser._id,
      members: members.map((m) => m._id),
      admins: admins.map((a) => a._id),
    };

    console.log("Group create payload:", payload);
    // TODO: Call your backend API here...

    // Reset & close modal
    setGroupName("");
    setMembers([]);
    setAdmins([]);
    setQuery("");
    setResults([]);
    setError("");
    closeCreateGroupModal();
  };

  if (!isCreateGroupModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-base-100 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto p-6 relative flex flex-col">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-xl font-bold"
          onClick={closeCreateGroupModal}
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Create New Group
        </h2>

        {/* Group Name */}
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="input input-bordered w-full mb-4"
        />

        {/* Search Users */}
        <input
          type="text"
          placeholder="Search users to add..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input input-bordered w-full mb-2"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Search Results */}
        <div className="max-h-40 overflow-y-auto mb-4 border rounded p-2 bg-gray-50 dark:bg-gray-500">
          {results.length === 0 && query.trim() !== "" && !error && (
            <p className="text-center text-gray-500">No users found</p>
          )}
          {results.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-1 mb-3 hover:bg-gray-200 dark:hover:bg-gray-400 cursor-pointer rounded"
            >
              <div className="flex items-center gap-2">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{user.username}</span>
              </div>
              <button
                className="btn btn-xs btn-primary"
                onClick={() => addMember(user)}
                disabled={members.some((m) => m._id === user._id)}
              >
                {members.some((m) => m._id === user._id) ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>

        {/* Selected Members */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Members ({members.length})</h3>
          {members.length === 0 && (
            <p className="text-gray-500">No members added yet.</p>
          )}
          <ul className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-500">
            {members.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between py-1 px-2 hover:bg-gray-200 dark:hover:bg-gray-400 rounded"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>{user.username}</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={admins.some((a) => a._id === user._id)}
                      onChange={() => toggleAdmin(user)}
                      className="checkbox checkbox-sm checkbox-success"
                    />
                    <span className="text-sm">Admin</span>
                  </label>

                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => removeMember(user._id)}
                    title="Remove member"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary w-full"
          onClick={handleSubmit}
          disabled={!groupName.trim() || members.length === 0}
        >
          Create Group
        </button>
      </div>
    </div>
  );
}
