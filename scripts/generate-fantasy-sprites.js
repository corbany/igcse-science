import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function createPng(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + w * 4;
  const raw = Buffer.alloc(h * rowSize);
  for (let y = 0; y < h; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < w; x++) {
      const srcIdx = (y * w + x) * 4;
      const dstIdx = y * rowSize + 1 + x * 4;
      raw[dstIdx] = rgba[srcIdx];
      raw[dstIdx + 1] = rgba[srcIdx + 1];
      raw[dstIdx + 2] = rgba[srcIdx + 2];
      raw[dstIdx + 3] = rgba[srcIdx + 3];
    }
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, makeChunk('IHDR', ihdr), makeChunk('IDAT', idat), makeChunk('IEND', Buffer.alloc(0))]);
}

// 128x128 sprite sheet (4 directions x 4 frames, each frame is 32x32)
const SHEET_W = 128;
const SHEET_H = 128;
const FRAME_SIZE = 32;

function parseHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b, 255];
}

class SpriteBuffer {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.buf = Buffer.alloc(w * h * 4, 0); // Transparent RGBA
  }

  setPixel(x, y, color) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const idx = (y * this.w + x) * 4;
    this.buf[idx] = color[0];
    this.buf[idx + 1] = color[1];
    this.buf[idx + 2] = color[2];
    this.buf[idx + 3] = color[3] !== undefined ? color[3] : 255;
  }

  fillRect(x, y, w, h, color) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.setPixel(x + dx, y + dy, color);
      }
    }
  }

  fillCircle(cx, cy, r, color) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          this.setPixel(cx + dx, cy + dy, color);
        }
      }
    }
  }

  toPng() {
    return createPng(this.w, this.h, this.buf);
  }
}

// Character definitions with their distinct pixel art signatures
const CHARACTERS = [
  {
    id: 'cultist',
    name: 'Cultist',
    colors: {
      skin: '#e2d8ce',
      cloak: '#581c87',
      cloakShadow: '#3b0764',
      trim: '#dc2626',
      eyes: '#ef4444',
      weapon: '#991b1b',
      aura: '#7e22ce'
    },
    features: { hood: true, daggers: true, horns: false, crown: false, staff: false }
  },
  {
    id: 'skeleton_warrior',
    name: 'Skeleton',
    colors: {
      skin: '#f5f5f4',
      cloak: '#78716c',
      cloakShadow: '#44403c',
      trim: '#a8a29e',
      eyes: '#22d3ee',
      weapon: '#94a3b8',
      aura: '#38bdf8'
    },
    features: { skeleton: true, helmet: true, sword: true }
  },
  {
    id: 'goblin',
    name: 'Goblin',
    colors: {
      skin: '#65a30d',
      cloak: '#78350f',
      cloakShadow: '#451a03',
      trim: '#ca8a04',
      eyes: '#facc15',
      weapon: '#a1a1aa',
      aura: '#84cc16'
    },
    features: { bigEars: true, loincloth: true, club: true }
  },
  {
    id: 'archer_hero',
    name: 'Archer',
    colors: {
      skin: '#fcd34d',
      cloak: '#15803d',
      cloakShadow: '#14532d',
      trim: '#854d0e',
      eyes: '#38bdf8',
      weapon: '#b45309',
      aura: '#22c55e'
    },
    features: { archerHat: true, bow: true, quiver: true }
  },
  {
    id: 'rogue',
    name: 'Rogue',
    colors: {
      skin: '#fed7aa',
      cloak: '#1e293b',
      cloakShadow: '#0f172a',
      trim: '#64748b',
      eyes: '#fbbf24',
      weapon: '#94a3b8',
      aura: '#6366f1'
    },
    features: { mask: true, dualDaggers: true }
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    colors: {
      skin: '#cbd5e1',
      cloak: '#18181b',
      cloakShadow: '#09090b',
      trim: '#06b6d4',
      eyes: '#22d3ee',
      weapon: '#64748b',
      aura: '#06b6d4'
    },
    features: { skullStaff: true, darkRobe: true }
  },
  {
    id: 'discoverer',
    name: 'Discoverer',
    colors: {
      skin: '#ffedd5',
      cloak: '#9a3412',
      cloakShadow: '#7c2d12',
      trim: '#f59e0b',
      eyes: '#0284c7',
      weapon: '#d97706',
      aura: '#f97316'
    },
    features: { explorerHat: true, backpack: true, torch: true }
  },
  {
    id: 'white_mage',
    name: 'White Mage',
    colors: {
      skin: '#fef08a',
      cloak: '#f8fafc',
      cloakShadow: '#cbd5e1',
      trim: '#dc2626',
      eyes: '#38bdf8',
      weapon: '#facc15',
      aura: '#67e8f9'
    },
    features: { hoodTriangles: true, holyStaff: true }
  },
  {
    id: 'paladin',
    name: 'Paladin',
    colors: {
      skin: '#e2e8f0',
      cloak: '#3b82f6',
      cloakShadow: '#1d4ed8',
      trim: '#facc15',
      eyes: '#60a5fa',
      weapon: '#f1f5f9',
      aura: '#eab308'
    },
    features: { plateArmor: true, holyShield: true, hammer: true }
  },
  {
    id: 'dark_knight',
    name: 'Dark Knight',
    colors: {
      skin: '#09090b',
      cloak: '#18181b',
      cloakShadow: '#020617',
      trim: '#991b1b',
      eyes: '#ef4444',
      weapon: '#dc2626',
      aura: '#b91c1c'
    },
    features: { spikedHelm: true, blackPlate: true, greatsword: true }
  },
  {
    id: 'warlock',
    name: 'Warlock',
    colors: {
      skin: '#e9d5ff',
      cloak: '#4c1d95',
      cloakShadow: '#2e1065',
      trim: '#a855f7',
      eyes: '#d946ef',
      weapon: '#7c3aed',
      aura: '#c084fc'
    },
    features: { horns: true, voidOrb: true }
  },
  {
    id: 'knight_hero',
    name: 'Knight Hero',
    colors: {
      skin: '#f1f5f9',
      cloak: '#2563eb',
      cloakShadow: '#1e40af',
      trim: '#e2e8f0',
      eyes: '#38bdf8',
      weapon: '#f8fafc',
      aura: '#60a5fa'
    },
    features: { fullPlate: true, sword: true, heraldicShield: true }
  },
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    colors: {
      skin: '#ffedd5',
      cloak: '#991b1b',
      cloakShadow: '#7f1d1d',
      trim: '#ea580c',
      eyes: '#f97316',
      weapon: '#f59e0b',
      aura: '#ef4444'
    },
    features: { dragonHelm: true, scaleArmor: true, dragonBlade: true }
  },
  {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    colors: {
      skin: '#334155',
      cloak: '#0f172a',
      cloakShadow: '#020617',
      trim: '#8b5cf6',
      eyes: '#a855f7',
      weapon: '#c084fc',
      aura: '#8b5cf6'
    },
    features: { ninjaMask: true, shadowAura: true, dualBlades: true }
  },
  {
    id: 'berserker',
    name: 'Berserker',
    colors: {
      skin: '#fed7aa',
      cloak: '#7c2d12',
      cloakShadow: '#451a03',
      trim: '#b91c1c',
      eyes: '#dc2626',
      weapon: '#94a3b8',
      aura: '#ea580c'
    },
    features: { hornedHelm: true, battleAxe: true, warpaint: true }
  },
  {
    id: 'slime_king',
    name: 'Slime King',
    colors: {
      skin: '#22c55e',
      cloak: '#16a34a',
      cloakShadow: '#15803d',
      trim: '#facc15',
      eyes: '#ffffff',
      weapon: '#facc15',
      aura: '#4ade80'
    },
    features: { slimeBody: true, royalCrown: true, royalScepter: true }
  },
  {
    id: 'overlord',
    name: 'Overlord',
    colors: {
      skin: '#1e1b4b',
      cloak: '#0f172a',
      cloakShadow: '#020617',
      trim: '#f43f5e',
      eyes: '#f43f5e',
      weapon: '#e11d48',
      aura: '#e11d48'
    },
    features: { demonLord: true, flamingCape: true, chaosScythe: true }
  },
  {
    id: 'archangel',
    name: 'Archangel',
    colors: {
      skin: '#fef08a',
      cloak: '#f8fafc',
      cloakShadow: '#e2e8f0',
      trim: '#f59e0b',
      eyes: '#38bdf8',
      weapon: '#facc15',
      aura: '#fef08a'
    },
    features: { wings: true, halo: true, divineSword: true }
  }
];

function drawCharacterFrame(sheet, char, dirIndex, frameIndex) {
  // dirIndex: 0 = Down, 1 = Left, 2 = Right, 3 = Up
  // frameIndex: 0 = Idle, 1 = Walk 1, 2 = Walk 2, 3 = Action
  const offsetX = frameIndex * FRAME_SIZE;
  const offsetY = dirIndex * FRAME_SIZE;

  const cSkin = parseHex(char.colors.skin);
  const cCloak = parseHex(char.colors.cloak);
  const cShadow = parseHex(char.colors.cloakShadow);
  const cTrim = parseHex(char.colors.trim);
  const cEyes = parseHex(char.colors.eyes);
  const cWeapon = parseHex(char.colors.weapon);
  const cAura = parseHex(char.colors.aura);
  const cBlack = [15, 23, 42, 255];
  const cOutline = [2, 6, 23, 255];

  // Bob offset for walking
  const isWalking = frameIndex === 1 || frameIndex === 2;
  const bobY = isWalking ? (frameIndex === 1 ? -1 : -2) : (frameIndex === 3 ? -1 : 0);
  const legShift = frameIndex === 1 ? -2 : (frameIndex === 2 ? 2 : 0);

  // Drop shadow at feet
  sheet.fillRect(offsetX + 8, offsetY + 27, 16, 4, [0, 0, 0, 90]);

  // Special case: Slime King
  if (char.features.slimeBody) {
    const squish = isWalking ? (frameIndex === 1 ? -2 : 2) : 0;
    // Gelatinous body
    sheet.fillCircle(offsetX + 16, offsetY + 20 + bobY, 11 + squish, cCloak);
    sheet.fillCircle(offsetX + 16, offsetY + 18 + bobY, 9, cSkin);
    // Face (if facing Down, Left, Right)
    if (dirIndex !== 3) {
      const eyeX = dirIndex === 1 ? -3 : (dirIndex === 2 ? 3 : 0);
      sheet.fillRect(offsetX + 11 + eyeX, offsetY + 17 + bobY, 3, 3, cBlack);
      sheet.fillRect(offsetX + 18 + eyeX, offsetY + 17 + bobY, 3, 3, cBlack);
      sheet.fillRect(offsetX + 12 + eyeX, offsetY + 17 + bobY, 1, 1, [255, 255, 255, 255]);
      sheet.fillRect(offsetX + 19 + eyeX, offsetY + 17 + bobY, 1, 1, [255, 255, 255, 255]);
    }
    // Crown
    sheet.fillRect(offsetX + 11, offsetY + 7 + bobY, 10, 4, cTrim);
    sheet.fillRect(offsetX + 10, offsetY + 5 + bobY, 3, 3, cTrim);
    sheet.fillRect(offsetX + 15, offsetY + 4 + bobY, 3, 4, cTrim);
    sheet.fillRect(offsetX + 19, offsetY + 5 + bobY, 3, 3, cTrim);
    sheet.setPixel(offsetX + 16, offsetY + 6 + bobY, [239, 68, 68, 255]); // Ruby gem
    return;
  }

  // Wings (Archangel / Overlord)
  if (char.features.wings || char.features.demonLord) {
    const wingCol = char.features.wings ? [254, 240, 138, 220] : [225, 29, 72, 220];
    const wingFlap = isWalking ? (frameIndex % 2 === 0 ? -2 : 2) : 0;
    // Left wing
    sheet.fillRect(offsetX + 3, offsetY + 9 + wingFlap, 5, 12, wingCol);
    sheet.fillRect(offsetX + 1, offsetY + 11 + wingFlap, 3, 8, wingCol);
    // Right wing
    sheet.fillRect(offsetX + 24, offsetY + 9 + wingFlap, 5, 12, wingCol);
    sheet.fillRect(offsetX + 28, offsetY + 11 + wingFlap, 3, 8, wingCol);
  }

  // Legs / Feet
  const legY = offsetY + 24 + bobY;
  if (dirIndex === 0 || dirIndex === 3) {
    // Left & Right legs
    sheet.fillRect(offsetX + 11 + legShift, legY, 4, 5, cShadow);
    sheet.fillRect(offsetX + 17 - legShift, legY, 4, 5, cShadow);
  } else if (dirIndex === 1) {
    // Left facing legs
    sheet.fillRect(offsetX + 12 + legShift, legY, 4, 5, cShadow);
    sheet.fillRect(offsetX + 16 - legShift, legY, 4, 5, cShadow);
  } else {
    // Right facing legs
    sheet.fillRect(offsetX + 12 - legShift, legY, 4, 5, cShadow);
    sheet.fillRect(offsetX + 16 + legShift, legY, 4, 5, cShadow);
  }

  // Torso / Armor / Cloak
  const bodyY = offsetY + 14 + bobY;
  sheet.fillRect(offsetX + 10, bodyY, 12, 11, cCloak);
  sheet.fillRect(offsetX + 11, bodyY + 1, 10, 9, cShadow);

  // Chest detail / Trim / Heraldry
  sheet.fillRect(offsetX + 14, bodyY + 2, 4, 8, cTrim);
  if (char.features.plateArmor || char.features.fullPlate || char.features.blackPlate) {
    sheet.fillRect(offsetX + 12, bodyY + 3, 8, 4, cSkin);
  }

  // Head / Helmet / Face
  const headY = offsetY + 5 + bobY;
  sheet.fillRect(offsetX + 10, headY, 12, 10, cSkin);

  // Helmet / Hood / Hat overlay
  if (char.features.hood || char.features.hoodTriangles) {
    sheet.fillRect(offsetX + 9, headY - 1, 14, 4, cCloak);
    sheet.fillRect(offsetX + 9, headY + 2, 3, 8, cCloak);
    sheet.fillRect(offsetX + 20, headY + 2, 3, 8, cCloak);
  } else if (char.features.helmet || char.features.plateArmor || char.features.fullPlate || char.features.spikedHelm || char.features.dragonHelm) {
    sheet.fillRect(offsetX + 9, headY - 2, 14, 5, cShadow);
    sheet.fillRect(offsetX + 9, headY + 3, 2, 7, cShadow);
    sheet.fillRect(offsetX + 21, headY + 3, 2, 7, cShadow);
    // Crest / Plume
    sheet.fillRect(offsetX + 14, headY - 4, 4, 3, cTrim);
  } else if (char.features.archerHat || char.features.explorerHat) {
    sheet.fillRect(offsetX + 7, headY + 1, 18, 3, cTrim);
    sheet.fillRect(offsetX + 10, headY - 3, 12, 5, cCloak);
  } else if (char.features.bigEars) {
    // Goblin ears
    sheet.fillRect(offsetX + 6, headY + 2, 4, 3, cSkin);
    sheet.fillRect(offsetX + 22, headY + 2, 4, 3, cSkin);
  }

  // Halo (Archangel)
  if (char.features.halo) {
    sheet.fillRect(offsetX + 11, headY - 5, 10, 2, [254, 240, 138, 255]);
  }

  // Face rendering based on direction
  if (dirIndex === 0) {
    // South / Front
    if (char.features.skeleton) {
      sheet.fillRect(offsetX + 12, headY + 3, 3, 3, cEyes);
      sheet.fillRect(offsetX + 17, headY + 3, 3, 3, cEyes);
      sheet.fillRect(offsetX + 14, headY + 7, 4, 2, cBlack);
    } else if (char.features.spikedHelm || char.features.darkKnight) {
      // Visor slit
      sheet.fillRect(offsetX + 12, headY + 4, 8, 2, cEyes);
    } else {
      // Eyes
      sheet.fillRect(offsetX + 12, headY + 4, 2, 2, cEyes);
      sheet.fillRect(offsetX + 18, headY + 4, 2, 2, cEyes);
    }
  } else if (dirIndex === 1) {
    // West / Left
    sheet.fillRect(offsetX + 11, headY + 4, 2, 2, cEyes);
  } else if (dirIndex === 2) {
    // East / Right
    sheet.fillRect(offsetX + 19, headY + 4, 2, 2, cEyes);
  } else {
    // North / Back (Back of hood/helmet/hair)
    sheet.fillRect(offsetX + 11, headY + 2, 10, 7, cCloak);
  }

  // Weapon / Hands
  const weaponActionOffset = frameIndex === 3 ? (dirIndex === 1 ? -4 : (dirIndex === 2 ? 4 : 2)) : 0;
  if (dirIndex === 0 || dirIndex === 2) {
    // Right hand weapon
    const wx = offsetX + 21 + weaponActionOffset;
    const wy = offsetY + 13 + bobY;
    sheet.fillRect(wx, wy, 3, 12, cWeapon);
    sheet.fillRect(wx - 2, wy + 4, 7, 2, cTrim); // Guard
  } else if (dirIndex === 1) {
    // Left hand weapon
    const wx = offsetX + 8 + weaponActionOffset;
    const wy = offsetY + 13 + bobY;
    sheet.fillRect(wx, wy, 3, 12, cWeapon);
    sheet.fillRect(wx - 2, wy + 4, 7, 2, cTrim);
  }
}

function generateAllCharacters() {
  const outDir = path.resolve('./public/assets/characters');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Generating 18 Fantasy Dungeon character sprite sheets in ${outDir}...`);

  for (const char of CHARACTERS) {
    const sheet = new SpriteBuffer(SHEET_W, SHEET_H);

    for (let dir = 0; dir < 4; dir++) {
      for (let frame = 0; frame < 4; frame++) {
        drawCharacterFrame(sheet, char, dir, frame);
      }
    }

    const pngData = sheet.toPng();
    const filePath = path.join(outDir, `${char.id}.png`);
    fs.writeFileSync(filePath, pngData);
    console.log(`✓ Generated ${char.name} -> ${filePath} (${pngData.length} bytes)`);
  }

  console.log('All 18 Fantasy Dungeon character sprite sheets generated successfully!');
}

generateAllCharacters();
