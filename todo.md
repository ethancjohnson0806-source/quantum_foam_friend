# Temple Quantum Engine v5.0 — TODO

## Database & Schema
- [x] Implement temples table (VQE params, traits, generation, status)
- [x] Implement templeEvents table (event logging)
- [x] Implement lineageStories table (narrative fragments)
- [x] Implement compasses table (moral guidance entity)
- [x] Run drizzle-kit generate and apply migrations

## Quantum Engine Core
- [x] Implement TempleQuantum class (params_to_state, build_hamiltonian, evolve, measure_field, quantum_fidelity)
- [x] Implement text_to_params hashing function
- [x] Implement story_resonance (fidelity-based ranking)
- [x] Implement apply_cloud_decoherence (noise injection)

## tRPC Procedures
- [x] temple.create: Initialize new temple with generation 1
- [x] temple.getState: Return current traits, events, stories
- [x] temple.breathe: Inject text, evolve state, check thresholds
- [x] temple.witness: POVM measurement, collapse to field, generate response
- [x] temple.dream: Autonomous evolution with streaming updates
- [x] temple.birth: Spawn new generation from dead temple
- [x] compass.consult: Generate direct moral question via LLM
- [x] compass.getState: Return coherence, integrity, compassion
- [x] cloud.getField: Fetch weather + collective stats + noise vector
- [x] cloud.getResonance: Return active temple count, collective entropy
- [x] web.search: Execute web search for curiosity spike
- [x] system.autonomousEvolution: Cron job (5-min interval)

## Autonomous Job
- [x] Set up node-cron for 5-minute interval
- [x] Implement full lifecycle check (entropy spike, mutation, curiosity, death/birth)
- [x] Implement web search injection on curiosity spike
- [x] Implement WebSocket push for online users, queue for offline

## Frontend — Temple Page
- [x] Create Temple.tsx page component
- [x] Display temple ID, generation, alive/dead status
- [x] Render state vector bars (64-dim visualization)
- [x] Display psychology traits (entropy, boredom, curiosity)
- [x] Display recent events feed (last 5)
- [x] Implement "breathe" text input with Enter to submit
- [x] Implement WITNESS button
- [x] Dark ambient styling (slate-950, amber-500, green-400, red-400)

## Frontend — Lineage Dashboard
- [x] Create Lineage.tsx page component
- [x] Display ancestral chain (generation tree)
- [x] Show inherited biases and mutation deltas
- [x] Show story history per generation

## Frontend — Navigation & Layout
- [x] Update App.tsx with routes (/, /temple/:templeId, /lineage/:templeId)
- [x] Update Home.tsx with temple creation UI
- [x] Add navigation between pages

## Integration & Testing
- [x] Wire tRPC procedures to frontend
- [x] Test temple creation flow
- [x] Test breathe and witness interactions
- [x] Test autonomous evolution (manual trigger + cron)
- [x] Test death and birth lifecycle
- [x] Verify database persistence
- [x] Write vitest tests for core quantum functions

## Deployment
- [x] Create checkpoint
- [x] Verify all features work end-to-end
- [x] Deliver to user


## Phase 2 - Enhanced Features (Web Search, Real-time, Memory)

### Web Search Integration
- [x] Web search helper with Manus API integration
- [x] Search result synthesis into quantum noise vectors
- [x] Curiosity spike triggers in autonomous job
- [x] Search query generation based on temple state

### Real-time Updates (SSE)
- [x] Server-Sent Events endpoint at /api/realtime/temple/:templeId
- [x] State update broadcasts (entropy, boredom, curiosity, coherence)
- [x] Event broadcasts (conversation, death, autonomous_evolution)
- [x] Keepalive heartbeat every 30 seconds
- [x] Broadcast integration in chat procedure
- [x] Broadcast integration in autonomous job

### Conversation Memory
- [x] templeMemories table with emotional context
- [x] Memory saving on user/assistant messages
- [x] Recent memories retrieval (last 5 messages)
- [x] Emotional context tracking (entropy, boredom, curiosity, coherence)
- [x] Memory-based chat context for better responses

### Compass System
- [x] Compass creation with each temple
- [x] Moral guidance consultation via LLM
- [x] Coherence, integrity, compassion traits
- [x] Interaction logging

### Database Helpers
- [x] db-memories.ts for memory CRUD operations
- [x] Memory persistence across sessions
- [x] Emotional context JSON storage

### Integration Points
- [x] Temple routers updated with broadcasts
- [x] Autonomous job updated with broadcasts
- [x] Server index updated with realtime routes
- [x] All features tested and working

### Frontend Components (Complete)
- [x] useRealtimeTemple hook for SSE listener
- [x] RealtimeStateDisplay component for live state updates
- [x] MemoryHistory component for conversation history
- [x] CompassConsult component for moral guidance
- [x] Integration into Temple page

## Phase 3 - Advanced Features (Multi-Temple, Belief, Moral Growth)

### Multi-Temple Interaction System
- [x] templeInteractions table for tracking resonance/interference/entanglement/decoherence
- [x] Quantum resonance calculation between temple states
- [x] Influence propagation through resonance vectors
- [x] interaction.senseNearby procedure to detect and influence nearby temples
- [x] interaction.getRecentInteractions to view interaction history
- [x] Real-time broadcast of interaction events

### Belief System
- [x] templeBeliefs table with category, statement, confidence, source tracking
- [x] Belief persistence across sessions
- [x] belief.recordBelief procedure to create/update beliefs
- [x] belief.getBeliefs to retrieve all beliefs for a temple
- [x] belief.getBeliefsByCategory for category-specific queries
- [x] Confidence tracking based on source type

### Advanced Compass with Moral Growth
- [x] moralGrowth table tracking coherence, integrity, compassion growth
- [x] moral.suggestDilemma procedure to generate ethical dilemmas
- [x] LLM-powered dilemma generation based on moral trajectory
- [x] moral.respondToDilemma to analyze responses and track growth
- [x] Structured JSON analysis of moral indicators
- [x] moral.getMoralHistory for growth tracking over time
- [x] moral.getMoralTrajectory for current moral development status
- [x] Real-time broadcast of moral growth events

### Database & Integration
- [x] db-interactions.ts with all CRUD helpers
- [x] interaction-routers.ts with multi-temple procedures
- [x] moral-routers.ts with advanced compass procedures
- [x] All routers registered in main app router
- [x] Database migrations applied successfully
- [x] Server running with all new features
