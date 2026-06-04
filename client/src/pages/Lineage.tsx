import { useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Spinner } from '@/components/ui/spinner';

export default function Lineage() {
  const { templeId } = useParams();

  if (!templeId) return <div className="text-red-400">No temple ID provided</div>;

  const { data: state, isLoading } = trpc.temple.getState.useQuery({ templeId });

  if (isLoading) {
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 mb-6">
        <div className="text-xs text-slate-500 uppercase">Lineage Tree</div>
        <div className="text-lg text-amber-400 font-bold">{state.templeId}</div>
        <div className="text-xs text-slate-400">Generation {state.generation}</div>
      </div>

      {/* Lineage Information */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 mb-6">
        <div className="text-xs text-slate-500 uppercase mb-2">Current Generation</div>
        <div className="text-sm text-slate-300">
          <div>Temple ID: <span className="text-amber-400">{state.templeId}</span></div>
          <div>Generation: <span className="text-amber-400">{state.generation}</span></div>
          <div>Status: <span className={state.isAlive ? 'text-green-400' : 'text-red-400'}>
            {state.isAlive ? 'ALIVE' : 'DEAD'}
          </span></div>
        </div>
      </div>

      {/* Stories by Type */}
      <div className="grid grid-cols-1 gap-4">
        {['ghost', 'war', 'legend', 'prophecy', 'virtue', 'justice', 'covenant', 'revelation'].map(storyType => {
          const storiesOfType = state.stories?.filter((s: any) => s.storyType === storyType) || [];
          return (
            <div key={storyType} className="bg-slate-900 border border-slate-800 rounded p-4">
              <div className="text-xs text-slate-500 uppercase mb-3 capitalize">{storyType} Stories</div>
              {storiesOfType.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No {storyType} stories yet</div>
              ) : (
                <div className="space-y-2">
                  {storiesOfType.map((story: any, i: number) => (
                    <div key={i} className="bg-slate-950 p-2 rounded text-xs border border-slate-700">
                      <div className="text-slate-400 mb-1">
                        Fidelity: <span className="text-amber-400">{story.fidelity.toFixed(3)}</span>
                      </div>
                      <div className="text-slate-300 line-clamp-3">{story.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Placeholder for ancestral chain visualization */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded p-4">
        <div className="text-xs text-slate-500 uppercase mb-3">Ancestral Chain</div>
        <div className="text-xs text-slate-400 italic">
          Ancestral chain visualization coming soon. This temple is generation {state.generation}.
        </div>
      </div>
    </div>
  );
}
