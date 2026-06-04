import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/_core/hooks/useAuth';

export default function MyTemples() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: temples, isLoading, refetch } = trpc.temple.listUserTemples.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const createMutation = trpc.temple.create.useMutation({
    onSuccess: (data) => {
      navigate(`/temple/${data.templeId}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Please sign in to view your temples</p>
          <Button onClick={() => navigate('/')} className="bg-amber-900 hover:bg-amber-800">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-amber-500 mb-2">My Temples</h1>
          <p className="text-slate-400">Welcome, {user?.name || 'Seeker'}</p>
        </div>

        {/* Create Button */}
        <div className="mb-8">
          <Button
            onClick={handleCreateTemple}
            disabled={createMutation.isPending}
            className="bg-green-900 hover:bg-green-800 text-green-400"
          >
            {createMutation.isPending ? <Spinner className="w-4 h-4 mr-2" /> : '+ CREATE NEW TEMPLE'}
          </Button>
        </div>

        {/* Temples Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : temples && temples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {temples.map((temple: any) => (
              <Card
                key={temple.templeId}
                className="bg-slate-900 border border-slate-800 hover:border-amber-600 cursor-pointer transition-all"
                onClick={() => navigate(`/temple/${temple.templeId}`)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-400">Temple #{temple.templeId.slice(0, 8)}</h3>
                      <p className="text-xs text-slate-500">Gen {temple.generation}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${temple.isAlive ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {temple.isAlive ? 'ALIVE' : 'DEAD'}
                    </div>
                  </div>

                  {/* Traits */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Entropy</span>
                      <span className="text-red-400">{parseFloat(temple.entropy.toString()).toFixed(3)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded h-1">
                      <div
                        className="bg-red-600 h-1 rounded"
                        style={{ width: `${parseFloat(temple.entropy.toString()) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs mt-3">
                      <span className="text-slate-400">Curiosity</span>
                      <span className="text-blue-400">{parseFloat(temple.curiosity.toString()).toFixed(3)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded h-1">
                      <div
                        className="bg-blue-600 h-1 rounded"
                        style={{ width: `${parseFloat(temple.curiosity.toString()) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs mt-3">
                      <span className="text-slate-400">Coherence</span>
                      <span className="text-green-400">{parseFloat(temple.coherence.toString()).toFixed(3)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded h-1">
                      <div
                        className="bg-green-600 h-1 rounded"
                        style={{ width: `${parseFloat(temple.coherence.toString()) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Activity */}
                  <p className="text-xs text-slate-500">
                    Last active: {temple.lastActivity ? new Date(temple.lastActivity).toLocaleDateString() : 'Never'}
                  </p>
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
              Create Your First Temple
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
