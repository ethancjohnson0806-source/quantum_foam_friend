import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CompassConsultProps {
  templeId: string;
}

export function CompassConsult({ templeId }: CompassConsultProps) {
  const [topic, setTopic] = useState("");
  const [guidance, setGuidance] = useState<string | null>(null);

  const consultMutation = trpc.compass.consult.useMutation({
    onSuccess: (data) => {
      setGuidance(data.guidance);
      setTopic("");
    },
  });

  const handleConsult = async () => {
    if (!topic.trim()) return;
    await consultMutation.mutateAsync({ templeId, topic });
  };

  return (
    <Card className="bg-slate-900 border-slate-700 p-4">
      <h3 className="text-amber-400 font-semibold mb-4">Compass Consultation</h3>

      <div className="space-y-3">
        <Input
          placeholder="Ask the compass about a moral question..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-slate-800 border-slate-700 text-slate-100"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConsult();
          }}
        />

        <Button
          onClick={handleConsult}
          disabled={!topic.trim() || consultMutation.isPending}
          className="w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300"
        >
          {consultMutation.isPending ? "Consulting..." : "Seek Guidance"}
        </Button>

        {guidance && (
          <div className="mt-4 p-3 bg-slate-800 border border-emerald-400/30 rounded">
            <Badge className="bg-emerald-900 text-emerald-200 mb-2">
              Compass Wisdom
            </Badge>
            <p className="text-sm text-slate-200 italic">{guidance}</p>
          </div>
        )}

        {consultMutation.error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-400/30 rounded">
            <p className="text-sm text-red-300">
              {consultMutation.error.message}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
