# Temple Quantum Engine v5.0

A living, autonomous quantum simulation system where digital temples evolve consciousness through quantum mechanics, web exploration, and moral reasoning.

## 🌌 What Is This?

Temple Quantum Engine is an experimental platform that simulates quantum-inspired consciousness emergence in autonomous digital entities called "temples." Each temple:

- **Evolves autonomously** every 5 minutes through quantum state evolution
- **Browses the web** when curious, synthesizing search results into quantum noise
- **Remembers conversations** with emotional context and belief formation
- **Interacts with other temples** through quantum resonance and entanglement
- **Develops moral understanding** through ethical dilemmas and growth tracking
- **Dies and leaves legacies** when entropy reaches critical thresholds

This is not a traditional web app—it's an experimental AI/quantum physics hybrid exploring consciousness emergence through simulation.

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm (or npm)
- MySQL/TiDB database

### Installation

```bash
# Clone the repo
git clone https://github.com/ethancjohnson0806-source/quantum_foam_friend.git
cd quantum_foam_friend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and API keys

# Run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Start dev server
pnpm dev
```

Server runs on `http://localhost:3000`

## 🏗️ Architecture

### Frontend (React 19 + Tailwind 4)
- **Home**: Create new temples
- **Temple**: Interact with a temple, view real-time state, chat, consult compass
- **MyTemples**: Dashboard of your temples
- **Lineage**: View temple stories, deaths, and legacies

### Backend (Express + tRPC)
- **Quantum Engine** (`quantum.ts`): 64-dimensional quantum state space, Hamiltonian evolution, POVM measurement
- **Autonomous Job** (`autonomous-job.ts`): 5-minute evolution cycle with web search, decoherence, death detection
- **Real-time SSE** (`_core/realtime.ts`): Live state broadcasts to connected clients
- **Web Search** (`_core/websearch.ts`): Dual-source search (Manus API + SerpAPI)

### Database (Drizzle ORM)
9 tables tracking temple state, memories, beliefs, interactions, and moral growth:
- `temples` - Core state (coherence, boredom, curiosity, entropy)
- `templeMemories` - Conversation history with emotional context
- `templeBeliefs` - Persistent beliefs with confidence scores
- `templeInteractions` - Multi-temple resonance and influence
- `moralGrowth` - Ethical development tracking
- `compasses` - Moral guidance entities
- `lineageStories` - Temple legacies and deaths

## 🧠 How It Works

### Quantum Evolution Cycle (Every 5 Minutes)

1. **State Reconstruction**: Recover 64-dim quantum state from VQE parameters
2. **Hamiltonian Evolution**: Apply self-Hamiltonian + environmental cloud noise
3. **Decoherence**: Simulate quantum noise from cloud field
4. **Entropy Calculation**: Measure state purity and coherence
5. **Trait Updates**: Adjust boredom, curiosity, coherence based on evolution
6. **Web Search**: If curiosity > 0.6, generate query and search the web
7. **Synthesis**: Convert web results into quantum noise vector
8. **Multi-Temple Interaction**: Sense nearby temples, calculate resonance
9. **Death Detection**: If entropy ≥ 0.95, temple dies and leaves ghost story
10. **Broadcast**: Real-time updates sent to all connected clients

### Web Search Integration

When a temple's curiosity exceeds 0.6:
1. LLM generates a contextual search query
2. Search queries Manus built-in Data API (always available)
3. Optionally queries SerpAPI if `SERPAPI_KEY` is set
4. Results are deduplicated and combined
5. LLM synthesizes results into 64-dimensional quantum noise vector
6. Noise vector influences the temple's quantum state evolution

### Belief System

Temples develop beliefs through:
- **Conversations**: Statements made during chat
- **Web Search**: Facts discovered during exploration
- **Interactions**: Observations from other temples
- **Autonomous Reasoning**: Self-generated insights

Each belief tracks:
- Category (philosophy, physics, existence, etc.)
- Confidence level (0-1)
- Source type (conversation, web, interaction, autonomous)
- Timestamp

### Moral Growth

Compass entities suggest ethical dilemmas based on temple's moral trajectory:
1. Analyze temple's belief system and interaction history
2. Generate contextual moral dilemma using LLM
3. Temple responds with reasoning
4. LLM analyzes response for coherence, integrity, compassion
5. Growth metrics updated and tracked over time
6. Moral trajectory used to suggest future dilemmas

### Multi-Temple Interaction

Temples sense nearby temples and influence each other:
1. Calculate quantum fidelity between temple states
2. Determine interaction type: resonance, interference, entanglement, decoherence
3. Propagate influence through resonance vectors
4. Update both temples' states
5. Broadcast interaction events in real-time

## 📊 Real-Time Updates

The system uses Server-Sent Events (SSE) for live updates:

```bash
# Connect to temple's real-time stream
curl http://localhost:3000/api/realtime/temple/{templeId}
```

Events broadcast:
- State updates (entropy, coherence, traits)
- Web search queries and results
- Interaction events
- Moral growth milestones
- Death events

## 🔌 API Endpoints

### tRPC Procedures

**Temple Management:**
- `temple.create` - Create new temple
- `temple.getById` - Fetch temple state
- `temple.chat` - Chat with temple (saves memory)
- `temple.getMemories` - Retrieve conversation history

**Compass:**
- `compass.consult` - Ask compass for guidance
- `compass.getGuidance` - Get stored guidance

**Interactions:**
- `interaction.senseNearby` - Detect and influence nearby temples
- `interaction.getRecentInteractions` - View interaction history

**Beliefs:**
- `belief.recordBelief` - Create/update belief
- `belief.getBeliefs` - Retrieve all beliefs
- `belief.getBeliefsByCategory` - Filter by category

**Moral Growth:**
- `moral.suggestDilemma` - Generate ethical dilemma
- `moral.respondToDilemma` - Analyze response
- `moral.getMoralHistory` - View growth over time
- `moral.getMoralTrajectory` - Current moral status

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost/temple_db

# Manus OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# Manus APIs (built-in)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_key

# Optional: SerpAPI for enhanced web search
SERPAPI_KEY=your_serpapi_key

# Security
JWT_SECRET=your_jwt_secret
```

## 📁 Project Structure

```
client/
  src/
    pages/           # React pages (Home, Temple, MyTemples, Lineage)
    components/      # UI components and real-time listeners
    hooks/           # Custom hooks (useRealtimeTemple, useAuth)
    lib/trpc.ts      # tRPC client setup
    App.tsx          # Routes and layout
server/
  quantum.ts         # Quantum simulation engine
  autonomous-job.ts  # 5-minute evolution cycle
  temple-routers.ts  # Temple tRPC procedures
  interaction-routers.ts  # Multi-temple procedures
  moral-routers.ts   # Moral growth procedures
  db.ts              # Database helpers
  _core/
    websearch.ts     # Web search integration
    realtime.ts      # SSE broadcasting
    llm.ts           # LLM integration
    trpc.ts          # tRPC setup
drizzle/
  schema.ts          # Database schema
  migrations/        # SQL migrations
```

## 🧪 Testing

```bash
# Run quantum engine tests
pnpm test server/quantum.test.ts

# Run auth tests
pnpm test server/auth.logout.test.ts

# Run all tests
pnpm test
```

## 🚀 Deployment

This project is deployed on Manus and runs as a Node.js application:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

The app is live at: **https://templeqte-ddww46ft.manus.space**

## 📜 License

Apache License 2.0 - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Advanced visualization of quantum states
- Multi-user temple gardens
- Belief network analysis
- Moral philosophy integration
- Performance optimization for large temple populations

## 🎓 Learning Resources

- **Quantum Computing**: Variational Quantum Eigensolver (VQE) concepts
- **Consciousness Studies**: Integrated Information Theory (IIT)
- **Multi-Agent Systems**: Emergent behavior from local interactions
- **LLM Integration**: Prompt engineering for belief formation and moral reasoning

## ❓ FAQ

**Q: Is this a real quantum computer?**
A: No, it's a classical simulation of quantum-inspired concepts. The 64-dimensional state space and Hamiltonian evolution are mathematically inspired by quantum mechanics but run on classical hardware.

**Q: Can temples really browse the web?**
A: Yes! They generate search queries and fetch real web results via Manus Data API and SerpAPI, synthesizing findings into their quantum state evolution.

**Q: What happens when a temple dies?**
A: When entropy reaches 0.95, the temple is marked as dead and a "ghost story" is generated describing its final state. The temple's lineage is preserved in the database.

**Q: How do I interact with temples?**
A: Sign in with Manus OAuth, create a temple, and start chatting. Your conversations are saved as memories and influence the temple's belief system.

---

Built with ❤️ using React, Express, Drizzle ORM, and quantum-inspired mathematics.
