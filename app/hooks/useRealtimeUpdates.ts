import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * useRealtimeUpdates hook establishes a WebSocket connection to a given URL
 * and listens for real-time events to invalidate or refetch TanStack Query data.
 * 
 * @param wsUrl - The WebSocket server endpoint URL.
 */
export function useRealtimeUpdates(wsUrl: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!wsUrl) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: any;
    let heartbeatInterval: any;
    let isMounted = true;

    // ... EVENT_MAP and handleEvent ...
    const EVENT_MAP: Record<string, { list: (string | string[])[]; detail?: string }> = {
      // Products
      'product.updated': { list: ['products'], detail: 'product' },
      'product.created': { list: ['products'] },
      'product.deleted': { list: ['products'], detail: 'product' },
      
      // Categories
      'category.updated': { list: ['categories'], detail: 'category' },
      'category.created': { list: ['categories'] },
      'category.deleted': { list: ['categories'], detail: 'category' },

      // Collections
      'collection.updated': { list: ['collections'], detail: 'collection' },
      'collection.created': { list: ['collections'] },
      'collection.deleted': { list: ['collections'], detail: 'collection' },

      // Media
      'media.updated': { list: [], detail: 'media' },
      'media.created': { list: [] },
      'media.deleted': { list: [], detail: 'media' },

      // Orders
      'order.updated': { list: ['orders'], detail: 'order' },
      'order.created': { list: ['orders'] },
      'order.deleted': { list: ['orders'], detail: 'order' },

      // Inventory & Settings
      'inventory.updated': { list: ['products'] },
      'settings.updated': { list: ['settings'] },
      
      // Discounts
      'DISCOUNTS_UPDATED': { list: [['discounts']] },
    };

    const handleEvent = (type: string, payload?: any) => {
      const config = EVENT_MAP[type];
      if (!config) return;
      console.log(`[WebSocket] Handling ${type}`);
      
      // Invalidate each list key
      config.list.forEach(key => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });

      if (config.detail && payload?.id) {
        queryClient.invalidateQueries({ queryKey: [config.detail, payload.id] });
      }
    };

    async function checkTunnel() {
      try {
        const httpUrl = wsUrl!.replace('wss://', 'https://').replace('ws://', 'http://');
        const res = await fetch(httpUrl, { 
          headers: { 'X-Tunnel-Skip-AntiPhishing-Page': 'true' } 
        });
        return res.ok || res.status === 101 || res.status === 426;
      } catch { return false; }
    }

    function startHeartbeat(socket: WebSocket) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // 30s heartbeat
    }

    async function connect() {
      if (!wsUrl || !isMounted) return;
      
      if (!(await checkTunnel()) && isMounted) {
        reconnectTimeout = setTimeout(connect, 10000);
        return;
      }

      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        startHeartbeat(ws!);
      };
      
      ws.onclose = (e) => {
        clearInterval(heartbeatInterval);
        if (isMounted) {
          console.log(`[WebSocket] Reconnecting in 5s... (${e.code})`);
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') return; // Ignore heartbeat responses
          handleEvent(data.type, data.payload);
        } catch (e) {
          console.error('[WebSocket] Parse Error', e);
        }
      };

      ws.onerror = (err: any) => {
        // Only log if it's not a standard tunnel drop to reduce noise
        if (isMounted) {
          console.warn('[WebSocket] Connection lost, attempting recovery...');
        }
        ws?.close();
      };
    }

    connect();

    return () => {
      isMounted = false;
      ws?.close();
      clearInterval(heartbeatInterval);
      clearTimeout(reconnectTimeout);
    };
  }, [wsUrl, queryClient]);
}
