import express from 'express';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { CLASSES, YOKAI } from '../shared/constants.js';
import { Player, Boss } from '../shared/types.js';
import { getTodayDate, getYokaiForDate, executeBattle, calculateStatsForLevel, calculateLevel } from '../shared/combatEngine.js';
import { createAIYokaiService } from './ai-yokai.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();


interface AIYokaiResponse {
  name: string;
  nameJP: string;
  description: string;
  backstory: string;
  imageUrl: string;
  stats: {
    hp: number;
    defense: number;
    attackPattern: number[];
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getPlayer(userId: string): Promise<Player | null> {
  const data = await redis.get(`player:${userId}`);
  return data ? JSON.parse(data) : null;
}

async function createPlayer(userId: string, name: string, playerClass: keyof typeof CLASSES): Promise<Player> {
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

async function getBoss(): Promise<Boss> {
  const today = getTodayDate();
  const data = await redis.get(`boss:${today}`);
  
  if (data) {
    return JSON.parse(data);
  }
  
  // Use day-of-week yokai rotation
  const yokaiType = getYokaiForDate(today);
  const yokaiData = YOKAI[yokaiType];
  
  const newBoss: Boss = {
    type: yokaiType,
    currentHP: yokaiData.hp,
    maxHP: yokaiData.hp,
    defense: yokaiData.defense,
    attackPattern: [...yokaiData.attackPattern],
    totalParticipants: 0,
    defeatedAt: null
  };
  
  await redis.set(`boss:${today}`, JSON.stringify(newBoss));
  return newBoss;

  /* AI YOKAI GENERATION - DIRECT OPENAI INTEGRATION
  
  // Generate new AI yokai for today using OpenAI directly
  console.log('Generating new AI yokai for', today);
  
  try {
    // Use OpenAI API directly (likely allow-listed)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Add this to your environment
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are a yokai generator. Create a unique Japanese yokai with name, Japanese name, description, backstory, and stats. Respond only with valid JSON.'
        }, {
          role: 'user',
          content: `Generate a unique yokai for ${new Date().toLocaleDateString()}. Include: name (English), nameJP (Japanese), description (1 sentence), backstory (2-3 sentences), and stats (hp: 100000-500000, defense: 15-40, attackPattern: array of 5 numbers 15-50)`
        }],
        max_tokens: 500,
        temperature: 0.8
      })
    });
    
    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }
    
    const openaiData = await openaiResponse.json();
    const aiYokai = JSON.parse(openaiData.choices[0].message.content) as AIYokaiResponse;
    
    const newBoss: Boss = {
      type: 'ai_generated',
      name: aiYokai.name,
      nameJP: aiYokai.nameJP,
      description: aiYokai.description,
      backstory: aiYokai.backstory,
      imageUrl: aiYokai.imageUrl || undefined, // Optional image
      currentHP: aiYokai.stats.hp,
      maxHP: aiYokai.stats.hp,
      defense: aiYokai.stats.defense,
      attackPattern: aiYokai.stats.attackPattern,
      totalParticipants: 0,
      defeatedAt: null
    };
    
    await redis.set(`boss:${today}`, JSON.stringify(newBoss));
    return newBoss;
    
  } catch (error) {
    console.error('Failed to generate AI yokai:', error);
    
    // Fallback to static yokai
    const yokaiType = getYokaiForDate(today);
    const yokaiData = YOKAI[yokaiType];
    
    const fallbackBoss: Boss = {
      type: yokaiType,
      currentHP: yokaiData.hp,
      maxHP: yokaiData.hp,
      defense: yokaiData.defense,
      attackPattern: [...yokaiData.attackPattern],
      totalParticipants: 0,
      defeatedAt: null
    };
    
    await redis.set(`boss:${today}`, JSON.stringify(fallbackBoss));
    return fallbackBoss;
  }
  
  END AI YOKAI GENERATION */
}

// ============================================
// API ROUTES
// ============================================

// Initialize - get player and boss data
router.get('/api/init', async (_req, res): Promise<void> => {
  try {
    const userId = context.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const [player, boss, username] = await Promise.all([
      getPlayer(userId),
      getBoss(),
      reddit.getCurrentUsername()
    ]);

    res.json({
      player,
      boss,
      username: username ?? 'anonymous'
    });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ error: 'Failed to initialize' });
  }
});

// Create character
router.post('/api/character/create', async (req, res): Promise<void> => {
  try {
    const userId = context.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, class: playerClass } = req.body;

    if (!name || !playerClass) {
      res.status(400).json({ error: 'Name and class required' });
      return;
    }

    if (!(playerClass in CLASSES)) {
      res.status(400).json({ error: 'Invalid class' });
      return;
    }

    // Check if player already exists
    const existingPlayer = await getPlayer(userId);
    if (existingPlayer) {
      res.status(400).json({ error: 'Character already exists' });
      return;
    }

    const player = await createPlayer(userId, name, playerClass);
    res.json({ player });
  } catch (error) {
    console.error('Character creation error:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Battle
router.post('/api/battle', async (req, res): Promise<void> => {
  try {
    const userId = context.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { actions } = req.body;

    if (!actions || actions.length !== 3) {
      res.status(400).json({ error: 'Must provide exactly 3 actions' });
      return;
    }

    const player = await getPlayer(userId);
    if (!player) {
      res.status(400).json({ error: 'Player not found' });
      return;
    }

    if (player.attemptsToday >= 3) {
      res.status(400).json({ error: 'No attempts remaining today' });
      return;
    }

    const boss = await getBoss();
    const result = executeBattle(player, boss, actions);

    // Update player
    player.xp += result.xpGained;
    player.attemptsToday += 1;
    
    if (result.levelUp && result.newLevel) {
      player.level = result.newLevel;
      const newStats = calculateStatsForLevel(player.class, player.level);
      player.maxHP = newStats.maxHP;
      player.attack = newStats.attack;
      player.defense = newStats.defense;
    }

    await redis.set(`player:${userId}`, JSON.stringify(player));

    // Update boss HP
    const today = getTodayDate();
    const wasPreviouslyAlive = boss.currentHP > 0;
    boss.currentHP = Math.max(0, boss.currentHP - result.totalDamage);

    // Check if boss just died
    if (boss.currentHP === 0 && wasPreviouslyAlive && !boss.defeatedAt) {
      boss.defeatedAt = new Date().toISOString();
      
      // Award victory bonus to all participants
      const participants = await redis.zRange(`leaderboard:${today}`, 0, -1);
      console.log(`Boss defeated! Awarding bonus to ${participants.length} warriors`);
      
      for (const participant of participants) {
        const participantData = await redis.get(`player:${participant.member}`);
        if (participantData) {
          const participantPlayer = JSON.parse(participantData);
          participantPlayer.xp += 500; // Victory bonus!
          
          // Check for level up from bonus
          const newLevel = calculateLevel(participantPlayer.xp);
          if (newLevel > participantPlayer.level) {
            participantPlayer.level = newLevel;
            const newStats = calculateStatsForLevel(participantPlayer.class, newLevel);
            participantPlayer.maxHP = newStats.maxHP;
            participantPlayer.attack = newStats.attack;
            participantPlayer.defense = newStats.defense;
          }
          
          await redis.set(`player:${participant.member}`, JSON.stringify(participantPlayer));
        }
      }
    }

    await redis.set(`boss:${today}`, JSON.stringify(boss));

    // Update leaderboard
    await redis.zIncrBy(`leaderboard:${today}`, userId, result.totalDamage);

    res.json({
      result,
      player,
      boss
    });
  } catch (error) {
    console.error('Battle error:', error);
    res.status(500).json({ error: 'Battle failed' });
  }
});

// Get leaderboard
router.get('/api/leaderboard', async (_req, res): Promise<void> => {
  try {
    const today = getTodayDate();
    const results = await redis.zRange(`leaderboard:${today}`, 0, 9, { 
      reverse: true, 
      by: 'rank' 
    });

    // Fetch usernames for each user
    const leaderboard = await Promise.all(
      results.map(async (entry, index) => {
        let username = entry.member;
        
        // Try to fetch Reddit username
        try {
          // Ensure user ID is in correct format for Reddit API
          const userId = entry.member.startsWith('t2_') ? entry.member : `t2_${entry.member}`;
          const user = await reddit.getUserById(userId as `t2_${string}`);
          if (user?.username) {
            username = user.username;
          }
        } catch (err) {
          console.error(`Failed to fetch username for ${entry.member}:`, err);
          // Keep the user ID as fallback
        }

        return {
          userId: entry.member,
          username: username,
          damage: entry.score,
          rank: index + 1
        };
      })
    );

    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Generate AI yokai
router.post('/api/ai/generate-yokai', async (req, res): Promise<void> => {
  try {
    const userId = context.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { prompt } = req.body;
    const aiService = createAIYokaiService();
    
    if (!aiService) {
      res.status(503).json({ error: 'AI service not available' });
      return;
    }

    const yokai = await aiService.generateYokai(prompt);
    res.json({ yokai });
  } catch (error) {
    console.error('AI yokai generation error:', error);
    res.status(500).json({ error: 'Failed to generate yokai' });
  }
});

// Generate multiple AI yokai variations
router.post('/api/ai/generate-variations', async (req, res): Promise<void> => {
  try {
    const userId = context.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { prompt, count = 3 } = req.body;
    const aiService = createAIYokaiService();
    
    if (!aiService) {
      res.status(503).json({ error: 'AI service not available' });
      return;
    }

    const variations = await aiService.generateYokaiVariations(prompt, Math.min(count, 5));
    res.json({ variations });
  } catch (error) {
    console.error('AI yokai variations error:', error);
    res.status(500).json({ error: 'Failed to generate yokai variations' });
  }
});

// Admin endpoint for development - clear all data
router.post('/api/admin/clear-all', async (_req, res): Promise<void> => {
  try {
    const userId = context.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const today = getTodayDate();
    
    // Clear player data
    await redis.del(`player:${userId}`);
    
    // Clear today's boss
    await redis.del(`boss:${today}`);
    
    // Clear today's leaderboard
    await redis.del(`leaderboard:${today}`);

    res.json({ success: true, message: 'Data cleared' });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// Use router middleware
app.use(router);

// Get port and start server
const port = getServerPort();
const server = createServer(app);
server.on('error', (err) => console.error(`Server error: ${err.stack}`));
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});