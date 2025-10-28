/**
 * Type definitions for Yokai Slayers
 */

import { ClassType, YokaiType } from './constants';

export interface Player {
  userId: string;
  name: string;
  class: ClassType;
  level: number;
  xp: number;
  maxHP: number;
  attack: number;
  defense: number;
  weapon: string;
  armor: string;
  attemptsToday: number;
}

export interface Boss {
  type: YokaiType | 'ai_generated';
  name?: string;        // For AI yokai
  nameJP?: string;      // For AI yokai
  description?: string; // For AI yokai
  backstory?: string;   // For AI yokai
  imageUrl?: string;    // For AI yokai
  currentHP: number;
  maxHP: number;
  defense: number;
  attackPattern: readonly number[] | number[];
  totalParticipants: number;
  defeatedAt: string | null;
}

export interface AIYokai {
  name: string;
  nameJP: string;
  description: string;
  backstory: string;
  imageUrl: string;
  hp: number;
  defense: number;
  attackPattern: number[];
}

export type ActionType = 'attack' | 'defend' | 'special';

export interface Turn {
  turn: number;
  action: ActionType;
  playerDamage: number;
  yokaiDamage: number;
  special?: string;
}

export interface BattleResult { 
  totalDamage: number;
  turns: Turn[];
  xpGained: number;
  levelUp: boolean;
  newLevel?: number;
  itemDropped: string | null;
  failed?: boolean;
  finalHP?: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  damage: number;
  rank: number;
}