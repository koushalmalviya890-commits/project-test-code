import { useState, useEffect, useRef } from 'react';
import { BellIcon } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { INotification } from '@/models/Notification';
import { useClickOutside } from '@/hooks/useClickOutside';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);
  
  // Use click outside hook to close panel when clicking elsewhere
  useClickOutside(bellRef, () => {
    if (isOpen) setIsOpen(false);
  });

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        
        // Calculate unread count
        const unread = data.notifications.filter((notification: INotification) => !notification.isRead).length;
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch notifications:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle notification panel
  const toggleNotificationPanel = () => {
    setIsOpen(!isOpen);
    
    // Mark all as read when opening the panel
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH'
      });
      
      if (response.ok) {
        // Update local state to mark all as read
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    try {
      // Handle "delete all" case
      if (notificationId === 'all') {
        const response = await fetch('/api/notifications', {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }
      
      // Handle single notification deletion
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove the notification from state
        setNotifications(notifications.filter(notif => notif._id !== notificationId));
        
        // Update unread count if needed
        const deletedNotification = notifications.find(notif => notif._id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell Icon with Badge */}
      <button 
        onClick={toggleNotificationPanel}
        className="p-2 sm:p-2.5 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center w-10 h-10 sm:w-[60px] sm:h-[60px] relative touch-manipulation"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:top-3 sm:right-3 bg-red-500 text-white text-xs font-medium px-1 sm:px-1.5 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <NotificationPanel 
          notifications={notifications} 
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
          onDeleteNotification={deleteNotification}
        />
      )}
    </div>
  );
}