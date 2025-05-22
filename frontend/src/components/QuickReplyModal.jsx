// components/modals/QuickReplyModal.jsx
import { useState } from "react";
import { useModalStore } from "../store/useModalStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, X, Image } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";

const QuickReplyModal = () => {
  const { isMessageModalOpen, closeMessageModal, messageModalData } = useModalStore();
  const {deleteNotification} = useNotificationStore();
  const { sendMessage } = useChatStore();
  const { authUser } = useAuthStore();
  
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset fields when modal closes
  const handleClose = () => {
    setMessage("");
    setSelectedImage(null);
    setImagePreview(null);
    closeMessageModal();
  };
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };
  
  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedImage) return;
    
    setIsLoading(true);
    
    try {
      const messageData = {
        text: message,
        image: imagePreview,
      };
      
      // If we have recipient data from the modal
      if (messageModalData && messageModalData.recipientId) {
        await sendMessage({
          ...messageData,
          receiverId: messageModalData.recipientId,
        });
      }
      deleteNotification(messageModalData.notificationId)
      handleClose();
      // deleteNotification(notification._id);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isMessageModalOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            Reply to {messageModalData?.recipientName || "User"}
          </h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleClose}
          >
            <X className="size-5" />
          </button>
        </div>
        
        {messageModalData?.messagePreview && (
          <div className="p-4 border-b">
            <div className="flex gap-3 items-start">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-base-300">
                  <img 
                    src="/avatar.png" 
                    alt="Original message"
                  />
                </div>
              </div>
              <div className="bg-base-200 p-2 rounded-lg text-sm">
                {messageModalData.messagePreview}
                {messageModalData.messagePreview.length >= 50 ? "..." : ""}
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="p-4">
          {/* Image preview */}
          {imagePreview && (
            <div className="relative mb-3 inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-32 w-auto rounded-md object-cover"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 btn btn-error btn-xs btn-circle"
                onClick={handleRemoveImage}
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* Image upload */}
            <label className="btn btn-circle btn-sm">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
              <Image className="size-5" />
            </label>
            
            {/* Message input */}
            <input
              type="text"
              placeholder="Type your reply..."
              className="input input-bordered flex-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoFocus
            />
            
            {/* Send button */}
            <button 
              type="submit"
              className="btn btn-primary btn-circle"
              disabled={(!message.trim() && !selectedImage) || isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Send className="size-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickReplyModal;