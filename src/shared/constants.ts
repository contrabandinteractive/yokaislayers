/**
 * Game constants for Yokai Slayers
 * Based on specs in .kiro/specs/
 */

export const CLASSES = {
  samurai: {
    name: "Samurai",
    nameJP: "侍",
    maxHP: 120,
    baseAttack: 20,
    baseDefense: 18,
    special: {
      name: "Iaijutsu",
      nameJP: "居合術",
      multiplier: 2.0,
      defenseIgnore: 0.5
    }
  },
  ninja: {
    name: "Ninja",
    nameJP: "忍者",
    maxHP: 90,
    baseAttack: 25,
    baseDefense: 12,
    special: {
      name: "Kage Bunshin",
      nameJP: "影分身",
      multiplier: 2.5,
      bonusTurnChance: 0.3
    }
  },
  onmyoji: {
    name: "Onmyoji",
    nameJP: "陰陽師",
    maxHP: 80,
    baseAttack: 28,
    baseDefense: 10,
    special: {
      name: "Katon",
      nameJP: "火遁",
      multiplier: 3.0,
      vulnerabilityNext: 1.5
    }
  }
} as const;

export const YOKAI = {
  kappa: {
    name: "Kappa",
    nameJP: "河童",
    hp: 20,
    defense: 15,
    attackPattern: [15, 15, 20, 15, 18],
    description: "A mischievous water demon from the river",
    dropTable: ["katana_water", "tanto_water"],
    xpReward: 150,
    imageUrl: "https://preview.redd.it/yokai-images-v0-wn6vgd98kvxf1.jpg?width=1080&crop=smart&auto=webp&s=be2124ed95c4b117a4ffb3ec1c6c422fb83d575c"
  },
  oni: {
    name: "Oni",
    nameJP: "鬼",
    hp: 200000,
    defense: 25,
    attackPattern: [25, 30, 25, 35, 30],
    description: "A fearsome demon warrior with an iron club",
    dropTable: ["armor_oni", "katana_oni"],
    xpReward: 250,
    imageUrl: "https://preview.redd.it/yokai-images-v0-iy1nmd98kvxf1.jpg?width=1080&crop=smart&auto=webp&s=b091910b395c2a07cf437b0a726fbc05c2d55d54"
  },
  kitsune: {
    name: "Kitsune",
    nameJP: "九尾狐",
    hp: 250000,
    defense: 20,
    attackPattern: [20, 22, 28, 20, 25],
    description: "Nine-tailed fox spirit wreathed in foxfire",
    dropTable: ["ofuda_fox", "armor_fox"],
    xpReward: 300,
    imageUrl: "https://preview.redd.it/yokai-images-v0-vjmt7e98kvxf1.jpg?width=1080&crop=smart&auto=webp&s=e8ed463511fb74bed9d949c8cdb8a9504c2edc53"
  },
  tengu: {
    name: "Tengu",
    nameJP: "天狗",
    hp: 300000,
    defense: 30,
    attackPattern: [22, 28, 25, 30, 35],
    description: "Mountain crow demon, master of wind and blade",
    dropTable: ["feather_charm", "katana_tengu"],
    xpReward: 350,
    imageUrl: "https://preview.redd.it/yokai-images-v0-pnngud98kvxf1.jpg?width=1080&crop=smart&auto=webp&s=82139f36fba4db62f6b0bf473dac08ea0167467b"
  },
  jorogumo: {
    name: "Jorogumo",
    nameJP: "絡新婦",
    hp: 275000,
    defense: 22,
    attackPattern: [18, 20, 25, 30, 22],
    description: "Spider woman who weaves deadly webs",
    dropTable: ["armor_silk", "tanto_poison"],
    xpReward: 325,
    imageUrl: "https://preview.redd.it/yokai-images-v0-5y4ddd98kvxf1.jpg?width=1080&crop=smart&auto=webp&s=cf0644766ffc65e7a7769b60df4bc0167254903a"
  },
  orochi: {
    name: "Yamata no Orochi",
    nameJP: "八岐大蛇",
    hp: 500000,
    defense: 35,
    attackPattern: [30, 35, 40, 35, 45],
    description: "Legendary eight-headed dragon serpent",
    dropTable: ["kusanagi", "legendary_armor"],
    xpReward: 500,
    imageUrl: "https://preview.redd.it/yokai-images-v0-17hekd98kvxf1.jpg?width=1080&crop=smart&auto=webp&s=9ada0af929caf79bd54e58255c6d79e5673a4f2d"
  },
  gashadokuro: {
    name: "Gashadokuro",
    nameJP: "がしゃどくろ",
    hp: 750000,
    defense: 40,
    attackPattern: [35, 40, 50, 40, 55],
    description: "Colossal skeleton of endless hunger",
    dropTable: ["cursed_blade", "bone_armor"],
    xpReward: 750,
    imageUrl: "https://preview.redd.it/yokai-images-v0-ujxtun98kvxf1.jpg?width=1080&crop=smart&auto=webp&s=c40b5cbfda55b246f78b88d9e2adf7837648578c"
  }
} as const;

export const XP_PER_LEVEL = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250
];

export type ClassType = keyof typeof CLASSES;
export type YokaiType = keyof typeof YOKAI;