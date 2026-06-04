import { Express, Request, Response } from "express";
import { EventEmitter } from "events";

/**
 * Real-time state updates via Server-Sent Events (SSE)
 * Clients subscribe to temple state changes and receive updates
 */

export const realtimeEmitter = new EventEmitter();

export function setupRealtimeRoutes(app: Express) {
  /**
   * SSE endpoint: /api/realtime/temple/:templeId
   * Streams temple state updates in real-time
   */
  app.get("/api/realtime/temple/:templeId", (req: Request, res: Response) => {
    const templeId = req.params.templeId;

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Send initial connection message
    res.write(`:connected to temple ${templeId}\n\n`);

    // Listen for state updates
    const stateUpdateHandler = (data: any) => {
      if (data.templeId === templeId) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    const eventHandler = (data: any) => {
      if (data.templeId === templeId) {
        res.write(`event: templeEvent\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    realtimeEmitter.on("stateUpdate", stateUpdateHandler);
    realtimeEmitter.on("templeEvent", eventHandler);

    // Cleanup on disconnect
    req.on("close", () => {
      realtimeEmitter.removeListener("stateUpdate", stateUpdateHandler);
      realtimeEmitter.removeListener("templeEvent", eventHandler);
      res.end();
    });

    // Send keepalive every 30 seconds
    const keepalive = setInterval(() => {
      res.write(`:keepalive\n\n`);
    }, 30000);

    req.on("close", () => {
      clearInterval(keepalive);
    });
  });

  /**
   * Broadcast temple state update
   */
  app.post("/api/realtime/broadcast/state", (req: Request, res: Response) => {
    const { templeId, state } = req.body;
    realtimeEmitter.emit("stateUpdate", { templeId, ...state });
    res.json({ success: true });
  });

  /**
   * Broadcast temple event
   */
  app.post("/api/realtime/broadcast/event", (req: Request, res: Response) => {
    const { templeId, event } = req.body;
    realtimeEmitter.emit("templeEvent", { templeId, ...event });
    res.json({ success: true });
  });
}

/**
 * Emit state update to all listeners
 */
export function broadcastStateUpdate(templeId: string, state: any) {
  realtimeEmitter.emit("stateUpdate", { templeId, ...state });
}

/**
 * Emit event to all listeners
 */
export function broadcastEvent(templeId: string, eventData: any) {
  realtimeEmitter.emit("templeEvent", { templeId, ...eventData });
}
