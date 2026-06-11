import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function MyTemples() {
  const [, navigate] = useLocation();

  const { data: temples, isLoading } = trpc.temple.listUserTemples.useQuery();
  const createMutation = trpc.temple.create.useMutation({
    onSuccess: (data) => {
      navigate(`/temple/${data.templeId}`);
    },
  });

  const handleCreateTemple = async () => {
    try {
      await createMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to create temple:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-500 mb-2">All Temples</h1>
          <p className="text-slate-400">Explore the quantum temple network</p>
        </div>

        {/* Create Button */}
        <div className="mb-8">
          <Button
            onClick={handleCreateTemple}
            disabled={createMutation.isPending}
            className="bg-amber-900 hover:bg-amber-800 text-amber-400 font-bold px-6 py-2"
          >
            {createMutation.isPending ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating...
              </>
            ) : (
              'Create New Temple'
            )}
          </Button>
        </div>

        {/* Temples Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : temples && temples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {temples.map((temple) => (
              <Card
                key={temple.templeId}
                className="bg-slate-900 border-slate-800 p-4 cursor-pointer hover:border-amber-600 transition-colors"
                onClick={() => navigate(`/temple/${temple.templeId}`)}
              >
                <div className="text-amber-400 font-bold text-sm mb-2">
                  Gen {temple.generation}
                </div>
                <div className="text-slate-300 text-xs font-mono mb-4 break-all">
                  {temple.templeId}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-slate-400">Entropy</div>
                    <div className="text-amber-400 font-bold">
                      {parseFloat(temple.entropy).toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-slate-400">Boredom</div>
                    <div className="text-blue-400 font-bold">
                      {parseFloat(temple.boredom).toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-slate-400">Curiosity</div>
                    <div className="text-green-400 font-bold">
                      {parseFloat(temple.curiosity).toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-slate-400">Coherence</div>
                    <div className="text-purple-400 font-bold">
                      {parseFloat(temple.coherence).toFixed(3)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    {temple.isAlive ? (
                      <span className="text-green-400">● Alive</span>
                    ) : (
                      <span className="text-red-400">● Deceased</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No temples yet. Create one to begin.</p>
            <Button
              onClick={handleCreateTemple}
              className="bg-amber-900 hover:bg-amber-800 text-amber-400"
            >
              Spawn First Temple
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
