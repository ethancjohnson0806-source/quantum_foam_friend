import { useEffect, useState, useCallback } from "react";

export interface TempleStateUpdate {
  entropy?: number;
  boredom?: number;
  curiosity?: number;
  coherence?: number;
  isAlive?: number;
  lastActivity?: string;
  lastAutonomousRun?: string;
}

export interface TempleEvent {
  eventType: string;
  timestamp: string;
  [key: string]: any;
}

export function useRealtimeTemple(templeId: string) {
  const [stateUpdates, setStateUpdates] = useState<TempleStateUpdate[]>([]);
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    try {
      const eventSource = new EventSource(`/api/realtime/temple/${templeId}`);

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setStateUpdates((prev) => [...prev.slice(-9), data]);
        } catch (err) {
          console.error("Failed to parse state update:", err);
        }
      };

      eventSource.addEventListener("templeEvent", (event) => {
        try {
          const data = JSON.parse(event.data);
          setEvents((prev) => [...prev.slice(-19), data]);
        } catch (err) {
          console.error("Failed to parse temple event:", err);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
        setError("Connection lost");
        eventSource.close();
      };

      return () => {
        eventSource.close();
        setIsConnected(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsConnected(false);
    }
  }, [templeId]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return {
    stateUpdates,
    events,
    isConnected,
    error,
  };
}
