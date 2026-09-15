import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.resolve("按规范命名素材");
const outputDir = path.resolve("public", "assets");

const jobs = [
  ["bg_01_day_forest.png", "day.webp", 940, 80],
  ["bg_03_night_pine.png", "night.webp", 940, 80],
  ["poster_key_visual.png", "poster.webp", 940, 82],
  ["hero_walk_01.png", "hero-walk.webp", 380, 88],
  ["hero_crouch.png", "hero-crouch.webp", 420, 88],
  ["hero_turnaround_0.png", "hero-reference.webp", 500, 86],
  ["enemy_patrol_01.png", "enemy-01.webp", 330, 86],
  ["enemy_patrol_02.png", "enemy-02.webp", 330, 86],
  ["npc_captain.png", "captain.webp", 420, 88],
  ["npc_messenger.png", "messenger.webp", 360, 88],
  ["npc_zhou_wounded.png", "zhou.webp", 430, 88],
  ["hands_archive.png", "hands-archive.webp", 600, 88],
  ["tree_birch_01.png", "birch.webp", 420, 84],
  ["tree_pine_01.png", "pine.webp", 440, 84],
  ["tree_pine_dead_01.png", "dead-pine.webp", 380, 84],
  ["shrub_01.png", "shrub.webp", 520, 84],
  ["cover_rock_01.png", "rock.webp", 440, 84],
  ["cover_log_01.png", "log.webp", 620, 84],
  ["prop_food.png", "food.webp", 300, 88],
  ["prop_coat.png", "coat.webp", 340, 88],
  ["prop_archive.png", "archive.webp", 320, 88],
  ["prop_lamp.png", "lamp.webp", 300, 88],
  ["prop_map.png", "map.webp", 420, 88],
  ["prop_medbox.png", "medbox.webp", 300, 88],
  ["prop_rifle_side.png", "rifle-side.webp", 500, 86],
  ["prop_rifle_carried.png", "rifle-carried.webp", 360, 86],
];

await mkdir(outputDir, { recursive: true });

for (const [input, output, width, quality] of jobs) {
  const source = path.join(sourceDir, input);
  const target = path.join(outputDir, output);
  const sourceInfo = await stat(source);
  let shouldWrite = true;
  try {
    const targetInfo = await stat(target);
    shouldWrite = targetInfo.mtimeMs < sourceInfo.mtimeMs;
  } catch {}
  if (!shouldWrite) continue;
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, alphaQuality: 92, effort: 5 })
    .toFile(target);
}
