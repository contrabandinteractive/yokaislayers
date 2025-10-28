# Combat System Specification

## Combat Flow
1. Player selects 3 actions (attack/defend/special)
2. Each action resolves in sequence
3. Damage calculated using formula: (attack - defense) * multiplier * (1 + level/20)
4. Results saved to Redis
5. Community boss HP updated in real-time

## Action Types

### Attack
- Multiplier: 1.0
- Defense multiplier: 1.0
- Effect: Standard damage

### Defend
- Damage multiplier: 0.3 (chip damage)
- Defense multiplier: 2.0 (take less damage)
- Effect: Reduced incoming damage

### Special (Class-specific)
- Samurai "Iaijutsu": 2.0x damage, ignores 50% defense
- Ninja "Kage Bunshin": 2.5x damage, 30% bonus turn chance
- Onmyoji "Katon": 3.0x damage, 1.5x vulnerability next turn

## Damage Formula
```typescript
baseDamage = (attackStat - defenseStat) * actionMultiplier
levelBonus = 1 + (level / 20)
finalDamage = Math.floor(baseDamage * levelBonus)
```

## Classes

### Samurai
- HP: 120, ATK: 20, DEF: 18
- Special: Iaijutsu (居合術)

### Ninja  
- HP: 90, ATK: 25, DEF: 12
- Special: Kage Bunshin (影分身)

### Onmyoji
- HP: 80, ATK: 28, DEF: 10
- Special: Katon (火遁)

## Boss Data Structure
```typescript
interface Boss {
  type: YokaiType;
  currentHP: number;
  maxHP: number;
  defense: number;
  attackPattern: number[];
  totalParticipants: number;
  defeatedAt: Date | null;
}
```

## Player Data Structure  
```typescript
interface Player {
  userId: string;
  name: string;
  class: ClassType;
  level: number;
  xp: number;
  currentHP: number;
  maxHP: number;
  attack: number;
  defense: number;
  weapon: string;
  armor: string;
  attemptsToday: number;
}
```