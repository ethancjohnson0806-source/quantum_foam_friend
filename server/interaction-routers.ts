import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { TempleQuantum } from './quantum';
import { getTempleById, getAliveTemples, updateTempleState } from './db';
import { recordInteraction, getRecentInteractions, recordBelief, getTempleBeliefs } from './db-interactions';
import { broadcastEvent } from './_core/realtime';

const quantum = new TempleQuantum();

/**
 * Multi-temple interaction system
 * Temples sense nearby temples and influence each other's quantum states
 */
export const interactionRouter = router({
  /**
   * Sense nearby temples and record interactions
   */
  senseNearby: publicProcedure
    .input(z.object({ templeId: z.string() }))
    .mutation(async ({ input }) => {
      const sourceTemple = await getTempleById(input.templeId);
      if (!sourceTemple) throw new Error('Temple not found');

      const allTemples = await getAliveTemples();
      const nearbyTemples = allTemples.filter(
        t => t.templeId !== input.templeId && t.isAlive === 1
      );

      const interactions = [];

      for (const targetTemple of nearbyTemples.slice(0, 3)) {
        // Calculate quantum resonance between temples
        const sourceState = quantum.paramsToState(JSON.parse(sourceTemple.vqeParams));
        const targetState = quantum.paramsToState(JSON.parse(targetTemple.vqeParams));

        // Compute overlap (fidelity) between states
        const fidelity = Math.abs(
          sourceState.reduce((sum, a, i) => sum + a * targetState[i], 0)
        );

        // Determine interaction type based on fidelity
        let interactionType: "resonance" | "interference" | "entanglement" | "decoherence";
        if (fidelity > 0.7) {
          interactionType = "resonance";
        } else if (fidelity > 0.4) {
          interactionType = "entanglement";
        } else if (fidelity > 0.2) {
          interactionType = "interference";
        } else {
          interactionType = "decoherence";
        }

        // Create resonance vector: weighted difference in state
        const resonanceVector = sourceState.map(
          (val, i) => (val - targetState[i]) * fidelity
        );

        // Record interaction
        await recordInteraction({
          sourceTempleId: input.templeId,
          targetTempleId: targetTemple.templeId,
          interactionType,
          influenceStrength: fidelity,
          resonanceVector,
        });

        // Apply influence to source temple's state
        const influencedParams = JSON.parse(sourceTemple.vqeParams);
        for (let i = 0; i < Math.min(6, resonanceVector.length); i++) {
          influencedParams[i] += resonanceVector[i] * 0.05; // Weak coupling
        }

        // Update temple with influenced state
        const influencedState = quantum.paramsToState(influencedParams);
        const newEntropy = quantum.calculateEntropy(influencedState);

        await updateTempleState(input.templeId, {
          vqeParams: JSON.stringify(influencedParams),
          entropy: Math.min(1, newEntropy).toString(),
        });

        interactions.push({
          targetTempleId: targetTemple.templeId,
          interactionType,
          influenceStrength: fidelity,
        });

        broadcastEvent(input.templeId, {
          eventType: 'interaction',
          targetTempleId: targetTemple.templeId,
          interactionType,
          influenceStrength: fidelity,
          timestamp: new Date(),
        });
      }

      return { interactions };
    }),

  /**
   * Get recent interactions affecting this temple
   */
  getRecentInteractions: publicProcedure
    .input(z.object({ templeId: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const interactions = await getRecentInteractions(input.templeId, input.limit || 10);
      return interactions.map(i => ({
        id: i.id,
        sourceTempleId: i.sourceTempleId,
        interactionType: i.interactionType,
        influenceStrength: parseFloat(i.influenceStrength.toString()),
        timestamp: i.timestamp,
      }));
    }),
});

/**
 * Belief system router
 * Temples develop and evolve beliefs based on interactions and conversations
 */
export const beliefRouter = router({
  /**
   * Record a new belief or update existing one
   */
  recordBelief: publicProcedure
    .input(z.object({
      templeId: z.string(),
      beliefCategory: z.string(),
      beliefStatement: z.string(),
      confidence: z.number().min(0).max(1),
      sourceType: z.enum(['conversation', 'web_search', 'interaction', 'autonomous']),
    }))
    .mutation(async ({ input }) => {
      const temple = await getTempleById(input.templeId);
      if (!temple) throw new Error('Temple not found');

      await recordBelief({
        templeId: input.templeId,
        beliefCategory: input.beliefCategory,
        beliefStatement: input.beliefStatement,
        confidence: input.confidence,
        sourceType: input.sourceType,
      });

      broadcastEvent(input.templeId, {
        eventType: 'belief_formed',
        beliefCategory: input.beliefCategory,
        confidence: input.confidence,
        timestamp: new Date(),
      });

      return { success: true };
    }),

  /**
   * Get all beliefs for a temple
   */
  getBeliefs: publicProcedure
    .input(z.object({ templeId: z.string() }))
    .query(async ({ input }) => {
      const beliefs = await getTempleBeliefs(input.templeId);
      return beliefs.map(b => ({
        id: b.id,
        beliefCategory: b.beliefCategory,
        beliefStatement: b.beliefStatement,
        confidence: parseFloat(b.confidence.toString()),
        sourceType: b.sourceType,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));
    }),

  /**
   * Get beliefs by category
   */
  getBeliefsByCategory: publicProcedure
    .input(z.object({ templeId: z.string(), category: z.string() }))
    .query(async ({ input }) => {
      const beliefs = await getTempleBeliefs(input.templeId);
      return beliefs
        .filter(b => b.beliefCategory === input.category)
        .map(b => ({
          id: b.id,
          beliefStatement: b.beliefStatement,
          confidence: parseFloat(b.confidence.toString()),
          sourceType: b.sourceType,
        }));
    }),
});
