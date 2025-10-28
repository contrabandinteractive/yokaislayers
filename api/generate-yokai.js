import Replicate from 'replicate';

export default async function handler(req, res) {
  // CORS headers for Devvit
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Generate yokai concept (name, type, backstory)
    const yokaiConcept = await generateYokaiConcept();

    // Generate SNES pixel art image
    const output = await replicate.run(
      "nerijs/pixel-art-xl:2af118c8ae70cf625f0c089339c5b90c7f7a3b0a4c36b6b95cbb60e19c8dcf38",
      {
        input: {
          prompt: `SNES 16-bit pixel art sprite, Japanese yokai monster, ${yokaiConcept.description}, game character, front view, detailed pixel sprite, retro game style, transparent background`,
          negative_prompt: "blurry, 3d, realistic, photograph, modern",
          width: 512,
          height: 512,
          num_outputs: 1
        }
      }
    );

    // Return yokai data
    return res.status(200).json({
      name: yokaiConcept.name,
      nameJP: yokaiConcept.nameJP,
      description: yokaiConcept.description,
      backstory: yokaiConcept.backstory,
      imageUrl: output[0],
      stats: yokaiConcept.stats
    });

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate yokai',
      details: error.message 
    });
  }
}

// Helper function to generate yokai concept
async function generateYokaiConcept() {
  const yokaiTypes = [
    'fire demon', 'water spirit', 'mountain beast', 'forest guardian',
    'shadow creature', 'storm elemental', 'earth golem', 'celestial being',
    'cursed warrior', 'ancient serpent', 'oni warrior', 'kitsune trickster'
  ];

  const type = yokaiTypes[Math.floor(Math.random() * yokaiTypes.length)];
  
  // Generate random stats within bounds
  const stats = {
    hp: Math.floor(Math.random() * 300000) + 100000, // 100k - 400k
    defense: Math.floor(Math.random() * 30) + 15,    // 15 - 45
    attackPattern: Array(5).fill(0).map(() => Math.floor(Math.random() * 35) + 15) // 15-50
  };

  // Simple name generation (you could use GPT here for better names)
  const prefixes = ['Kuro', 'Shiro', 'Aka', 'Ao', 'Ki', 'Murasaki', 'Kin', 'Gin'];
  const suffixes = ['maru', 'hime', 'oni', 'kage', 'yama', 'kawa', 'mori', 'sora'];
  const name = prefixes[Math.floor(Math.random() * prefixes.length)] + 
               suffixes[Math.floor(Math.random() * suffixes.length)];

  // Generate backstory with simple templates
  const backstories = [
    `Legend tells of ${name}, a ${type} that awakened from a thousand-year slumber beneath the sacred mountains. Its anger shakes the earth, and only the bravest warriors dare face it.`,
    `${name} was once a guardian of the ancient shrines, but corruption twisted it into a fearsome ${type}. Now it seeks to reclaim what was lost, bringing destruction to all who oppose it.`,
    `Born from the chaos of a great storm, ${name} is a ${type} of immense power. The elders speak of its arrival as an omen of change, neither wholly evil nor good.`,
    `${name}, the ${type}, emerged from the spirit realm when the barrier between worlds grew thin. Its presence distorts reality, and its motives remain a mystery.`
  ];

  return {
    name: name,
    nameJP: convertToKatakana(name), // Simple conversion
    description: `fearsome ${type}`,
    backstory: backstories[Math.floor(Math.random() * backstories.length)],
    stats: stats
  };
}

// Simple katakana conversion (placeholder - you'd want a proper library)
function convertToKatakana(name) {
  const map = {
    'Kuro': 'クロ', 'Shiro': 'シロ', 'Aka': 'アカ', 'Ao': 'アオ',
    'Ki': 'キ', 'Murasaki': 'ムラサキ', 'Kin': 'キン', 'Gin': 'ギン',
    'maru': 'マル', 'hime': 'ヒメ', 'oni': 'オニ', 'kage': 'カゲ',
    'yama': 'ヤマ', 'kawa': 'カワ', 'mori': 'モリ', 'sora': 'ソラ'
  };
  
  // Try to convert parts
  for (const [key, value] of Object.entries(map)) {
    if (name.includes(key)) {
      name = name.replace(key, value);
    }
  }
  
  return name;
}