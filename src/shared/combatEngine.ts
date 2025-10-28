/**
 * Combat calculation engine
 * Used by both client (for preview) and server (for validation)
 */

import { CLASSES, YOKAI, XP_PER_LEVEL, ClassType, YokaiType } from './constants';
import { Player, Boss, Turn, BattleResult, ActionType } from './types';

export function executeTurn(
  player: Player,
  boss: Boss,
  action: ActionType,
  turnNumber: number,
  vulnerabilityMultiplier: number = 1.0
): Turn {
  const classData = CLASSES[player.class];
  const isAIYokai = boss.type === 'ai_generated';
  const yokaiData = isAIYokai ? null : YOKAI[boss.type as keyof typeof YOKAI];
  
  let playerDamage = 0;
  let yokaiDamage = 0;
  let actionMultiplier = 1.0;
  let defenseMultiplier = 1.0;
  let special: string | undefined;

  switch (action) {
    case 'attack':
      actionMultiplier = 1.0;
      defenseMultiplier = 1.0;
      break;
      
    case 'defend':
      actionMultiplier = 0.3;
      defenseMultiplier = 2.0;
      break;
      
    case 'special':
      special = classData.special.name;
      actionMultiplier = classData.special.multiplier;
      
      if (player.class === 'samurai' && 'defenseIgnore' in classData.special) {
        const rawDamage = player.attack * actionMultiplier;
        const levelBonus = 1 + (player.level / 20);
        const ignoredDefense = boss.defense * (1 - classData.special.defenseIgnore);
        playerDamage = Math.floor(Math.max(0, (rawDamage - ignoredDefense) * levelBonus));
      }
      break;
  }

  if (playerDamage === 0) {
    const rawDamage = player.attack * actionMultiplier;
    const levelBonus = 1 + (player.level / 20);
    playerDamage = Math.floor(Math.max(0, (rawDamage - boss.defense) * levelBonus));
  }

  const attackPattern = isAIYokai ? boss.attackPattern : yokaiData!.attackPattern;
  const yokaiAttack = attackPattern[turnNumber % attackPattern.length] || 0;
  const baseDamage = yokaiAttack * vulnerabilityMultiplier;
  yokaiDamage = Math.floor(Math.max(0, baseDamage - (player.defense * defenseMultiplier)));

  return { 
    turn: turnNumber, 
    action, 
    playerDamage, 
    yokaiDamage, 
    ...(special && { special })
  };
}

export function executeBattle(
  player: Player,
  boss: Boss,
  actions: [ActionType, ActionType, ActionType]
): BattleResult {
  const turns: Turn[] = [];
  let totalDamage = 0;
  let vulnerabilityMultiplier = 1.0;
  let playerHP = player.maxHP;

  for (let i = 0; i < 3; i++) {
    const action = actions[i];
    if (!action) continue;
    const turn = executeTurn(player, boss, action, i, vulnerabilityMultiplier);
    turns.push(turn);
    totalDamage += turn.playerDamage;
    playerHP -= turn.yokaiDamage; 

    // Check if player died
    if (playerHP <= 0) {
      return {
        totalDamage: Math.floor(totalDamage * 0.5), // 50% damage on death
        turns,
        xpGained: 0,
        levelUp: false,
        itemDropped: null,
        failed: true, // New flag
        finalHP: 0
      };
    }

    if (player.class === 'onmyoji' && action === 'special') {
      vulnerabilityMultiplier = CLASSES.onmyoji.special.vulnerabilityNext;
    } else {
      vulnerabilityMultiplier = 1.0;
    }

    if (player.class === 'ninja' && action === 'special') {
      if (Math.random() < CLASSES.ninja.special.bonusTurnChance) {
        const bonusTurn = executeTurn(player, boss, 'attack', i, vulnerabilityMultiplier);
        bonusTurn.special = "Bonus Turn!";
        turns.push(bonusTurn);
        totalDamage += bonusTurn.playerDamage;
      }
    }
  }

  const isAIYokaiForXP = boss.type === 'ai_generated';
  const yokaiDataForXP = isAIYokaiForXP ? null : YOKAI[boss.type as keyof typeof YOKAI];
  const baseXPReward = isAIYokaiForXP ? 200 : yokaiDataForXP!.xpReward; // Default XP for AI yokai
  const xpGained = Math.floor(baseXPReward * 0.3);
  const newXP = player.xp + xpGained;
  const newLevel = calculateLevel(newXP);
  const levelUp = newLevel > player.level;

  let itemDropped: string | null = null;
  if (Math.random() < 0.1) {
    if (isAIYokaiForXP) {
      const aiDrops = ['Mysterious Shard', 'Ancient Scroll', 'Spirit Essence'];
      itemDropped = aiDrops[Math.floor(Math.random() * aiDrops.length)] as string;
    } else {
      const dropTable = yokaiDataForXP!.dropTable;
      const randomIndex = Math.floor(Math.random() * dropTable.length);
      itemDropped = dropTable[randomIndex] as string;
    }
  }

  const result: BattleResult = {
    totalDamage,
    turns,
    xpGained,
    levelUp,
    itemDropped,
    failed: false,
    finalHP: playerHP
  };
  
  if (levelUp) {
    result.newLevel = newLevel;
  }
  
  return result;
}

export function calculateLevel(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    const levelXP = XP_PER_LEVEL[i];
    if (levelXP !== undefined && xp >= levelXP) return i;
  }
  return 0;
}

export function calculateStatsForLevel(baseClass: ClassType, level: number) {
  const classData = CLASSES[baseClass];
  return {
    maxHP: classData.maxHP + (level * 5),
    attack: classData.baseAttack + (level * 2),
    defense: classData.baseDefense + (level * 2)
  };
}

export function getTodayDate(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

export function getYokaiForDate(date: string): YokaiType {
  const dayOfWeek = new Date(date).getUTCDay();
  const yokaiRotation: YokaiType[] = ['kappa', 'oni', 'kitsune', 'tengu', 'jorogumo', 'orochi', 'orochi'];
  return yokaiRotation[dayOfWeek] || 'kappa';
}