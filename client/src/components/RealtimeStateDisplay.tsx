import { useRealtimeTemple } from "@/hooks/useRealtimeTemple";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RealtimeStateDisplayProps {
  templeId: string;
}

export function RealtimeStateDisplay({ templeId }: RealtimeStateDisplayProps) {
  const { stateUpdates, events, isConnected, error } = useRealtimeTemple(templeId);

  const latestState = stateUpdates[stateUpdates.length - 1];
  const recentEvents = events.slice(-5);

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-400" : "bg-red-400"
          }`}
        />
        <span className="text-sm text-slate-400">
          {isConnected ? "Live" : "Disconnected"}
        </span>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      {/* Latest State */}
      {latestState && (
        <Card className="bg-slate-900 border-slate-700 p-4">
          <h3 className="text-amber-400 font-semibold mb-3">Live State</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {latestState.entropy !== undefined && (
              <div>
                <span className="text-slate-400">Entropy:</span>
                <span className="ml-2 text-amber-400">
                  {(latestState.entropy * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {latestState.boredom !== undefined && (
              <div>
                <span className="text-slate-400">Boredom:</span>
                <span className="ml-2 text-orange-400">
                  {(latestState.boredom * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {latestState.curiosity !== undefined && (
              <div>
                <span className="text-slate-400">Curiosity:</span>
                <span className="ml-2 text-cyan-400">
                  {(latestState.curiosity * 100).toFixed(0)}%
                </span>
              </div>
            )}
            {latestState.coherence !== undefined && (
              <div>
                <span className="text-slate-400">Coherence:</span>
                <span className="ml-2 text-purple-400">
                  {(latestState.coherence * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <Card className="bg-slate-900 border-slate-700 p-4">
          <h3 className="text-amber-400 font-semibold mb-3">Live Events</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentEvents.map((event, idx) => (
              <div key={idx} className="text-xs text-slate-400 border-l border-slate-700 pl-2">
                <Badge className="bg-slate-800 text-slate-300 mb-1">
                  {event.eventType}
                </Badge>
                <div className="text-slate-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
