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

  const { searchUser } = useChatStore();

  const { authUser } = useAuthStore();
  // console.log(authUser);
  

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
    []
  );

  useEffect(() => {
    handleSearch(query);
  }, [query]);

  const renderActionButton = (item) => {
  // console.log("authUser.friends:", authUser.friends);
  // console.log("item._id:", item._id);
  // console.log(authUser.friends.some(friendId => friendId.toString().trim() === item._id.toString().trim()));

  switch (item.type) {
    case "group":
      return <button className="btn btn-sm btn-secondary">View</button>;
    case "user":
      if (true) {
        return <button className="btn btn-sm btn-primary">Add</button>;
      }
      return null;
    default:
      return null;
  }
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
          {results.length === 0 && !error && (
            <p className="text-center text-gray-500">No results</p>
          )}
          {results.map((item) => (
            <div
              key={item._id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={item.profilePic || "/avatar.png"}
                  alt={item.name}
                  className="size-12 object-cover rounded-full"
                />
              </div>
              <p className="font-medium">{item.username}</p>
              
              <div className="flex gap-2">
      {(() => {
        console.log("Render Button?", item._id, authUser.friends);
        return renderActionButton(item);
      })()}
    </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
