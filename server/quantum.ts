import * as crypto from 'crypto';

/**
 * TempleQuantum: Core quantum simulation layer for the Temple.
 * Stores VQE rotation parameters (6 floats) instead of full state vectors.
 * Reconstructs state on demand for fidelity calculations.
 */
export class TempleQuantum {
  private numQubits = 6;
  private dim = 2 ** 6; // 64-dimensional state space

  /**
   * Reconstruct quantum state from variational parameters.
   * For MVP: use simple ansatz based on parameter angles.
   * Returns a 64-dimensional complex state vector (as real numbers for storage).
   */
  paramsToState(params: number[]): number[] {
    if (params.length !== 6) {
      throw new Error('Expected 6 parameters');
    }

    // Simple ansatz: initialize uniform superposition, apply rotation gates
    const state = new Array(this.dim).fill(0);
    state[0] = 1 / Math.sqrt(this.dim); // Start in uniform superposition

    // Apply rotations based on params
    for (let i = 0; i < 6; i++) {
      const angle = params[i];
      // Rotate pairs of amplitudes
      for (let j = 0; j < this.dim; j += 2 ** (i + 1)) {
        for (let k = 0; k < 2 ** i; k++) {
          const idx1 = j + k;
          const idx2 = j + 2 ** i + k;
          if (idx2 < this.dim) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const temp1 = state[idx1] * cos - state[idx2] * sin;
            const temp2 = state[idx1] * sin + state[idx2] * cos;
            state[idx1] = temp1;
            state[idx2] = temp2;
          }
        }
      }
    }

    // Normalize
    const norm = Math.sqrt(state.reduce((sum, x) => sum + x * x, 0));
    return state.map(x => x / (norm || 1));
  }

  /**
   * Build Hamiltonian from text input, memory params, and cloud field.
   * Returns a 64x64 matrix as a flat array (row-major).
   */
  buildHamiltonian(
    text: string,
    memoryParams: number[] | null,
    cloudField: { noiseVector: number[] } | null
  ): number[] {
    const H = new Array(this.dim * this.dim).fill(0);

    // 1. Semantic Hamiltonian from text
    const tokens = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const field = new Array(this.dim).fill(0);
    for (const token of tokens) {
      const hash = this.hashToken(token);
      const idx = Math.abs(hash) % this.dim;
      field[idx] += 1;
    }
    const fieldNorm = Math.sqrt(field.reduce((sum, x) => sum + x * x, 0)) || 1;
    for (let i = 0; i < this.dim; i++) {
      field[i] /= fieldNorm;
    }

    // Diagonal part: field
    for (let i = 0; i < this.dim; i++) {
      H[i * this.dim + i] = field[i];
    }

    // Outer product part: -field ⊗ field
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        H[i * this.dim + j] -= field[i] * field[j];
      }
    }

    // 2. Memory Hamiltonian from previous params
    if (memoryParams) {
      const memoryState = this.paramsToState(memoryParams);
      // Add 0.3 * |memory⟩⟨memory|
      for (let i = 0; i < this.dim; i++) {
        for (let j = 0; j < this.dim; j++) {
          H[i * this.dim + j] += 0.3 * memoryState[i] * memoryState[j];
        }
      }
    }

    // 3. Cloud noise
    if (cloudField && cloudField.noiseVector && cloudField.noiseVector.length > 0) {
      const noise = cloudField.noiseVector.slice(0, this.dim);
      // Pad with zeros if noise vector is shorter than dim
      while (noise.length < this.dim) {
        noise.push(0);
      }
      for (let i = 0; i < this.dim; i++) {
        const noiseVal = noise[i] || 0;
        H[i * this.dim + i] += 0.1 * noiseVal;
      }
    }

    // Symmetrize: (H + H†) / 2
    for (let i = 0; i < this.dim; i++) {
      for (let j = i + 1; j < this.dim; j++) {
        const hij = H[i * this.dim + j];
        const hji = H[j * this.dim + i];
        const avg = (hij + hji) / 2;
        H[i * this.dim + j] = avg;
        H[j * this.dim + i] = avg;
      }
    }

    return H;
  }

  /**
   * VQE evolution: find optimal params that minimize energy.
   * For MVP: use simple gradient descent on the Hamiltonian.
   */
  evolve(
    H: number[],
    initialParams: number[] = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
    iterations: number = 50
  ): { params: number[]; energy: number; state: number[] } {
    let params = [...initialParams];
    const learningRate = 0.01;

    for (let iter = 0; iter < iterations; iter++) {
      const state = this.paramsToState(params);
      const energy = this.computeEnergy(state, H);

      // Compute gradient via finite differences
      const gradient = new Array(6).fill(0);
      const delta = 0.001;
      for (let i = 0; i < 6; i++) {
        const paramsPlus = [...params];
        paramsPlus[i] += delta;
        const statePlus = this.paramsToState(paramsPlus);
        const energyPlus = this.computeEnergy(statePlus, H);
        gradient[i] = (energyPlus - energy) / delta;
      }

      // Update params
      for (let i = 0; i < 6; i++) {
        params[i] -= learningRate * gradient[i];
      }
    }

    const finalState = this.paramsToState(params);
    const finalEnergy = this.computeEnergy(finalState, H);

    return {
      params,
      energy: finalEnergy,
      state: finalState,
    };
  }

  /**
   * Compute ⟨ψ|H|ψ⟩
   */
  private computeEnergy(state: number[], H: number[]): number {
    let energy = 0;
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        energy += state[i] * H[i * this.dim + j] * state[j];
      }
    }
    return energy;
  }

  /**
   * Apply cloud decoherence by adding noise to params.
   */
  applyCloudDecoherence(params: number[], cloudField: { collectiveEntropy: number }): number[] {
    const noiseStrength = cloudField.collectiveEntropy || 0.1;
    return params.map(p => p + (Math.random() - 0.5) * noiseStrength * 0.2);
  }

  /**
   * POVM measurement: collapse state to one of 5 fields.
   * Returns probabilities for each field.
   */
  measureField(state: number[]): Record<string, number> {
    const probs = state.map(x => x * x); // |ψ|²

    const fields = {
      diffusion: probs.slice(0, 12).reduce((a, b) => a + b, 0),
      convergence: probs.slice(12, 25).reduce((a, b) => a + b, 0),
      coherence: probs.slice(25, 38).reduce((a, b) => a + b, 0),
      singularity: probs.slice(38, 51).reduce((a, b) => a + b, 0),
      dissolution: probs.slice(51, 64).reduce((a, b) => a + b, 0),
    };

    const total = Object.values(fields).reduce((a, b) => a + b, 0) || 1;
    const normalized: Record<string, number> = {};
    for (const [key, val] of Object.entries(fields)) {
      normalized[key] = val / total;
    }

    return normalized;
  }

  /**
   * Quantum fidelity: |⟨ψ_a|ψ_b⟩|²
   */
  quantumFidelity(stateA: number[], stateB: number[]): number {
    let overlap = 0;
    for (let i = 0; i < this.dim; i++) {
      overlap += stateA[i] * stateB[i];
    }
    return overlap * overlap;
  }

  /**
   * Calculate entropy of state: -Σ p_i log(p_i)
   */
  calculateEntropy(state: number[]): number {
    let entropy = 0;
    for (const amp of state) {
      const prob = amp * amp;
      if (prob > 1e-10) {
        entropy -= prob * Math.log2(prob);
      }
    }
    return entropy / Math.log2(this.dim); // Normalize to [0, 1]
  }

  /**
   * Hash text to 6 parameters for story resonance.
   */
  textToParams(text: string): number[] {
    const params = new Array(6);
    for (let i = 0; i < 6; i++) {
      const hash = this.hashToken(text + String(i));
      params[i] = ((Math.abs(hash) % 1000) / 1000) * 2 * Math.PI;
    }
    return params;
  }

  /**
   * Simple hash function for tokens.
   */
  private hashToken(token: string): number {
    const hash = crypto.createHash('md5').update(token).digest();
    return hash.readInt32BE(0);
  }

  /**
   * Story resonance: fidelity between story state and current state.
   */
  storyResonance(storyText: string, currentState: number[]): number {
    const storyParams = this.textToParams(storyText);
    const storyState = this.paramsToState(storyParams);
    return this.quantumFidelity(storyState, currentState);
  }

  /**
   * Rank multiple stories by quantum fidelity to current state.
   */
  rankStoriesByFidelity(
    stories: Array<{ id: number; text: string }>,
    currentState: number[]
  ): Array<{ id: number; text: string; fidelity: number }> {
    const ranked = stories.map(story => ({
      ...story,
      fidelity: this.storyResonance(story.text, currentState),
    }));
    return ranked.sort((a, b) => b.fidelity - a.fidelity);
  }
}
