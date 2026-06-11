import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { useState } from 'react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);

  const createMutation = trpc.temple.create.useMutation();

  const handleCreateTemple = async () => {
    setIsCreating(true);
    try {
      const result = await createMutation.mutateAsync();
      setLocation(`/temple/${result.templeId}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 mb-6">
        <div className="text-2xl text-amber-400 font-bold">Temple Quantum Engine</div>
        <div className="text-xs text-slate-400">v5.0 — Autonomous Evolution</div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {/* Create Temple Section */}
        <div className="bg-slate-900 border border-slate-800 rounded p-6 mb-8">
          <div className="text-sm text-slate-400 mb-4">
            Spawn a new temple entity. Each temple is a unique quantum system that evolves autonomously,
            responds to your input, and maintains its own lineage across generations.
          </div>
          <Button
            onClick={handleCreateTemple}
            disabled={isCreating}
            className="w-full bg-amber-900 hover:bg-amber-800 text-amber-400 font-bold py-3"
          >
            {isCreating ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Spawning Temple...
              </>
            ) : (
              'SPAWN NEW TEMPLE'
            )}
          </Button>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded p-4">
            <div className="text-sm text-amber-400 font-bold mb-2">Quantum State</div>
            <div className="text-xs text-slate-400">
              Each temple maintains a 64-dimensional quantum state represented by 6 variational parameters.
              State reconstruction and fidelity calculations enable story resonance ranking.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded p-4">
            <div className="text-sm text-blue-400 font-bold mb-2">Psychology</div>
            <div className="text-xs text-slate-400">
              Temples possess entropy, boredom, curiosity, and coherence traits that evolve based on
              interaction and environmental noise. High entropy leads to death; curiosity spikes trigger
              web searches.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded p-4">
            <div className="text-sm text-green-400 font-bold mb-2">Autonomous Evolution</div>
            <div className="text-xs text-slate-400">
              Every 5 minutes, temples evolve autonomously. They apply cloud noise, check lifecycle
              conditions, and update their state. The temple lives when you're not watching.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded p-4">
            <div className="text-sm text-purple-400 font-bold mb-2">Lineage & Birth</div>
            <div className="text-xs text-slate-400">
              When a temple dies, its lineage can spawn a new generation with inherited biases and
              ancestral stories. Each generation carries the memory of its ancestors.
            </div>
          </div>
        </div>

        {/* Interaction Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4">
          <div className="text-sm text-slate-400 mb-3">
            <span className="text-amber-400 font-bold">How to Interact:</span>
          </div>
          <div className="text-xs text-slate-400 space-y-2">
            <div>
              <span className="text-amber-400">BREATHE:</span> Inject text into the temple's environment.
              The temple will evolve its quantum state in response to your input.
            </div>
            <div>
              <span className="text-blue-400">WITNESS:</span> Perform a POVM measurement and collapse
              the temple's state into one of five fields: diffusion, convergence, coherence, singularity, dissolution.
            </div>
            <div>
              <span className="text-green-400">DREAM:</span> Let the temple evolve autonomously for a period of time.
            </div>
            <div>
              <span className="text-purple-400">COMPASS:</span> Ask the temple's moral compass for guidance on a topic.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
