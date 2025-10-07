"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: 'booking_submitted' | 'booking_confirmed' | 'booking_rejected' | 'booking_cancelled' | 'booking_price_updated';
  title: string;
  message: string;
  data?: Record<string, unknown>; // Additional data like booking details
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Listen to notifications for the current user
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate() || undefined,
      })) as Notification[];

      // Sort by createdAt in descending order (newest first)
      notificationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(notificationsData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to notifications:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const addNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const updatePromises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
          readAt: serverTimestamp(),
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, notifications]);

  const clearNotification = useCallback(async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      
      // Remove from local state immediately
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const deletePromises = notifications.map(notification => 
        deleteDoc(doc(db, 'notifications', notification.id))
      );
      
      await Promise.all(deletePromises);
      
      // Clear from local state immediately
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, [user, notifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
