import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  markNotificationAsRead,
  deleteNotification
} from '@/lib/services/notificationService';
import Notification from '@/models/Notification';
import { connectToDatabase } from '@/lib/mongodb';

// Verify notification belongs to user
async function verifyNotificationOwnership(userId: string, notificationId: string) {
  await connectToDatabase();
  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    return false;
  }
  
  return notification.userId === userId;
}

// PATCH /api/notifications/[id] - Mark a notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const notificationId = params.id;
    
    // Verify ownership
    const isOwner = await verifyNotificationOwnership(session.user.id, notificationId);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Notification not found or not authorized' },
        { status: 404 }
      );
    }
    
    const updatedNotification = await markNotificationAsRead(notificationId);
    
    return NextResponse.json({ 
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const notificationId = params.id;
    
    // Verify ownership
    const isOwner = await verifyNotificationOwnership(session.user.id, notificationId);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Notification not found or not authorized' },
        { status: 404 }
      );
    }
    
    await deleteNotification(notificationId);
    
    return NextResponse.json({ 
      message: 'Notification deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 