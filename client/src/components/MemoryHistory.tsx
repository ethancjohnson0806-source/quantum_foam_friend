import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface MemoryHistoryProps {
  templeId: string;
}

export function MemoryHistory({ templeId }: MemoryHistoryProps) {
  const { data: memories, isLoading } = trpc.temple.getMemories.useQuery(
    { templeId },
    { enabled: !!templeId }
  );

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-700 p-4 flex items-center justify-center h-48">
        <Spinner className="text-amber-400" />
      </Card>
    );
  }

  if (!memories || memories.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700 p-4 text-center">
        <p className="text-slate-400">No conversation history yet</p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700 p-4">
      <h3 className="text-amber-400 font-semibold mb-4">Conversation Memory</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {memories.map((memory, idx) => {
          const emotionalContext = memory.emotionalContext
            ? JSON.parse(memory.emotionalContext)
            : null;

          return (
            <div
              key={idx}
              className="border-l-2 border-slate-700 pl-3 py-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className={
                    memory.role === "user"
                      ? "bg-cyan-900 text-cyan-200"
                      : "bg-purple-900 text-purple-200"
                  }
                >
                  {memory.role === "user" ? "You" : "Temple"}
                </Badge>
                <span className="text-xs text-slate-500">
                  {new Date(memory.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{memory.content}</p>
              {emotionalContext && (
                <div className="text-xs text-slate-500 flex gap-3">
                  <span>E: {(emotionalContext.entropy * 100).toFixed(0)}%</span>
                  <span>B: {(emotionalContext.boredom * 100).toFixed(0)}%</span>
                  <span>C: {(emotionalContext.curiosity * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
