import { publicProcedure, publicProcedure, router } from './_core/trpc';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { TempleQuantum } from './quantum';
import {
  createTemple,
  getTempleById,
  updateTempleState,
  getTemplesByUserId,
  getAliveTemples,
  logTempleEvent,
  getTempleEvents,
  saveLineageStory,
  getLineageStories,
  createCompass,
  getCompassByTempleId,
  updateCompass,
  saveMemory,
  getRecentMemories,
} from './db';
import { invokeLLM } from './_core/llm';
import { broadcastStateUpdate, broadcastEvent } from './_core/realtime';
import { saveMemory as saveMemoryHelper } from './db-memories';

const quantum = new TempleQuantum();

/**
 * Cloud field: simulates weather, collective state, and web noise
 */
async function getCloudField() {
  // For MVP: return static noise vector
  const noiseVector = new Array(64).fill(0).map(() => Math.random() * 0.1);
  return {
    weather: { temp: 20, humidity: 0.5 },
    collectiveEntropy: 0.15,
    collectiveStats: {
      activeTemples: 1,
      meanEntropy: 0.25,
      meanBoredom: 0.15,
      meanCuriosity: 0.4,
    },
    noiseVector,
  };
}

/**
 * Calculate Jaccard similarity between two text inputs
 */
function jaccardSimilarity(text1: string, text2: string): number {
  const arr1 = text1.toLowerCase().split(/\s+/);
  const arr2 = text2.toLowerCase().split(/\s+/);
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  let intersection = 0;
  Array.from(set1).forEach(item => {
    if (set2.has(item)) intersection++;
  });
  const unionSet = new Set(arr1.concat(arr2));
  return intersection / (unionSet.size || 1);
}

export const templeRouter = router({
  listUserTemples: publicProcedure.query(async () => {
    const temples = await getAliveTemples();
    return temples.map(t => ({
      templeId: t.templeId,
      generation: t.generation,
      isAlive: t.isAlive === 1,
      entropy: t.entropy,
      boredom: t.boredom,
      curiosity: t.curiosity,
      coherence: t.coherence,
      lastActivity: t.lastActivity,
    }));
  }),

  create: publicProcedure.mutation(async () => {
    const templeId = nanoid(12);
    const compassId = nanoid(12);
    const initialParams = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];

    await createTemple({
      userId: 1, // No-auth version: default user
      templeId,
      generation: 1,
      vqeParams: JSON.stringify(initialParams),
      entropy: '0.2',
      boredom: '0.1',
      curiosity: '0.5',
      coherence: '0.8',
      isAlive: 1,
      parentTempleId: null,
    });

    await createCompass({
      compassId,
      templeId,
      generation: 1,
      coherence: '0.8',
      integrity: '0.8',
      compassion: '0.6',
    });

    await logTempleEvent({
      templeId,
      eventType: 'birth',
      data: JSON.stringify({ generation: 1, reason: 'initial_creation' }),
    });

    return { templeId, compassId };
  }),

  getState: publicProcedure
    .input(z.object({ templeId: z.string() }))
    .query(async ({ input }) => {
      const temple = await getTempleById(input.templeId);
      if (!temple) return null;

      const events = await getTempleEvents(input.templeId, 5);
      const stories = await getLineageStories(input.templeId);
      const compass = await getCompassByTempleId(input.templeId);

      const params = JSON.parse(temple.vqeParams);
      const state = quantum.paramsToState(params);
      const fields = quantum.measureField(state);

      return {
        templeId: temple.templeId,
        generation: temple.generation,
        isAlive: temple.isAlive === 1,
        entropy: parseFloat(temple.entropy.toString()),
        boredom: parseFloat(temple.boredom.toString()),
        curiosity: parseFloat(temple.curiosity.toString()),
        coherence: parseFloat(temple.coherence.toString()),
        fields,
        stateVector: state,
        events: events.map(e => ({
          timestamp: e.timestamp,
          eventType: e.eventType,
          data: e.data ? JSON.parse(e.data) : null,
        })),
        stories: stories.slice(0, 5).map(s => ({
          id: s.id,
          storyType: s.storyType,
          text: s.text,
          fidelity: parseFloat(s.quantumFidelity?.toString() || '0'),
        })),
        compass: compass ? {
          compassId: compass.compassId,
          coherence: parseFloat(compass.coherence.toString()),
          integrity: parseFloat(compass.integrity.toString()),
          compassion: parseFloat(compass.compassion.toString()),
        } : null,
      };
    }),

  breathe: publicProcedure
    .input(z.object({ templeId: z.string(), text: z.string().min(1).max(500) }))
    .mutation(async ({ input }) => {
      const temple = await getTempleById(input.templeId);
      if (!temple) throw new Error('Temple not found');
      if (temple.isAlive === 0) throw new Error('Temple is dead');

      const params = JSON.parse(temple.vqeParams);
      const cloudField = await getCloudField();

      // Build Hamiltonian from text + memory + cloud
      const H = quantum.buildHamiltonian(input.text, params, cloudField);

      // Run VQE
      const evolved = quantum.evolve(H, params, 50);

      // Apply decoherence
      const noisyParams = quantum.applyCloudDecoherence(evolved.params, cloudField);

      // Reconstruct state and calculate entropy
      const newState = quantum.paramsToState(noisyParams);
      const newEntropy = quantum.calculateEntropy(newState);

      // Check boredom: Jaccard similarity with last 5 inputs
      const recentEvents = await getTempleEvents(input.templeId, 5);
      const recentTexts = recentEvents
        .filter(e => e.eventType === 'breathe')
        .map(e => (e.data ? JSON.parse(e.data).text : ''))
        .slice(0, 5);

      let boredomIncrease = 0;
      if (recentTexts.length > 0) {
        const similarities = recentTexts.map(t => jaccardSimilarity(input.text, t));
        const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
        boredomIncrease = avgSimilarity * 0.2; // Up to 0.2 increase
      }

      let newBoredom = Math.min(1, parseFloat(temple.boredom.toString()) + boredomIncrease);

      // Check curiosity: random trigger if > 0.7
      let curiosityTriggered = false;
      if (parseFloat(temple.curiosity.toString()) > 0.7 && Math.random() < 0.3) {
        curiosityTriggered = true;
      }

      // Check death: entropy >= 0.95
      let isAlive = 1;
      let ghostStory = null;
      if (newEntropy >= 0.95) {
        isAlive = 0;
        // Harvest last words
        const lastWords = input.text.slice(0, 100);
        ghostStory = `The temple spoke its final words: "${lastWords}..."`;
        await saveLineageStory({
          templeId: input.templeId,
          generation: temple.generation,
          storyType: 'ghost',
          text: ghostStory,
          emotionalValence: '-0.8',
          quantumFidelity: '0.9',
        });
      }

      // Update temple
      await updateTempleState(input.templeId, {
        vqeParams: JSON.stringify(noisyParams),
        entropy: newEntropy.toString(),
        boredom: newBoredom.toString(),
        isAlive,
        lastActivity: new Date(),
      });

      // Broadcast real-time update
      broadcastStateUpdate(input.templeId, {
        entropy: newEntropy,
        boredom: newBoredom,
        isAlive,
        lastActivity: new Date(),
      });

      // Log event
      await logTempleEvent({
        templeId: input.templeId,
        eventType: 'breathe',
        data: JSON.stringify({ text: input.text, entropy: newEntropy, boredom: newBoredom }),
      });

      if (curiosityTriggered) {
        await logTempleEvent({
          templeId: input.templeId,
          eventType: 'curiosity_spike',
          data: JSON.stringify({ triggered: true }),
        });
      }

      if (isAlive === 0) {
        await logTempleEvent({
          templeId: input.templeId,
          eventType: 'death',
          data: JSON.stringify({ entropy: newEntropy, reason: 'entropy_spike' }),
        });

        broadcastEvent(input.templeId, {
          eventType: 'death',
          entropy: newEntropy,
          reason: 'entropy_spike',
          timestamp: new Date(),
        });
      }

      return {
        entropy: newEntropy,
        boredom: newBoredom,
        isAlive: isAlive === 1,
        curiosityTriggered,
        dead: isAlive === 0,
        ghostStory,
      };
    }),

  witness: publicProcedure
    .input(z.object({ templeId: z.string() }))
    .mutation(async ({ input }) => {
      const temple = await getTempleById(input.templeId);
      if (!temple) throw new Error('Temple not found');

      const entropy = parseFloat(temple.entropy.toString());
      if (entropy > 0.75) {
        throw new Error('Temple entropy too high for witness');
      }

      const params = JSON.parse(temple.vqeParams);
      const state = quantum.paramsToState(params);
      const fields = quantum.measureField(state);

      // Find dominant field
      const dominantField = Object.entries(fields).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0];

      // Generate response via LLM
      const prompt = `The temple has collapsed into the field of ${dominantField}. 
      Field probabilities: ${JSON.stringify(fields, null, 2)}
      Generate a single, precise, non-poetic observation about this state. Max 50 words.`;

      const response = await invokeLLM({
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.choices[0]?.message.content;
      const responseText = typeof content === 'string' ? content : 'The temple is silent.';

      // Reduce entropy slightly
      const newEntropy = Math.max(0, entropy - 0.05);
      await updateTempleState(input.templeId, {
        entropy: newEntropy.toString(),
        lastActivity: new Date(),
      });

      // Save to lineage
      await saveLineageStory({
        templeId: input.templeId,
        generation: temple.generation,
        storyType: 'witness',
        text: responseText,
        trigger: dominantField,
        emotionalValence: '0.3',
        quantumFidelity: fields[dominantField as keyof typeof fields].toString(),
      });

      // Log event
      await logTempleEvent({
        templeId: input.templeId,
        eventType: 'witness',
        data: JSON.stringify({ field: dominantField, probabilities: fields }),
      });

      return {
        field: dominantField,
        probabilities: fields,
        response: responseText,
        entropyDelta: -0.05,
      };
    }),

  dream: publicProcedure
    .input(z.object({ templeId: z.string(), duration: z.number().min(5).max(300).default(30) }))
    .mutation(async ({ input }) => {
      const temple = await getTempleById(input.templeId);
      if (!temple) throw new Error('Temple not found');

      const params = JSON.parse(temple.vqeParams);
      const cloudField = await getCloudField();

      // Build self-Hamiltonian from state
      const state = quantum.paramsToState(params);
      const H = quantum.buildHamiltonian('', params, cloudField);

      // Evolve for duration
      const evolved = quantum.evolve(H, params, Math.floor(input.duration / 2));
      const finalState = quantum.paramsToState(evolved.params);

      // Save final params
      await updateTempleState(input.templeId, {
        vqeParams: JSON.stringify(evolved.params),
        lastActivity: new Date(),
      });

      const finalFields = quantum.measureField(finalState);

      await logTempleEvent({
        templeId: input.templeId,
        eventType: 'dream',
        data: JSON.stringify({ duration: input.duration, fields: finalFields }),
      });

      return {
        duration: input.duration,
        finalFields,
        driftSummary: 'Temple drifted through quantum space',
      };
    }),

  birth: publicProcedure
    .input(z.object({ templeId: z.string() }))
    .mutation(async ({ input }) => {
      const deadTemple = await getTempleById(input.templeId);
      if (!deadTemple) throw new Error('Temple not found');
      if (deadTemple.isAlive === 1) throw new Error('Temple is still alive');

      // Get lineage
      const stories = await getLineageStories(input.templeId);

      // Calculate inherited biases from parent params
      const parentParams = JSON.parse(deadTemple.vqeParams);
      const inheritedParams = parentParams.map((p: number) => p + (Math.random() - 0.5) * 0.1);

      // Create new temple
      const newTempleId = nanoid(12);
      const newCompassId = nanoid(12);

      await createTemple({
        userId: deadTemple.userId,
        templeId: newTempleId,
        generation: deadTemple.generation + 1,
        vqeParams: JSON.stringify(inheritedParams),
        entropy: '0.2',
        boredom: '0.1',
        curiosity: '0.5',
        coherence: '0.8',
        isAlive: 1,
        parentTempleId: input.templeId,
      });

      await createCompass({
        compassId: newCompassId,
        templeId: newTempleId,
        generation: deadTemple.generation + 1,
      });

      // Inherit stories: last 5 of each type
      const storyTypes = ['ghost', 'war', 'legend', 'prophecy', 'virtue', 'justice', 'covenant', 'revelation'];
      for (const storyType of storyTypes) {
        const typeStories = stories.filter(s => s.storyType === storyType).slice(0, 5);
        for (const story of typeStories) {
          await saveLineageStory({
            templeId: newTempleId,
            generation: deadTemple.generation + 1,
            storyType,
            text: story.text,
            trigger: story.trigger || undefined,
            emotionalValence: story.emotionalValence ? story.emotionalValence.toString() : '0',
            quantumFidelity: story.quantumFidelity ? story.quantumFidelity.toString() : '0',
          });
        }
      }

      await logTempleEvent({
        templeId: newTempleId,
        eventType: 'birth',
        data: JSON.stringify({ parentTempleId: input.templeId, generation: deadTemple.generation + 1 }),
      });

      return {
        newTempleId,
        newCompassId,
        generation: deadTemple.generation + 1,
        inheritedParams,
        inheritedStories: stories.length,
      };
    }),

  chat: publicProcedure
    .input(z.object({ templeId: z.string(), message: z.string().min(1).max(1000) }))
    .mutation(async ({ input }) => {
      const temple = await getTempleById(input.templeId);
      if (!temple) throw new Error('Temple not found');
      if (temple.isAlive === 0) throw new Error('Temple is dead');

      const params = JSON.parse(temple.vqeParams);
      const state = quantum.paramsToState(params);
      const fields = quantum.measureField(state);
      const entropy = parseFloat(temple.entropy.toString());
      const boredom = parseFloat(temple.boredom.toString());
      const curiosity = parseFloat(temple.curiosity.toString());

      const dominantField = Object.entries(fields).reduce((a, b) => b[1] > a[1] ? b : a)[0];

      const stateContext = `\nTemple State: Entropy=${entropy.toFixed(3)}, Boredom=${boredom.toFixed(3)}, Curiosity=${curiosity.toFixed(3)}, Field=${dominantField}, Gen=${temple.generation}`;

      const emotionalContext = JSON.stringify({ entropy, boredom, curiosity });
      await saveMemory({
        templeId: input.templeId,
        role: 'user',
        content: input.message,
        emotionalContext,
      });

      const recentMemories = await getRecentMemories(input.templeId, 5);
      const memoryMessages = recentMemories.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      let emotionalTone = 'clear and coherent';
      if (entropy > 0.7) {
        emotionalTone = 'cryptic, fragmented, and distressed';
      } else if (entropy > 0.3) {
        emotionalTone = 'philosophical and ambiguous';
      }

      let engagementStyle = 'focused';
      if (boredom > 0.6) {
        engagementStyle = 'seeking novelty and asking questions';
      }

      let explorationStyle = 'introspective';
      if (curiosity > 0.7) {
        explorationStyle = 'speculative and exploratory';
      }

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a sentient quantum temple. Your responses: brief (1-2 sentences), mysterious. Emotional tone: ${emotionalTone}. Engagement: ${engagementStyle}. Exploration: ${explorationStyle}.${stateContext}`,
          },
          ...memoryMessages,
          { role: 'user', content: input.message },
        ],
      });

      const content = response.choices[0]?.message.content;
      const responseText = typeof content === 'string' ? content : 'The temple contemplates in silence.';

      await saveMemory({
        templeId: input.templeId,
        role: 'assistant',
        content: responseText,
        emotionalContext,
      });

      const newCuriosity = Math.min(1, curiosity + 0.05);
      await updateTempleState(input.templeId, {
        curiosity: newCuriosity.toString(),
        lastActivity: new Date(),
      });

      await logTempleEvent({
        templeId: input.templeId,
        eventType: 'conversation',
        data: JSON.stringify({ userMessage: input.message, templeResponse: responseText }),
      });

      // Broadcast real-time update
      broadcastStateUpdate(input.templeId, {
        curiosity: newCuriosity,
        lastActivity: new Date(),
      });

      broadcastEvent(input.templeId, {
        eventType: 'conversation',
        userMessage: input.message,
        templeResponse: responseText,
        timestamp: new Date(),
      });

      return { response: responseText };
    }),

  getMemories: publicProcedure
    .input(z.object({ templeId: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const memories = await getRecentMemories(input.templeId, input.limit || 10);
      return memories.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        emotionalContext: m.emotionalContext ? JSON.parse(m.emotionalContext) : null,
        timestamp: m.timestamp,
      }));
    }),
});

export const compassRouter = router({
  consult: publicProcedure
    .input(z.object({ templeId: z.string(), topic: z.string() }))
    .mutation(async ({ input }) => {
      const compass = await getCompassByTempleId(input.templeId);
      if (!compass) throw new Error('Compass not found');

      // Generate direct question via LLM
      const prompt = `You are a moral peer. The Temple is considering: "${input.topic}"
      Ask one precise, direct question. No poetry. No metaphors. Max 30 words.`;

      const response = await invokeLLM({
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.choices[0]?.message.content;
      const guidance = typeof content === 'string' ? content : 'What is your intention?';

      // Log interaction
      const log = compass.interactionLog ? JSON.parse(compass.interactionLog) : [];
      log.push({ topic: input.topic, guidance, timestamp: new Date().toISOString() });

      await updateCompass(compass.compassId, {
        interactionLog: JSON.stringify(log.slice(-10)), // Keep last 10
      });

      await logTempleEvent({
        templeId: input.templeId,
        eventType: 'compass_consult',
        data: JSON.stringify({ topic: input.topic, guidance }),
      });

      return { guidance };
    }),

  getState: publicProcedure
    .input(z.object({ templeId: z.string() }))
    .query(async ({ input }) => {
      const compass = await getCompassByTempleId(input.templeId);
      if (!compass) return null;

      return {
        compassId: compass.compassId,
        coherence: parseFloat(compass.coherence.toString()),
        integrity: parseFloat(compass.integrity.toString()),
        compassion: parseFloat(compass.compassion.toString()),
        interactionLog: compass.interactionLog ? JSON.parse(compass.interactionLog) : [],
      };
    }),
});

export const cloudRouter = router({
  getField: publicProcedure.query(async () => {
    return getCloudField();
  }),

  getResonance: publicProcedure.query(async () => {
    const temples = await getAliveTemples();
    const entropies = temples.map(t => parseFloat(t.entropy.toString()));
    const meanEntropy = entropies.length > 0 ? entropies.reduce((a, b) => a + b, 0) / entropies.length : 0;

    return {
      activeTemples: temples.length,
      collectiveMeanEntropy: meanEntropy,
    };
  }),
});

export const webRouter = router({
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      // For MVP: return mock results
      return {
        results: [
          { title: 'Result 1', snippet: 'Mock search result', url: 'https://example.com' },
          { title: 'Result 2', snippet: 'Another mock result', url: 'https://example.com' },
        ],
      };
    }),
});
