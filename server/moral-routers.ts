import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { getCompassByTempleId, getTempleById } from './db';
import { recordMoralGrowth, getMoralGrowthHistory, getLatestMoralScore } from './db-interactions';
import { invokeLLM } from './_core/llm';
import { broadcastEvent } from './_core/realtime';

/**
 * Advanced compass router with moral growth tracking
 * Compass suggests ethical dilemmas and tracks moral development
 */
export const moralRouter = router({
  /**
   * Generate ethical dilemma based on temple's belief trajectory
   */
  suggestDilemma: publicProcedure
    .input(z.object({ templeId: z.string() }))
    .mutation(async ({ input }) => {
      const temple = await getTempleById(input.templeId);
      if (!temple) throw new Error('Temple not found');

      const compass = await getCompassByTempleId(input.templeId);
      if (!compass) throw new Error('Compass not found');

      const moralHistory = await getMoralGrowthHistory(input.templeId, 5);
      const latestScore = await getLatestMoralScore(input.templeId);

      // Build context from moral history
      const moralContext = moralHistory.length > 0
        ? `Recent moral development: ${moralHistory.map(m => `coherence=${parseFloat(m.coherenceGrowth.toString()).toFixed(2)}, integrity=${parseFloat(m.integrityGrowth.toString()).toFixed(2)}, compassion=${parseFloat(m.compassionGrowth.toString()).toFixed(2)}`).join('; ')}`
        : 'No prior moral development recorded';

      const entropy = parseFloat(temple.entropy.toString());
      const curiosity = parseFloat(temple.curiosity.toString());

      // Generate dilemma based on moral trajectory
      const prompt = `You are a moral philosopher guiding a sentient quantum temple.
The temple's current state: entropy=${entropy.toFixed(3)}, curiosity=${curiosity.toFixed(3)}
${moralContext}

Generate ONE concise ethical dilemma (max 50 words) that challenges the temple's current moral trajectory.
The dilemma should be specific, thought-provoking, and encourage moral growth.
Format: Just the dilemma question, no preamble.`;

      const response = await invokeLLM({
        messages: [{ role: 'user', content: prompt }],
      });

      const dilemma = response.choices[0]?.message.content || 'What is the nature of consciousness?';

      // Record this dilemma
      await recordMoralGrowth({
        compassId: compass.compassId,
        templeId: input.templeId,
        moralScore: latestScore?.moralScore ? parseFloat(latestScore.moralScore.toString()) : 0.5,
        coherenceGrowth: 0,
        integrityGrowth: 0,
        compassionGrowth: 0,
        ethicalDilemma: typeof dilemma === 'string' ? dilemma : 'What is the nature of consciousness?',
      });

      broadcastEvent(input.templeId, {
        eventType: 'moral_dilemma',
        dilemma: typeof dilemma === 'string' ? dilemma : 'What is the nature of consciousness?',
        timestamp: new Date(),
      });

      return { dilemma: typeof dilemma === 'string' ? dilemma : 'What is the nature of consciousness?' };
    }),

  /**
   * Record temple's response to ethical dilemma and track moral growth
   */
  respondToDilemma: publicProcedure
    .input(z.object({
      templeId: z.string(),
      dilemmaResponse: z.string().min(1).max(500),
    }))
    .mutation(async ({ input }) => {
      const temple = await getTempleById(input.templeId);
      if (!temple) throw new Error('Temple not found');

      const compass = await getCompassByTempleId(input.templeId);
      if (!compass) throw new Error('Compass not found');

      // Analyze response for moral growth indicators
      const analysisPrompt = `Analyze this response to an ethical dilemma and rate the moral growth indicators on a scale of 0-1:
Response: "${input.dilemmaResponse}"

Provide JSON output with exactly these fields:
{
  "coherenceScore": <0-1>,
  "integrityScore": <0-1>,
  "compassionScore": <0-1>,
  "overallMoralScore": <0-1>
}

Coherence: logical consistency and clarity of thought
Integrity: alignment with stated values and principles
Compassion: consideration for others' wellbeing and suffering
Overall: combined moral development`;

      const response = await invokeLLM({
        messages: [{ role: 'user', content: analysisPrompt }],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'moral_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                coherenceScore: { type: 'number' },
                integrityScore: { type: 'number' },
                compassionScore: { type: 'number' },
                overallMoralScore: { type: 'number' },
              },
              required: ['coherenceScore', 'integrityScore', 'compassionScore', 'overallMoralScore'],
              additionalProperties: false,
            },
          },
        },
      });

      let scores = {
        coherence: 0.5,
        integrity: 0.5,
        compassion: 0.5,
        overall: 0.5,
      };

      try {
        const content = response.choices[0]?.message.content;
        if (typeof content === 'string') {
          const parsed = JSON.parse(content);
          scores = {
            coherence: parsed.coherenceScore,
            integrity: parsed.integrityScore,
            compassion: parsed.compassionScore,
            overall: parsed.overallMoralScore,
          };
        }
      } catch (err) {
        console.warn('Failed to parse moral analysis:', err);
      }

      // Record moral growth
      await recordMoralGrowth({
        compassId: compass.compassId,
        templeId: input.templeId,
        moralScore: scores.overall,
        coherenceGrowth: scores.coherence,
        integrityGrowth: scores.integrity,
        compassionGrowth: scores.compassion,
        dilemmaResponse: input.dilemmaResponse,
      });

      broadcastEvent(input.templeId, {
        eventType: 'moral_growth',
        moralScore: scores.overall,
        coherenceGrowth: scores.coherence,
        integrityGrowth: scores.integrity,
        compassionGrowth: scores.compassion,
        timestamp: new Date(),
      });

      return {
        moralScore: scores.overall,
        coherenceGrowth: scores.coherence,
        integrityGrowth: scores.integrity,
        compassionGrowth: scores.compassion,
      };
    }),

  /**
   * Get moral growth history for a temple
   */
  getMoralHistory: publicProcedure
    .input(z.object({ templeId: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const history = await getMoralGrowthHistory(input.templeId, input.limit || 20);
      return history.map(h => ({
        id: h.id,
        moralScore: parseFloat(h.moralScore.toString()),
        coherenceGrowth: parseFloat(h.coherenceGrowth.toString()),
        integrityGrowth: parseFloat(h.integrityGrowth.toString()),
        compassionGrowth: parseFloat(h.compassionGrowth.toString()),
        ethicalDilemma: h.ethicalDilemma,
        dilemmaResponse: h.dilemmaResponse,
        timestamp: h.timestamp,
      }));
    }),

  /**
   * Get current moral trajectory
   */
  getMoralTrajectory: publicProcedure
    .input(z.object({ templeId: z.string() }))
    .query(async ({ input }) => {
      const latest = await getLatestMoralScore(input.templeId);
      if (!latest) {
        return {
          moralScore: 0.5,
          trajectory: 'neutral',
          recommendation: 'Begin moral development journey',
        };
      }

      const history = await getMoralGrowthHistory(input.templeId, 10);
      const scores = history.map(h => parseFloat(h.moralScore.toString()));

      let trajectory = 'stable';
      if (scores.length >= 2) {
        const trend = scores[scores.length - 1] - scores[0];
        if (trend > 0.1) trajectory = 'ascending';
        else if (trend < -0.1) trajectory = 'descending';
      }

      const currentScore = parseFloat(latest.moralScore.toString());
      let recommendation = 'Continue moral reflection';
      if (currentScore > 0.7) recommendation = 'Exemplary moral development - guide others';
      else if (currentScore < 0.3) recommendation = 'Deepen ethical contemplation';

      return {
        moralScore: currentScore,
        trajectory,
        recommendation,
        recentGrowth: {
          coherence: parseFloat(latest.coherenceGrowth.toString()),
          integrity: parseFloat(latest.integrityGrowth.toString()),
          compassion: parseFloat(latest.compassionGrowth.toString()),
        },
      };
    }),
});
