import { describe, it, expect } from 'vitest';
import { TempleQuantum } from './quantum';

describe('TempleQuantum', () => {
  const quantum = new TempleQuantum();

  describe('paramsToState', () => {
    it('should reconstruct a 64-dimensional state from 6 parameters', () => {
      const params = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
      const state = quantum.paramsToState(params);

      expect(state).toHaveLength(64);
      expect(state.every(x => typeof x === 'number')).toBe(true);
    });

    it('should normalize the state to unit norm', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);

      const norm = Math.sqrt(state.reduce((sum, x) => sum + x * x, 0));
      expect(norm).toBeCloseTo(1, 5);
    });

    it('should throw error for wrong number of parameters', () => {
      expect(() => quantum.paramsToState([0.1, 0.2])).toThrow();
    });
  });

  describe('buildHamiltonian', () => {
    it('should return a 64x64 matrix (4096 elements)', () => {
      const H = quantum.buildHamiltonian('test', null, null);
      expect(H).toHaveLength(4096);
    });

    it('should create a symmetric Hamiltonian', () => {
      const H = quantum.buildHamiltonian('test', null, null);
      for (let i = 0; i < 64; i++) {
        for (let j = 0; j < 64; j++) {
          expect(H[i * 64 + j]).toBeCloseTo(H[j * 64 + i], 10);
        }
      }
    });

    it('should handle cloud field with noise vector', () => {
      const cloudField = {
        noiseVector: new Array(64).fill(0.1),
      };
      const H = quantum.buildHamiltonian('test', null, cloudField);
      expect(H).toHaveLength(4096);
    });

    it('should handle short noise vectors gracefully', () => {
      const cloudField = {
        noiseVector: [0.1, 0.2, 0.3],
      };
      const H = quantum.buildHamiltonian('test', null, cloudField);
      expect(H).toHaveLength(4096);
      expect(H.every(x => !isNaN(x))).toBe(true);
    });
  });

  describe('evolve', () => {
    it('should return evolved params, energy, and state', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const H = quantum.buildHamiltonian('test', null, null);
      const result = quantum.evolve(H, params, 10);

      expect(result).toHaveProperty('params');
      expect(result).toHaveProperty('energy');
      expect(result).toHaveProperty('state');
      expect(result.params).toHaveLength(6);
      expect(result.state).toHaveLength(64);
    });

    it('should reduce energy over iterations', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const H = quantum.buildHamiltonian('test', null, null);

      const result1 = quantum.evolve(H, params, 5);
      const result2 = quantum.evolve(H, params, 50);

      // More iterations should generally lead to lower energy
      expect(result2.energy).toBeLessThanOrEqual(result1.energy + 0.1);
    });
  });

  describe('applyCloudDecoherence', () => {
    it('should add noise to parameters', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const cloudField = { collectiveEntropy: 0.1 };

      const noisyParams = quantum.applyCloudDecoherence(params, cloudField);

      expect(noisyParams).toHaveLength(6);
      // At least some params should change
      expect(noisyParams.some((p, i) => Math.abs(p - params[i]) > 0.001)).toBe(true);
    });
  });

  describe('measureField', () => {
    it('should return probabilities for 5 fields', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);
      const fields = quantum.measureField(state);

      expect(Object.keys(fields)).toEqual([
        'diffusion',
        'convergence',
        'coherence',
        'singularity',
        'dissolution',
      ]);
    });

    it('should normalize probabilities to sum to 1', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);
      const fields = quantum.measureField(state);

      const sum = Object.values(fields).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
    });

    it('should have probabilities between 0 and 1', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);
      const fields = quantum.measureField(state);

      Object.values(fields).forEach(prob => {
        expect(prob).toBeGreaterThanOrEqual(0);
        expect(prob).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('quantumFidelity', () => {
    it('should return 1 for identical states', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);
      const fidelity = quantum.quantumFidelity(state, state);

      expect(fidelity).toBeCloseTo(1, 5);
    });

    it('should return value between 0 and 1', () => {
      const params1 = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const params2 = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const state1 = quantum.paramsToState(params1);
      const state2 = quantum.paramsToState(params2);
      const fidelity = quantum.quantumFidelity(state1, state2);

      expect(fidelity).toBeGreaterThanOrEqual(0);
      expect(fidelity).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateEntropy', () => {
    it('should return value between 0 and 1', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);
      const entropy = quantum.calculateEntropy(state);

      expect(entropy).toBeGreaterThanOrEqual(0);
      expect(entropy).toBeLessThanOrEqual(1);
    });

    it('should return 1 for maximally mixed state', () => {
      // Uniform superposition has maximum entropy
      const uniformState = new Array(64).fill(1 / Math.sqrt(64));
      const entropy = quantum.calculateEntropy(uniformState);

      expect(entropy).toBeCloseTo(1, 1);
    });
  });

  describe('textToParams', () => {
    it('should convert text to 6 parameters', () => {
      const params = quantum.textToParams('test text');
      expect(params).toHaveLength(6);
      expect(params.every(p => typeof p === 'number')).toBe(true);
    });

    it('should return different params for different text', () => {
      const params1 = quantum.textToParams('text1');
      const params2 = quantum.textToParams('text2');

      expect(params1).not.toEqual(params2);
    });

    it('should return same params for same text', () => {
      const params1 = quantum.textToParams('same text');
      const params2 = quantum.textToParams('same text');

      expect(params1).toEqual(params2);
    });
  });

  describe('storyResonance', () => {
    it('should return fidelity value between 0 and 1', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);
      const resonance = quantum.storyResonance('test story', state);

      expect(resonance).toBeGreaterThanOrEqual(0);
      expect(resonance).toBeLessThanOrEqual(1);
    });

    it('should return 1 for story with same text as state', () => {
      const text = 'specific story text';
      const params = quantum.textToParams(text);
      const state = quantum.paramsToState(params);
      const resonance = quantum.storyResonance(text, state);

      expect(resonance).toBeCloseTo(1, 2);
    });
  });

  describe('rankStoriesByFidelity', () => {
    it('should rank stories by fidelity', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);

      const stories = [
        { id: 1, text: 'story one' },
        { id: 2, text: 'story two' },
        { id: 3, text: 'story three' },
      ];

      const ranked = quantum.rankStoriesByFidelity(stories, state);

      expect(ranked).toHaveLength(3);
      expect(ranked[0]).toHaveProperty('fidelity');
      // Check that fidelities are in descending order
      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].fidelity).toBeGreaterThanOrEqual(ranked[i + 1].fidelity);
      }
    });

    it('should preserve story data while adding fidelity', () => {
      const params = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
      const state = quantum.paramsToState(params);

      const stories = [{ id: 42, text: 'test story' }];
      const ranked = quantum.rankStoriesByFidelity(stories, state);

      expect(ranked[0].id).toBe(42);
      expect(ranked[0].text).toBe('test story');
    });
  });
});
