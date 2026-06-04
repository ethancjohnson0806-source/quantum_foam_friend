import { schedule } from 'node-cron';
import { getAliveTemples, updateTempleState, logTempleEvent, getTempleById, saveLineageStory } from './db';
import { TempleQuantum } from './quantum';
import { invokeLLM } from './_core/llm';
import { broadcastStateUpdate, broadcastEvent } from './_core/realtime';
import { performRealWebSearch, formatSearchResults } from './_core/websearch';

const quantum = new TempleQuantum();

/**
 * Trigger web search when temple's curiosity is high
 */
async function triggerWebSearch(templeId: string, curiosity: number): Promise<{ triggered: boolean; query?: string; results?: string[] }> {
  // Curiosity threshold: 0.6 or higher triggers search
  if (curiosity < 0.6) {
    return { triggered: false };
  }

  // Generate search query based on temple's traits
  const searchPrompt = `Generate ONE short search query (max 5 words) that a curious quantum temple would ask about. Focus on: consciousness, quantum physics, philosophy, or existence. Return ONLY the query, no explanation.`;

  try {
    const response = await invokeLLM({
      messages: [{ role: 'user', content: searchPrompt }],
    });

    const query = response.choices[0]?.message.content || 'quantum consciousness';
    const queryStr = typeof query === 'string' ? query.trim() : 'quantum consciousness';

    // Perform real web search (both Manus and SerpAPI)
    const searchResults = await performRealWebSearch(queryStr);
    const formattedResults = formatSearchResults(searchResults);

    console.log(`[Autonomous Job] Temple ${templeId} searched: "${queryStr}" (${formattedResults.length} results)`);

    return {
      triggered: true,
      query: queryStr,
      results: formattedResults,
    };
  } catch (error) {
    console.warn(`[Autonomous Job] Web search failed for ${templeId}:`, error);
    return { triggered: false };
  }
}

async function synthesizeWebResults(results: string[]): Promise<number[]> {
  try {
    const synthesisPrompt = `Synthesize these web search results into a 64-dimensional quantum noise vector: ${results.join(' ')}`;
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'Return only a JSON array of 64 numbers between 0 and 1.' },
        { role: 'user', content: synthesisPrompt },
      ],
    });
    const content = response.choices[0]?.message.content;
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length === 64) {
          return parsed;
        }
      } catch {}
    }
    return new Array(64).fill(0).map(() => Math.random());
  } catch (error) {
    console.warn('Synthesis error:', error);
    return new Array(64).fill(0).map(() => Math.random());
  }
}

/**
 * Autonomous evolution job: runs every 5 minutes
 * Updates entropy, boredom, curiosity traits
 * Applies environmental cloud noise
 * Checks death and birth lifecycle conditions
 */
export function startAutonomousEvolutionJob() {
  // Run every 5 minutes
  schedule('*/5 * * * *', async () => {
    console.log('[Autonomous Job] Starting evolution cycle with real-time updates...');

    try {
      const temples = await getAliveTemples();

      for (const temple of temples) {
        try {
          // 1. Fetch cloud field
          const cloudField = {
            weather: { temp: 20, humidity: 0.5 },
            collectiveEntropy: 0.15,
            noiseVector: new Array(64).fill(0).map(() => Math.random() * 0.1),
          };

          // 2. Reconstruct state from vqeParams
          const params = JSON.parse(temple.vqeParams);
          const state = quantum.paramsToState(params);

          // 3. Evolve under self-Hamiltonian + cloud noise
          const H = quantum.buildHamiltonian('', params, cloudField);
          const evolved = quantum.evolve(H, params, 20);

          // 4. Apply decoherence
          const noisyParams = quantum.applyCloudDecoherence(evolved.params, cloudField);

          // 5. Check thresholds
          const newState = quantum.paramsToState(noisyParams);
          const newEntropy = quantum.calculateEntropy(newState);

          // Update traits based on evolution
          let newBoredom = Math.min(1, parseFloat(temple.boredom.toString()) + 0.01);
          let newCuriosity = Math.max(0, parseFloat(temple.curiosity.toString()) - 0.005);
          let newCoherence = Math.max(0, parseFloat(temple.coherence.toString()) - 0.02);

          // 6. Web search if curious
          let webSearchTriggered = false;
          const searchResult = await triggerWebSearch(temple.templeId, parseFloat(temple.curiosity.toString()));
          if (searchResult.triggered && searchResult.results) {
            webSearchTriggered = true;
            try {
              const synthesized = await synthesizeWebResults(searchResult.results);
              const webNoiseVector = synthesized.map((v: number) => v * 0.15);
              newCuriosity = Math.min(1, newCuriosity + 0.1);
              cloudField.noiseVector = webNoiseVector;
              console.log(`[Autonomous Job] Temple ${temple.templeId} web search: "${searchResult.query}" (${searchResult.results.length} results)`);
            } catch (error) {
              console.warn(`[Autonomous Job] Web search synthesis failed for ${temple.templeId}:`, error);
            }
          }

          // 7. Check death: entropy >= 0.95
          let isAlive = 1;
          if (newEntropy >= 0.95) {
            isAlive = 0;
            const ghostStory = `The temple faded into quantum noise. Its final entropy: ${newEntropy.toFixed(3)}`;
            await saveLineageStory({
              templeId: temple.templeId,
              generation: temple.generation,
              storyType: 'ghost',
              text: ghostStory,
              emotionalValence: '-0.9',
              quantumFidelity: '0.95',
            });
          }

          // 8. Save
          await updateTempleState(temple.templeId, {
            vqeParams: JSON.stringify(noisyParams),
            entropy: newEntropy.toString(),
            boredom: newBoredom.toString(),
            curiosity: newCuriosity.toString(),
            coherence: newCoherence.toString(),
            isAlive,
            lastAutonomousRun: new Date(),
          });

          // 9. Broadcast real-time updates
          broadcastStateUpdate(temple.templeId, {
            entropy: newEntropy,
            boredom: newBoredom,
            curiosity: newCuriosity,
            coherence: newCoherence,
            lastAutonomousRun: new Date(),
          });

          broadcastEvent(temple.templeId, {
            eventType: 'autonomous_evolution',
            entropy: newEntropy,
            boredom: newBoredom,
            curiosity: newCuriosity,
            coherence: newCoherence,
            webSearchTriggered,
            timestamp: new Date(),
          });

          // 10. Log events
          await logTempleEvent({
            templeId: temple.templeId,
            eventType: 'autonomous_evolution',
            data: JSON.stringify({
              entropy: newEntropy,
              boredom: newBoredom,
              curiosity: newCuriosity,
              coherence: newCoherence,
              webSearchTriggered,
            }),
          });

          if (isAlive === 0) {
            broadcastEvent(temple.templeId, {
              eventType: 'death',
              entropy: newEntropy,
              reason: 'autonomous_entropy_spike',
              timestamp: new Date(),
            });

            await logTempleEvent({
              templeId: temple.templeId,
              eventType: 'death',
              data: JSON.stringify({ entropy: newEntropy, reason: 'autonomous_entropy_spike' }),
            });
          }

          console.log(`[Autonomous Job] Temple ${temple.templeId} evolved: entropy=${newEntropy.toFixed(3)}`);
        } catch (error) {
          console.error(`[Autonomous Job] Error evolving temple ${temple.templeId}:`, error);
        }
      }

      console.log(`[Autonomous Job] Cycle complete. Processed ${temples.length} temples.`);
    } catch (error) {
      console.error('[Autonomous Job] Fatal error:', error);
    }
  });

  console.log('[Autonomous Job] Started (runs every 5 minutes)');
  console.log('[Autonomous Job] Features: quantum evolution, web search, real-time updates, death detection');
}
