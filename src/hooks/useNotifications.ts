import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(({ title, body, icon, tag, requireInteraction }: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      // Fallback to toast
      toast(title, { description: body });
      return null;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag,
        requireInteraction,
        badge: '/favicon.ico',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast(title, { description: body });
      return null;
    }
  }, [isSupported, permission]);

  // Specific notification types
  const notifyTradeExecuted = useCallback((market: string, type: 'buy' | 'sell', amount: number) => {
    sendNotification({
      title: `Trade Executed: ${type.toUpperCase()} ${market}`,
      body: `Amount: $${amount.toFixed(2)}`,
      tag: 'trade-executed',
    });
  }, [sendNotification]);

  const notifyProfitAlert = useCallback((amount: number, agentName?: string) => {
    sendNotification({
      title: '🎉 Profit Alert!',
      body: agentName 
        ? `${agentName} made $${amount.toFixed(2)} profit!`
        : `You made $${amount.toFixed(2)} profit!`,
      tag: 'profit-alert',
    });
  }, [sendNotification]);

  const notifyLossAlert = useCallback((amount: number, agentName?: string) => {
    sendNotification({
      title: '⚠️ Loss Alert',
      body: agentName 
        ? `${agentName} incurred $${Math.abs(amount).toFixed(2)} loss`
        : `Loss of $${Math.abs(amount).toFixed(2)} detected`,
      tag: 'loss-alert',
      requireInteraction: true,
    });
  }, [sendNotification]);

  const notifyAgentUpdate = useCallback((agentName: string, status: string) => {
    sendNotification({
      title: `Agent Update: ${agentName}`,
      body: `Status changed to ${status}`,
      tag: 'agent-update',
    });
  }, [sendNotification]);

  const notifyKillSwitch = useCallback((agentName: string, reason: string) => {
    sendNotification({
      title: '🚨 Kill Switch Activated',
      body: `${agentName} stopped: ${reason}`,
      tag: 'kill-switch',
      requireInteraction: true,
    });
  }, [sendNotification]);

  const notifyPriceAlert = useCallback((symbol: string, price: number, direction: 'above' | 'below') => {
    sendNotification({
      title: `Price Alert: ${symbol}`,
      body: `Price is now ${direction} $${price.toLocaleString()}`,
      tag: 'price-alert',
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    notifyTradeExecuted,
    notifyProfitAlert,
    notifyLossAlert,
    notifyAgentUpdate,
    notifyKillSwitch,
    notifyPriceAlert,
  };
};
