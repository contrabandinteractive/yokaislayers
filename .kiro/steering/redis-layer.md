# Kiro Steering: Redis Data Layer

## Context
All game state stored in Redis with type-safe wrappers

## Goals
1. Create data access layer for all Redis operations
2. Type-safe keys and values
3. Atomic operations
4. Caching strategy
5. Error handling

## Key Patterns

### Player Operations
- get/set player data
- update player stats (atomic)
- increment attempts
- add XP (with overflow protection)

### Boss Operations
- get/set daily boss
- atomic HP decrement
- participant count increment
- defeat timestamp

### Leaderboard Operations
- add score (zadd)
- get top N (zrevrange)
- get player rank (zrank)
- get score (zscore)

## Data Structures
```typescript
// String keys with JSON values
player:{userId} = { ...PlayerData }
boss:{date} = { ...BossData }

// Sorted sets
leaderboard:{date} = sorted set of userId by damage

// Sets
participants:{date} = set of userIds

// Hashes
equipment:{userId} = hash of slot:itemId
```

## Caching Strategy
- Cache player data in React state
- Subscribe to boss HP updates via realtime
- Invalidate cache on level up
- Use Redis TTL for daily resets

## Code Example
```typescript
export class RedisDataLayer {
  constructor(private redis: Devvit.Redis) {}
  
  async getPlayer(userId: string): Promise<Player | null> {
    // Kiro: implement with error handling
  }
  
  async updateBossHP(date: string, damage: number): Promise<void> {
    // Kiro: atomic decrement with bounds check
  }
}
```
```

Ask Kiro:
```
@kiro Using steering file .kiro/steering/redis-layer.md, generate complete Redis data layer

Create class-based data access layer
Include all CRUD operations
Add transaction support
Error handling and logging
Type-safe throughout

Output to: src/app/utils/RedisDataLayer.ts
```

---

## 🧪 Part 7: Kiro-Generated Tests (Day 5)

### **Generate Test Suite**
```
@kiro Generate comprehensive test suite for combatEngine.ts

Requirements:
- Use Jest/Vitest
- Test all functions
- Edge cases (level 1, level 10, zero damage, etc)
- Mock Redis calls
- Test all class special moves
- Test all yokai attack patterns
- 90%+ code coverage

Output to: src/app/utils/__tests__/combatEngine.test.ts