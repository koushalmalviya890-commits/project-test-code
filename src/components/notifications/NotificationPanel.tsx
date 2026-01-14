import React from 'react';
import { X, Trash2, AlertCircle, CheckCircle2, BellIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { INotification } from '@/models/Notification';
import { Spinner } from '@/components/spinner';

interface NotificationPanelProps {
  notifications: INotification[];
  isLoading: boolean;
  onClose: () => void;
  onDeleteNotification: (id: string) => void;
}

export function NotificationPanel({
  notifications,
  isLoading,
  onClose,
  onDeleteNotification
}: NotificationPanelProps) {
  
  // Handle notification deletion
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent panel from closing
    onDeleteNotification(id);
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking-approved':
        return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />;
      case 'facility-approved':
        return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />;
      default:
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="
        /* Mobile: Full screen modal */
        fixed inset-x-0 bottom-0 top-16 bg-white z-50 flex flex-col
        /* Tablet and up: Positioned dropdown */
        md:absolute md:right-0 md:top-[70px] md:inset-x-auto md:bottom-auto md:w-[380px] 
        md:rounded-xl md:shadow-lg md:border md:border-gray-200 md:max-h-[70vh]
        /* Large screens: Wider panel */
        lg:w-[420px]
      ">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="font-semibold text-gray-800 text-base md:text-lg">Notifications</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-200"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
        
        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-10 md:py-8 flex flex-col items-center justify-center px-4">
              <Spinner size="md" />
              <p className="text-gray-500 mt-3 text-sm md:text-base">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 md:py-10 text-center px-4">
              <div className="bg-gray-100 rounded-full w-16 h-16 md:w-12 md:h-12 mx-auto flex items-center justify-center mb-4 md:mb-3">
                <BellIcon className="h-8 w-8 md:h-6 md:w-6 text-gray-500" />
              </div>
              <p className="text-gray-600 font-medium text-base md:text-sm">No notifications</p>
              <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li key={notification._id} className="px-4 py-4 md:py-3 hover:bg-gray-50 active:bg-gray-100 md:active:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Notification Icon */}
                    <div className="mt-1 md:mt-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-medium text-gray-900 mb-1 text-sm md:text-base leading-snug">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-3 md:line-clamp-2 leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(e, notification._id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none p-2 md:p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
                      aria-label="Delete notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Panel Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-200 p-4 md:p-3 bg-gray-50 flex justify-between items-center flex-shrink-0">
            <p className="text-xs md:text-xs text-gray-500">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
            <button 
              onClick={() => onDeleteNotification('all')}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 focus:outline-none px-2 py-1 rounded hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
} 