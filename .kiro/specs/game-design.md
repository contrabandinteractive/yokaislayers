# Yokai Slayers - Game Design Specification

## Overview
Turn-based RPG where Reddit communities battle daily yokai bosses from Japanese mythology.

## Core Loop
1. User creates character (Samurai/Ninja/Onmyoji)
2. Daily yokai boss spawns at midnight UTC
3. User battles boss (3 turns per attempt, 3 attempts per day)
4. Damage accumulates across entire community
5. Leaderboard tracks top contributors
6. Boss defeated = rewards for all

## Technical Stack
- Frontend: React + Devvit Web
- State: Redis for persistence
- Rendering: HTML Canvas for battle animations
- Real-time: Devvit realtime for HP updates

## Data Models
See data-models.md

## Combat System
See combat-system.md

## UI Screens
See ui-screens.md