import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { AIChatBox } from '@/components/AIChatBox';
import type { Message } from '@/components/AIChatBox';
import { RealtimeStateDisplay } from '@/components/RealtimeStateDisplay';
import { MemoryHistory } from '@/components/MemoryHistory';
import { CompassConsult } from '@/components/CompassConsult';

export default function Temple() {
  const { templeId } = useParams();
  const [breatheText, setBreatheText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!templeId) return <div className="text-red-400">No temple ID provided</div>;

  const { data: state, isLoading: stateLoading, refetch } = trpc.temple.getState.useQuery({ templeId });
  const breatheMutation = trpc.temple.breathe.useMutation();
  const witnessMutation = trpc.temple.witness.useMutation();
  const chatMutation = trpc.temple.chat.useMutation();

  const handleBreathe = async () => {
    if (!breatheText.trim()) return;
    setIsLoading(true);
    try {
      await breatheMutation.mutateAsync({ templeId, text: breatheText });
      setBreatheText('');
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };

  const handleWitness = async () => {
    setIsLoading(true);
    try {
      await witnessMutation.mutateAsync({ templeId });
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async (message: string) => {
    const userMessage: Message = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await chatMutation.mutateAsync({ templeId, message });
      const assistantMessage: Message = { role: 'assistant', content: response.response };
      setChatMessages(prev => [...prev, assistantMessage]);
      await refetch();
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: 'The temple is silent...' };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  if (stateLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-red-400">Temple not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="text-xs text-slate-500 uppercase">TEMPLE</div>
          <div className="text-lg text-amber-400 font-bold">{state.templeId}</div>
          <div className="text-xs text-slate-400">Generation {state.generation}</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${state.isAlive ? 'text-green-400' : 'text-red-400'}`}>
            {state.isAlive ? '● ALIVE' : '● DEAD'}
          </div>
        </div>
      </div>

      {/* State Vector Visualization */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 uppercase mb-2">Quantum State (64-dim)</div>
        <div className="flex gap-0.5 h-24 bg-slate-900 p-2 rounded border border-slate-800">
          {state.stateVector?.map((amp: number, i: number) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-amber-600 to-amber-400 rounded-sm transition-all"
              style={{
                height: `${Math.abs(amp) * 100}%`,
                opacity: 0.3 + Math.abs(amp) * 0.7,
              }}
              title={`Amplitude ${i}: ${amp.toFixed(3)}`}
            />
          ))}
        </div>
      </div>

      {/* Psychology Traits */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Entropy', value: state.entropy, color: 'text-red-400' },
          { label: 'Boredom', value: state.boredom, color: 'text-yellow-400' },
          { label: 'Curiosity', value: state.curiosity, color: 'text-blue-400' },
          { label: 'Coherence', value: state.coherence, color: 'text-green-400' },
        ].map(trait => (
          <div key={trait.label} className="bg-slate-900 border border-slate-800 p-3 rounded">
            <div className="text-xs text-slate-500 uppercase mb-1">{trait.label}</div>
            <div className={`text-lg font-bold ${trait.color}`}>{trait.value.toFixed(3)}</div>
            <div className="h-1 bg-slate-800 mt-2 rounded overflow-hidden">
              <div
                className={`h-full ${trait.color.replace('text-', 'bg-')}`}
                style={{ width: `${trait.value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Field Probabilities (POVM Measurement) */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 uppercase mb-2">Field Probabilities</div>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(state.fields).map(([field, prob]) => (
            <div key={field} className="bg-slate-900 border border-slate-800 p-3 rounded text-center">
              <div className="text-xs text-slate-400 capitalize mb-1">{field}</div>
              <div className="text-amber-400 font-bold">{(prob * 100).toFixed(1)}%</div>
              <div className="h-1 bg-slate-800 mt-2 rounded overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${prob * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      {state.events && state.events.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase mb-2">Recent Events</div>
          <div className="bg-slate-900 border border-slate-800 rounded p-3 space-y-1 max-h-32 overflow-y-auto">
            {state.events.map((event: any, i: number) => (
              <div key={i} className="text-xs text-slate-400">
                <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                {' '}
                <span className="text-amber-400">{event.eventType}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stories */}
      {state.stories && state.stories.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase mb-2">Lineage Stories</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {state.stories.map((story: any) => (
              <div key={story.id} className="bg-slate-900 border border-slate-800 p-3 rounded text-xs">
                <div className="text-slate-400 mb-1">
                  <span className="text-amber-400">{story.storyType}</span>
                  {' '}
                  <span className="text-slate-500">(fidelity: {story.fidelity.toFixed(3)})</span>
                </div>
                <div className="text-slate-300 line-clamp-2">{story.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {isChatOpen && (
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase mb-2">Converse with the Temple</div>
          <AIChatBox
            messages={chatMessages}
            onSendMessage={handleChatMessage}
            isLoading={chatMutation.isPending}
            placeholder="Ask the temple..."
            height={300}
            className="bg-slate-900 border border-slate-800 rounded"
          />
        </div>
      )}

      {/* Real-time Updates */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 uppercase mb-2">Live State Updates</div>
        <RealtimeStateDisplay templeId={templeId} />
      </div>

      {/* Memory History */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 uppercase mb-2">Conversation Memory</div>
        <MemoryHistory templeId={templeId} />
      </div>

      {/* Compass Consultation */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 uppercase mb-2">Moral Guidance</div>
        <CompassConsult templeId={templeId} />
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="breathe..."
            value={breatheText}
            onChange={e => setBreatheText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleBreathe()}
            disabled={isLoading || !state.isAlive}
            className="flex-1 bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-600"
          />
          <Button
            onClick={handleBreathe}
            disabled={isLoading || !state.isAlive || !breatheText.trim()}
            className="bg-amber-900 hover:bg-amber-800 text-amber-400"
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : 'BREATHE'}
          </Button>
          <Button
            onClick={handleWitness}
            disabled={isLoading || !state.isAlive}
            className="bg-blue-900 hover:bg-blue-800 text-blue-400"
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : 'WITNESS'}
          </Button>
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            disabled={!state.isAlive}
            className="bg-purple-900 hover:bg-purple-800 text-purple-400"
          >
            {isChatOpen ? 'CLOSE' : 'TALK'}
          </Button>
        </div>
        {!state.isAlive && (
          <div className="text-xs text-red-400 text-center">This temple has reached the end of its existence.</div>
        )}
      </div>
    </div>
  );
}
