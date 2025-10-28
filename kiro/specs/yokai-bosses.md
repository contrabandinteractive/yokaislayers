# Yokai Boss Specifications

## Daily Rotation
- Monday: Kappa (100k HP)
- Tuesday: Oni (200k HP)  
- Wednesday: Kitsune (250k HP)
- Thursday: Tengu (300k HP)
- Friday: Jorogumo (275k HP)
- Saturday/Sunday: Yamata no Orochi (500k HP)
- Random Event: Gashadokuro (750k HP)

## Kappa (河童) - Water Demon
- HP: 100,000
- Defense: 15
- Attack Pattern: [15, 15, 20, 15, 18]
- Description: "Mischievous water demon from the river"
- Drops: water-blessed katana, water talisman
- XP: 150

## Oni (鬼) - Demon Warrior
- HP: 200,000
- Defense: 25
- Attack Pattern: [25, 30, 25, 35, 30]
- Description: "Fearsome demon warrior with iron club"
- Drops: oni-forged blade, demon armor
- XP: 250

## Kitsune (九尾狐) - Nine-Tailed Fox
- HP: 250,000
- Defense: 20
- Attack Pattern: [20, 22, 28, 20, 25]
- Description: "Nine-tailed fox spirit wreathed in foxfire"
- Drops: fox-blessed ofuda, kitsune charm
- XP: 300

## Tengu (天狗) - Mountain Crow Demon
- HP: 300,000
- Defense: 30
- Attack Pattern: [22, 28, 25, 30, 35]
- Description: "Mountain crow demon, master of wind and blade"
- Drops: tengu feather, wind-blessed weapon
- XP: 350

## Jorogumo (絡新婦) - Spider Woman
- HP: 275,000
- Defense: 22
- Attack Pattern: [18, 20, 25, 30, 22]
- Description: "Spider woman who weaves deadly webs"
- Drops: silk armor, poison tanto
- XP: 325

## Yamata no Orochi (八岐大蛇) - Eight-Headed Serpent
- HP: 500,000
- Defense: 35
- Attack Pattern: [30, 35, 40, 35, 45]
- Description: "Legendary eight-headed dragon serpent"
- Drops: kusanagi sword, legendary armor
- XP: 500

## Gashadokuro (がしゃどくろ) - Giant Skeleton
- HP: 750,000
- Defense: 40
- Attack Pattern: [35, 40, 50, 40, 55]
- Description: "Colossal skeleton of endless hunger"
- Drops: cursed blade, bone armor
- XP: 750
```

---

## 🔨 Part 4: Use Kiro to Generate Boilerplate (Day 1-2)

### **Generate Constants File with Kiro**

In Kiro IDE or your IDE with Kiro:
```
@kiro Generate TypeScript constants file from .kiro/specs/combat-system.md and .kiro/specs/yokai-bosses.md

Requirements:
- Export CLASSES object with all class data
- Export YOKAI object with all yokai data
- Export EQUIPMENT object with weapons/armor
- Use "as const" for type safety
- Include Japanese names
- Add JSDoc comments

Output to: src/app/utils/constants.ts