# Kiro Steering: Battle System Implementation

## Context
Implementing turn-based battle system for Yokai Slayers RPG

## Goals
1. Create BattleScreen component
2. Handle 3-turn action selection
3. Animate battle actions
4. Update Redis with results
5. Broadcast HP updates

## Constraints
- Must work in Devvit Web environment
- No DOM access (use Devvit blocks API)
- Redis operations must be atomic
- All state updates via React hooks

## Architecture Decisions
- Use React useState for turn tracking
- Separate animation layer from logic
- Queue Redis updates to avoid race conditions
- Use Devvit realtime for HP broadcasts

## Code Style
- TypeScript strict mode
- Functional components only
- Custom hooks for reusable logic
- Comprehensive error handling

## Example Pattern
```typescript
function BattleScreen({ player, yokai }: Props) {
  const [turn, setTurn] = useState(0);
  const [actions, setActions] = useState<ActionType[]>([]);
  
  const handleAction = async (action: ActionType) => {
    // Kiro: generate logic here following pattern
  };
  
  return (/* Kiro: generate JSX */);
}
```

## Success Criteria
- All 3 turns execute correctly
- Animations smooth (60fps)
- Redis updates atomic
- Error handling comprehensive
- Mobile responsive
```

Now ask Kiro:
```
@kiro Using steering file .kiro/steering/battle-system.md, generate complete BattleScreen component

Follow architectural decisions in steering file.
Import from: combatEngine.ts, constants.ts, types.ts
Use Devvit hooks: useAsync, useChannel
Include animation logic
Add error boundaries

Output to: src/app/screens/BattleScreen.tsx