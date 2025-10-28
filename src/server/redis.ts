/**
 * Redis data layer for server-side operations
 */

import { RedisClient } from '@devvit/public-api';
import { Player, Boss, LeaderboardEntry } from '../shared/types.js';
import { CLASSES, YOKAI } from '../shared/constants.js';
import { getTodayDate, getYokaiForDate, calculateStatsForLevel } from '../shared/combatEngine.js';

export async function getPlayer(redis: RedisClient, userId: string): Promise<Player | null> {
  const data = await redis.get(`player:${userId}`);
  return data ? JSON.parse(data) : null;
}

export async function createPlayer(
  redis: RedisClient,
  userId: string,
  name: string,
  playerClass: keyof typeof CLASSES
): Promise<Player> {
  const classData = CLASSES[playerClass];
  
  const newPlayer: Player = {
    userId,
    name,
    class: playerClass,
    level: 1,
    xp: 0,
    maxHP: classData.maxHP,
    attack: classData.baseAttack,
    defense: classData.baseDefense,
    weapon: playerClass === 'samurai' ? 'katana_basic' : 
            playerClass === 'ninja' ? 'tanto_basic' : 'ofuda_basic',
    armor: playerClass === 'samurai' ? 'do_maru_basic' :
           playerClass === 'ninja' ? 'shinobi_basic' : 'robes_basic',
    attemptsToday: 0
  };
  
  await redis.set(`player:${userId}`, JSON.stringify(newPlayer));
  return newPlayer;
}

export async function updatePlayer(redis: RedisClient, player: Player): Promise<void> {
  await redis.set(`player:${player.userId}`, JSON.stringify(player));
}

export async function getBoss(redis: RedisClient): Promise<Boss> {
  const today = getTodayDate();
  const data = await redis.get(`boss:${today}`);
  
  if (data) {
    return JSON.parse(data);
  }
  
  // Create new boss for today
  const yokaiType = getYokaiForDate(today);
  const yokaiData = YOKAI[yokaiType];
  
  const newBoss: Boss = {
    type: yokaiType,
    currentHP: yokaiData.hp,
    maxHP: yokaiData.hp,
    defense: yokaiData.defense,
    attackPattern: yokaiData.attackPattern,
    totalParticipants: 0,
    defeatedAt: null
  };
  
  await redis.set(`boss:${today}`, JSON.stringify(newBoss));
  return newBoss;
}

export async function updateBossHP(redis: RedisClient, damage: number): Promise<Boss> {
  const today = getTodayDate();
  const boss = await getBoss(redis);
  
  boss.currentHP = Math.max(0, boss.currentHP - damage);
  
  if (boss.currentHP === 0 && !boss.defeatedAt) {
    boss.defeatedAt = new Date().toISOString();
  }
  
  await redis.set(`boss:${today}`, JSON.stringify(boss));
  return boss;
}

export async function addToLeaderboard(
  redis: RedisClient,
  userId: string,
  damage: number
): Promise<void> {
  const today = getTodayDate();
  await redis.zIncrBy(`leaderboard:${today}`, userId, damage);
}

export async function getLeaderboard(
  redis: RedisClient,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const today = getTodayDate();
  const results = await redis.zRange(`leaderboard:${today}`, 0, limit - 1, { reverse: true, by: 'rank' });
  
  return results.map((entry, index) => ({
    userId: entry.member,
    username: entry.member, // TODO: fetch real username
    damage: entry.score,
    rank: index + 1
  }));
}