import type { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { getFantasySkin } from './src/data/fantasySkinsData.ts';
import {
  computeEqualMapSpawns,
  pickFarthestOpenMapSpawn,
  type SpawnCoordinate
} from './src/utils/battleSpawnLayout.ts';

export interface RoomPlayer {
  uid: string;
  name: string;
  avatar: string;
  equippedWeapon: string;
  x: number;
  y: number;
  angle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  wood: number;
  brick: number;
  metal: number;
  isAlive: boolean;
  isSpectator?: boolean;
  kills: number;
  highGroundActive?: boolean;
  metalShieldActiveUntil?: number;
  royalAbsorptionUsedAt?: number;
  brittleGuardUsedAt?: number;
  frostSlowUntil?: number;
  vx?: number;
  vy?: number;
  dirty?: boolean;
  lastUpdateAt?: number;
}

export interface RoomStructure {
  id: string;
  x: number;
  y: number;
  type: 'wood_wall' | 'brick_ramp' | 'metal_bunker';
  hp: number;
  maxHp: number;
  ownerId: string;
  createdAt: string;
  rotation?: number;
}

export interface RoomCrate {
  id: string;
  x: number;
  y: number;
  isClaimed: boolean;
  rewardType: 'shield' | 'materials';
  question: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
  claimedBy?: string;
}

export interface RoomLobbyPlayer {
  uid: string;
  name: string;
  avatar: string;
  equippedWeapon: string;
  wood: number;
  brick: number;
  metal: number;
  isReady: boolean;
  joinedAt: string;
  isSpectator?: boolean;
}

export interface RoomMatchState {
  status: 'LOBBY' | 'IN_PROGRESS' | 'ENDED';
  isLobbyOpen: boolean;
  startedAt: string | null;
  stormFinalCenter?: { x: number; y: number } | null;
  currentWinner?: { uid: string; name: string; avatar: string } | null;
}

export interface RoomEventConfig {
  nextEventDate: string;
  title: string;
  description?: string;
  season: number;
  isScheduled?: boolean;
}

interface AttachedSocket extends WebSocket {
  uid?: string;
  isAlivePing?: boolean;
}

const roomState: RoomMatchState = {
  status: 'LOBBY',
  isLobbyOpen: false,
  startedAt: null,
  stormFinalCenter: null,
  currentWinner: null
};

let roomConfig: RoomEventConfig | null = null;

const roomPlayers = new Map<string, RoomPlayer>();
const roomStructures = new Map<string, RoomStructure>();
const roomCrates = new Map<string, RoomCrate>();
const roomLobby = new Map<string, RoomLobbyPlayer>();
const connectedClients = new Set<AttachedSocket>();

export function getServerBattleState() {
  return {
    ...roomState,
    lobbyPlayers: Array.from(roomLobby.values()),
    config: roomConfig
  };
}

function resolveFullShieldCap(avatarId?: string): number {
  return getFantasySkin(avatarId || 'cultist').id === 'knight_hero' ? 120 : 100;
}

function buildSpawnFromLobby(l: RoomLobbyPlayer, spawn: SpawnCoordinate): RoomPlayer {
  const fullShield = resolveFullShieldCap(l.avatar);
  return {
    uid: l.uid,
    name: l.name || 'Hero',
    avatar: l.avatar || 'cultist',
    equippedWeapon: l.equippedWeapon || 'bunsen_burner',
    x: spawn.x,
    y: spawn.y,
    angle: spawn.angle,
    hp: 100,
    maxHp: 100,
    shield: fullShield,
    maxShield: fullShield,
    wood: Math.max(10, l.wood || 20),
    brick: Math.max(10, l.brick || 10),
    metal: Math.max(5, l.metal || 5),
    isAlive: true,
    isSpectator: false,
    kills: 0,
    vx: 0,
    vy: 0,
    dirty: false,
    lastUpdateAt: Date.now()
  };
}

function computeServerDamageOutcome(
  target: RoomPlayer,
  damageAmount: number,
  isStormDamage: boolean,
  nowMs: number
) {
  const skinDef = getFantasySkin(target.avatar || 'cultist');
  let actualDamage = Math.max(1, Math.round(damageAmount));
  let bricksGained = 0;
  let brittleGuardTriggered = false;
  let royalAbsorptionUsedAt = target.royalAbsorptionUsedAt;
  let brittleGuardUsedAt = target.brittleGuardUsedAt;

  if (isStormDamage) {
    if (skinDef.id === 'dark_knight') {
      actualDamage = Math.max(1, Math.round(actualDamage * 0.5));
    }
  } else {
    if (target.metalShieldActiveUntil && target.metalShieldActiveUntil > nowMs) {
      actualDamage = Math.round(actualDamage * 0.5);
    }

    const defReduction = Math.min(0.25, Math.max(0, ((skinDef.defense - 18) / 80) * 0.25));
    actualDamage = Math.max(1, Math.round(actualDamage * (1 - defReduction)));

    if (skinDef.id === 'slime') {
      actualDamage = Math.max(1, Math.round(actualDamage * 0.85));
    }

    if (
      skinDef.id === 'slime_king' &&
      (!target.royalAbsorptionUsedAt || nowMs - target.royalAbsorptionUsedAt >= 10000)
    ) {
      const absorbed = Math.max(1, Math.round(actualDamage * 0.5));
      actualDamage = Math.max(1, actualDamage - absorbed);
      bricksGained = Math.max(6, Math.round(absorbed * 0.5));
      royalAbsorptionUsedAt = nowMs;
    }
  }

  let newShield = target.shield || 0;
  let newHp = target.hp ?? 100;

  if (isStormDamage) {
    newHp = Math.max(0, newHp - actualDamage);
  } else {
    if (newShield > 0) {
      if (newShield >= actualDamage) {
        newShield -= actualDamage;
        actualDamage = 0;
      } else {
        actualDamage -= newShield;
        newShield = 0;
      }
    }
    newHp = Math.max(0, newHp - actualDamage);

    if (
      newHp <= 0 &&
      skinDef.id === 'skeleton_warrior' &&
      (!target.brittleGuardUsedAt || nowMs - target.brittleGuardUsedAt >= 25000)
    ) {
      newHp = 20;
      brittleGuardTriggered = true;
      brittleGuardUsedAt = nowMs;
    }
  }

  return {
    newShield,
    newHp,
    isKilled: newHp <= 0,
    bricksGained,
    brittleGuardTriggered,
    royalAbsorptionUsedAt,
    brittleGuardUsedAt
  };
}

function broadcastJson(payload: unknown, excludeSocket?: AttachedSocket) {
  if (connectedClients.size === 0) return;
  const serialized = JSON.stringify(payload);
  for (const client of connectedClients) {
    if (client === excludeSocket) continue;
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  }
}

function maybeCheckLastStandingWinner() {
  if (roomState.status !== 'IN_PROGRESS') return;
  const realPlayers = Array.from(roomPlayers.values()).filter(
    p => p.uid && !p.uid.startsWith('dummy_') && !p.isSpectator
  );
  if (realPlayers.length < 2) return;
  const alivePlayers = realPlayers.filter(p => p.isAlive && p.hp > 0);
  if (alivePlayers.length === 1) {
    const victor = alivePlayers[0];
    roomState.status = 'ENDED';
    roomState.isLobbyOpen = false;
    roomState.currentWinner = {
      uid: victor.uid,
      name: victor.name,
      avatar: victor.avatar
    };
    broadcastJson({
      type: 'match_state',
      state: { ...roomState }
    });
  } else if (alivePlayers.length === 0) {
    const ranked = [...realPlayers].sort(
      (a, b) => ((b.kills || 0) * 100 + (b.lastUpdateAt || 0) * 0.0001) - ((a.kills || 0) * 100 + (a.lastUpdateAt || 0) * 0.0001)
    );
    const victor = ranked[0];
    roomState.status = 'ENDED';
    roomState.isLobbyOpen = false;
    roomState.currentWinner = victor
      ? { uid: victor.uid, name: victor.name, avatar: victor.avatar }
      : null;
    broadcastJson({
      type: 'match_state',
      state: { ...roomState }
    });
  }
}

/**
 * Allows Express REST endpoints (/api/battle/control) to update live WebSocket room state immediately
 * when the instructor clicks Start, End, or Reset from AdminBattleControl or Arena HUD.
 */
export function applyServerBattleControl(input: {
  action: 'start' | 'end' | 'reset' | 'crate_drop' | 'lobby_open' | 'lobby_join' | 'lobby_leave' | 'config_update';
  state?: Partial<RoomMatchState>;
  players?: RoomPlayer[];
  crates?: RoomCrate[];
  crate?: RoomCrate;
  lobbyPlayer?: RoomLobbyPlayer;
  config?: Partial<RoomEventConfig> | null;
}) {
  const { action, state, players, crates, crate, lobbyPlayer, config } = input;
  if (action === 'config_update') {
    if (config) {
      roomConfig = {
        nextEventDate: typeof config.nextEventDate === 'string' ? config.nextEventDate : (roomConfig?.nextEventDate || ''),
        title: typeof config.title === 'string' && config.title ? config.title : (roomConfig?.title || 'Monthly Cambridge 0653 Revision Royale'),
        description: typeof config.description === 'string' ? config.description : roomConfig?.description,
        season: typeof config.season === 'number' ? config.season : (roomConfig?.season || 1),
        isScheduled: config.isScheduled !== undefined ? Boolean(config.isScheduled) : Boolean(config.nextEventDate)
      };
    } else {
      roomConfig = null;
    }
    return;
  }

  if (action === 'crate_drop' && crate && crate.id) {
    if (roomCrates.size < 14) {
      roomCrates.set(crate.id, { ...crate, isClaimed: false });
      broadcastJson({ type: 'crate_add', crate });
    }
    return;
  }

  if (action === 'lobby_open') {
    const nextOpen = Boolean(state?.isLobbyOpen);
    roomState.isLobbyOpen = nextOpen;
    if (!nextOpen && roomState.status !== 'IN_PROGRESS') {
      roomLobby.clear();
    }
    broadcastJson({
      type: 'match_state',
      state: { ...roomState }
    });
    broadcastJson({
      type: 'lobby_state',
      players: Array.from(roomLobby.values())
    });
    return;
  }

  if (action === 'lobby_join' && lobbyPlayer && lobbyPlayer.uid && !lobbyPlayer.isSpectator) {
    roomLobby.set(lobbyPlayer.uid, {
      ...lobbyPlayer,
      isReady: true,
      joinedAt: lobbyPlayer.joinedAt || new Date().toISOString()
    });
    broadcastJson({
      type: 'lobby_state',
      players: Array.from(roomLobby.values())
    });
    return;
  }

  if (action === 'lobby_leave' && lobbyPlayer?.uid) {
    roomLobby.delete(lobbyPlayer.uid);
    broadcastJson({
      type: 'lobby_state',
      players: Array.from(roomLobby.values())
    });
    return;
  }

  if (action === 'reset') {
    roomPlayers.clear();
    roomStructures.clear();
    roomCrates.clear();
    roomLobby.clear();
    roomState.status = state?.status || 'LOBBY';
    roomState.isLobbyOpen = Boolean(state?.isLobbyOpen);
    roomState.startedAt = null;
    roomState.stormFinalCenter = null;
    roomState.currentWinner = null;
    broadcastJson({
      type: 'match_reset',
      state: { ...roomState }
    });
    broadcastJson({
      type: 'lobby_state',
      players: []
    });
    return;
  }

  if (action === 'start') {
    const incomingStartedAt = state?.startedAt || new Date().toISOString();
    const startNow = Date.now();
    roomPlayers.clear();
    roomStructures.clear();
    roomCrates.clear();

    if (Array.isArray(players)) {
      for (const p of players) {
        if (p && p.uid && !p.isSpectator) {
          const fullShield = resolveFullShieldCap(p.avatar);
          roomPlayers.set(p.uid, {
            ...p,
            hp: 100,
            maxHp: 100,
            shield: fullShield,
            maxShield: fullShield,
            isAlive: true,
            isSpectator: false,
            kills: 0,
            vx: 0,
            vy: 0,
            dirty: false,
            lastUpdateAt: startNow
          });
        }
      }
    }

    // Ensure every student locked in roomLobby also enters alive with full HP & full shields, equally spread across the map
    const missingLobby = Array.from(roomLobby.values())
      .filter(l => l.uid && !l.isSpectator && !roomPlayers.has(l.uid))
      .sort((a, b) => a.uid.localeCompare(b.uid));

    if (missingLobby.length > 0) {
      if (roomPlayers.size === 0) {
        const spawns = computeEqualMapSpawns(missingLobby.length, incomingStartedAt);
        missingLobby.forEach((l, i) => {
          roomPlayers.set(l.uid, buildSpawnFromLobby(l, spawns[i]));
        });
      } else {
        for (const l of missingLobby) {
          const openSpawn = pickFarthestOpenMapSpawn(
            l.uid,
            incomingStartedAt,
            Array.from(roomPlayers.values())
          );
          roomPlayers.set(l.uid, buildSpawnFromLobby(l, openSpawn));
        }
      }
    }

    if (Array.isArray(crates)) {
      for (const c of crates) {
        if (c && c.id) {
          roomCrates.set(c.id, { ...c });
        }
      }
    }
    roomState.status = 'IN_PROGRESS';
    roomState.isLobbyOpen = state?.isLobbyOpen ?? true;
    roomState.startedAt = incomingStartedAt;
    roomState.stormFinalCenter = state?.stormFinalCenter || null;
    roomState.currentWinner = null;
    broadcastJson({
      type: 'match_start',
      state: { ...roomState },
      players: Array.from(roomPlayers.values()),
      crates: Array.from(roomCrates.values())
    });
    return;
  }

  if (action === 'end') {
    roomState.status = 'ENDED';
    roomState.isLobbyOpen = false;
    roomState.currentWinner = state?.currentWinner ?? null;
    broadcastJson({
      type: 'match_state',
      state: { ...roomState }
    });
  }
}

export function createBattleWebSocketServer() {
  const wss = new WebSocketServer({
    noServer: true,
    perMessageDeflate: false // Skip per-frame deflate CPU overhead for 32-player 20Hz ticks
  });

  // 30Hz (33ms) coalesced delta tick with sub-pixel coords & velocity for smooth opponent interpolation
  const tickInterval = setInterval(() => {
    if (connectedClients.size === 0 || roomPlayers.size === 0) return;
    const updatedTuples: Array<
      [string, number, number, number, number, number, number, number, string, string, number, number, number, number, number]
    > = [];
    for (const p of roomPlayers.values()) {
      if (!p.dirty) continue;
      p.dirty = false;
      updatedTuples.push([
        p.uid,
        Number(p.x.toFixed(1)),
        Number(p.y.toFixed(1)),
        Number((p.angle || 0).toFixed(2)),
        p.hp,
        p.shield,
        p.isAlive ? 1 : 0,
        p.kills || 0,
        p.avatar || 'cultist',
        p.equippedWeapon || 'bunsen_burner',
        p.highGroundActive ? 1 : 0,
        p.metalShieldActiveUntil || 0,
        p.frostSlowUntil || 0,
        Math.round(p.vx || 0),
        Math.round(p.vy || 0)
      ]);
    }
    if (updatedTuples.length > 0) {
      broadcastJson({
        type: 'tick',
        t: Date.now(),
        u: updatedTuples
      });
    }
  }, 33);

  // Heartbeat keepalive so reverse proxies (Cloud Run) keep WS open and dead tabs get cleaned up
  const heartbeatInterval = setInterval(() => {
    for (const client of connectedClients) {
      if (client.isAlivePing === false) {
        connectedClients.delete(client);
        try {
          client.terminate();
        } catch {}
        continue;
      }
      client.isAlivePing = false;
      try {
        client.ping();
      } catch {}
    }
  }, 20000);

  wss.on('close', () => {
    clearInterval(tickInterval);
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (rawWs: WebSocket) => {
    const ws = rawWs as AttachedSocket;
    ws.isAlivePing = true;
    connectedClients.add(ws);

    ws.on('pong', () => {
      ws.isAlivePing = true;
    });

    ws.on('message', (rawBuf) => {
      let msg: any;
      try {
        msg = JSON.parse(rawBuf.toString());
      } catch {
        return;
      }
      if (!msg || typeof msg.type !== 'string') return;
      const now = Date.now();

      switch (msg.type) {
        case 'hello': {
          const incomingUid = typeof msg.uid === 'string' ? msg.uid.trim() : '';
          if (incomingUid) {
            ws.uid = incomingUid;
          }

          // Synchronize match seed if a newer IN_PROGRESS match started on Firestore
          const incomingState = msg.state as Partial<RoomMatchState> | undefined;
          if (incomingState) {
            if (
              incomingState.status === 'IN_PROGRESS' &&
              incomingState.startedAt &&
              incomingState.startedAt !== roomState.startedAt
            ) {
              const incomingMs = new Date(incomingState.startedAt).getTime();
              const currentMs = roomState.startedAt ? new Date(roomState.startedAt).getTime() : 0;
              if (!Number.isNaN(incomingMs) && incomingMs >= currentMs) {
                roomPlayers.clear();
                roomStructures.clear();
                roomCrates.clear();
                roomState.status = 'IN_PROGRESS';
                roomState.isLobbyOpen = incomingState.isLobbyOpen ?? true;
                roomState.startedAt = incomingState.startedAt;
                roomState.stormFinalCenter = incomingState.stormFinalCenter || null;
                roomState.currentWinner = null;
              }
            } else if (!roomState.startedAt && incomingState.status) {
              roomState.status = incomingState.status;
              roomState.isLobbyOpen = Boolean(incomingState.isLobbyOpen);
              roomState.startedAt = incomingState.startedAt || null;
              roomState.stormFinalCenter = incomingState.stormFinalCenter || null;
              roomState.currentWinner = incomingState.currentWinner || null;
            }
          }

          const isSpectator = Boolean(msg.isSpectator || msg.player?.isSpectator);
          if (isSpectator && incomingUid) {
            roomPlayers.delete(incomingUid);
          }

          // Seed players/crates only if room doesn't have them yet for this match (never seed dead ghosts or spectators)
          if (Array.isArray(msg.seedPlayers)) {
            for (const sp of msg.seedPlayers) {
              if (
                sp &&
                sp.uid &&
                !sp.isSpectator &&
                sp.isAlive &&
                (sp.hp === undefined || sp.hp > 0) &&
                !roomPlayers.has(sp.uid)
              ) {
                roomPlayers.set(sp.uid, { ...sp, dirty: false, lastUpdateAt: now });
              }
            }
          }
          if (Array.isArray(msg.seedStructs) && roomStructures.size === 0) {
            for (const st of msg.seedStructs) {
              if (st && st.id) roomStructures.set(st.id, { ...st });
            }
          }
          if (Array.isArray(msg.seedCrates) && roomCrates.size === 0) {
            for (const cr of msg.seedCrates) {
              if (cr && cr.id && !cr.isClaimed) roomCrates.set(cr.id, { ...cr });
            }
          }

          if (!isSpectator && msg.player && msg.player.uid) {
            const p = msg.player as RoomPlayer;
            const startedAtMs = roomState.startedAt ? new Date(roomState.startedAt).getTime() : 0;
            const existingRaw = roomPlayers.get(p.uid);
            // If an existing entry belongs to a previous match (stale timestamp), reset them fresh
            const isStaleExisting = Boolean(
              existingRaw && startedAtMs > 0 && (existingRaw.lastUpdateAt || 0) < startedAtMs - 2000
            );
            const existing = isStaleExisting ? undefined : existingRaw;
            const fullShield = resolveFullShieldCap(p.avatar);
            if (!existing) {
              const useServerSpread =
                roomState.status === 'IN_PROGRESS' && !msg.spawnSynced;
              const openSpawn = useServerSpread
                ? pickFarthestOpenMapSpawn(
                    p.uid,
                    roomState.startedAt || 'live',
                    Array.from(roomPlayers.values())
                  )
                : null;
              const created: RoomPlayer = {
                ...p,
                x: openSpawn ? openSpawn.x : p.x,
                y: openSpawn ? openSpawn.y : p.y,
                angle: openSpawn ? openSpawn.angle : p.angle,
                isAlive: true,
                isSpectator: false,
                hp: 100,
                maxHp: 100,
                maxShield: fullShield,
                shield: fullShield,
                kills: 0,
                dirty: true,
                lastUpdateAt: now
              };
              roomPlayers.set(p.uid, created);
            } else {
              // Preserve authoritative combat stats (hp, shield, isAlive, kills), allow skin/weapon/name sync
              existing.name = p.name || existing.name;
              existing.avatar = p.avatar || existing.avatar;
              existing.equippedWeapon = p.equippedWeapon || existing.equippedWeapon;
              existing.lastUpdateAt = now;
              existing.dirty = true;
            }
          }

          ws.send(
            JSON.stringify({
              type: 'welcome',
              state: { ...roomState },
              players: Array.from(roomPlayers.values()),
              structures: Array.from(roomStructures.values()),
              crates: Array.from(roomCrates.values()),
              lobbyPlayers: Array.from(roomLobby.values())
            })
          );
          break;
        }

        case 'pos': {
          const uid = ws.uid || (typeof msg.uid === 'string' ? msg.uid : '');
          if (!uid) return;
          const p = roomPlayers.get(uid);
          if (!p) return;
          if (!p.isAlive || p.hp <= 0) return; // Spectators don't broadcast live avatar positions

          const prevX = p.x;
          const prevY = p.y;
          const prevUpdateAt = p.lastUpdateAt || now;
          if (typeof msg.x === 'number' && Number.isFinite(msg.x)) {
            p.x = Math.max(0, Math.min(5120, msg.x));
          }
          if (typeof msg.y === 'number' && Number.isFinite(msg.y)) {
            p.y = Math.max(0, Math.min(5120, msg.y));
          }
          if (typeof msg.vx === 'number' && Number.isFinite(msg.vx)) {
            p.vx = Math.max(-900, Math.min(900, msg.vx));
          } else {
            const elapsedSec = Math.max(0.016, (now - prevUpdateAt) / 1000);
            p.vx = elapsedSec < 0.25 ? Math.max(-900, Math.min(900, (p.x - prevX) / elapsedSec)) : 0;
          }
          if (typeof msg.vy === 'number' && Number.isFinite(msg.vy)) {
            p.vy = Math.max(-900, Math.min(900, msg.vy));
          } else {
            const elapsedSec = Math.max(0.016, (now - prevUpdateAt) / 1000);
            p.vy = elapsedSec < 0.25 ? Math.max(-900, Math.min(900, (p.y - prevY) / elapsedSec)) : 0;
          }
          if (typeof msg.angle === 'number' && Number.isFinite(msg.angle)) p.angle = msg.angle;
          if (typeof msg.avatar === 'string' && msg.avatar) p.avatar = msg.avatar;
          if (typeof msg.equippedWeapon === 'string' && msg.equippedWeapon) p.equippedWeapon = msg.equippedWeapon;
          if (typeof msg.wood === 'number') p.wood = msg.wood;
          if (typeof msg.brick === 'number') p.brick = msg.brick;
          if (typeof msg.metal === 'number') p.metal = msg.metal;
          if (typeof msg.highGroundActive === 'boolean') p.highGroundActive = msg.highGroundActive;
          if (typeof msg.metalShieldActiveUntil === 'number') {
            p.metalShieldActiveUntil = msg.metalShieldActiveUntil;
          }
          p.lastUpdateAt = now;
          p.dirty = true;
          break;
        }

        case 'shot': {
          const senderUid = ws.uid || (typeof msg.ownerId === 'string' ? msg.ownerId : '');
          if (!senderUid) return;
          const sender = roomPlayers.get(senderUid);
          if (sender && (!sender.isAlive || sender.hp <= 0)) return;
          const sx = typeof msg.x === 'number' && Number.isFinite(msg.x) ? msg.x : (sender?.x ?? 2560);
          const sy = typeof msg.y === 'number' && Number.isFinite(msg.y) ? msg.y : (sender?.y ?? 2560);
          const sAngle = typeof msg.angle === 'number' && Number.isFinite(msg.angle) ? msg.angle : 0;
          broadcastJson(
            {
              type: 'shot',
              ownerId: senderUid,
              weaponId: msg.weaponId,
              isAlt: Boolean(msg.isAlt),
              altType: msg.altType,
              x: sx,
              y: sy,
              angle: sAngle,
              color: msg.color,
              projectiles: Array.isArray(msg.projectiles) ? msg.projectiles.slice(0, 14) : undefined,
              vfx: Array.isArray(msg.vfx) ? msg.vfx.slice(0, 8) : undefined
            },
            ws
          );
          break;
        }

        case 'hit': {
          const targetUid = typeof msg.targetUid === 'string' ? msg.targetUid : '';
          if (!targetUid || targetUid.startsWith('dummy_')) return;
          const target = roomPlayers.get(targetUid);
          if (!target || target.isSpectator || !target.isAlive || target.hp <= 0) return;

          const attackerUid = typeof msg.attackerUid === 'string' ? msg.attackerUid : ws.uid;
          const isStorm = Boolean(msg.isStorm);
          const damage = typeof msg.damage === 'number' && Number.isFinite(msg.damage) ? msg.damage : 0;
          if (damage <= 0) return;

          const chillMs = !isStorm && typeof msg.chillMs === 'number' && Number.isFinite(msg.chillMs)
            ? Math.max(0, Math.min(6000, Math.round(msg.chillMs)))
            : 0;

          const outcome = computeServerDamageOutcome(target, damage, isStorm, now);
          target.shield = outcome.newShield;
          target.hp = outcome.newHp;
          target.isAlive = !outcome.isKilled;
          if (outcome.isKilled) {
            target.vx = 0;
            target.vy = 0;
          }
          if (outcome.bricksGained > 0) {
            target.brick = (target.brick || 0) + outcome.bricksGained;
          }
          if (outcome.royalAbsorptionUsedAt !== undefined) {
            target.royalAbsorptionUsedAt = outcome.royalAbsorptionUsedAt;
          }
          if (outcome.brittleGuardUsedAt !== undefined) {
            target.brittleGuardUsedAt = outcome.brittleGuardUsedAt;
          }
          if (chillMs > 0 && !outcome.isKilled) {
            target.frostSlowUntil = Math.max(target.frostSlowUntil || 0, now + chillMs);
          }
          target.dirty = true;

          let killerKills: number | undefined;
          if (outcome.isKilled && !isStorm && attackerUid && attackerUid !== targetUid) {
            const attacker = roomPlayers.get(attackerUid);
            if (attacker) {
              attacker.kills = (attacker.kills || 0) + 1;
              attacker.dirty = true;
              killerKills = attacker.kills;
            }
          }

          broadcastJson({
            type: 'dmg',
            targetUid,
            attackerUid: isStorm ? undefined : attackerUid,
            isStorm,
            damage,
            hp: target.hp,
            shield: target.shield,
            isAlive: target.isAlive,
            killed: outcome.isKilled,
            brittleGuardTriggered: outcome.brittleGuardTriggered,
            bricksGained: outcome.bricksGained,
            newBrick: target.brick,
            killerKills,
            ...(chillMs > 0 && !outcome.isKilled ? { chillMs, frostSlowUntil: target.frostSlowUntil } : {})
          });

          if (outcome.isKilled) {
            maybeCheckLastStandingWinner();
          }
          break;
        }

        case 'self_vitals': {
          const uid = ws.uid || (typeof msg.uid === 'string' ? msg.uid : '');
          const p = uid ? roomPlayers.get(uid) : undefined;
          if (!p || !p.isAlive || p.hp <= 0) return;
          const skinCap = getFantasySkin(p.avatar || 'cultist').id === 'knight_hero' ? 120 : 100;
          const maxSh = Math.max(skinCap, p.maxShield || skinCap);
          if (typeof msg.hp === 'number') p.hp = Math.max(0, Math.min(100, msg.hp));
          if (typeof msg.shield === 'number') p.shield = Math.max(0, Math.min(maxSh, msg.shield));
          if (typeof msg.wood === 'number') p.wood = msg.wood;
          if (typeof msg.brick === 'number') p.brick = msg.brick;
          if (typeof msg.metal === 'number') p.metal = msg.metal;
          p.dirty = true;
          break;
        }

        case 'build': {
          const st = msg.structure as RoomStructure | undefined;
          if (!st || !st.id) return;
          roomStructures.set(st.id, { ...st });
          const builder = roomPlayers.get(st.ownerId);
          if (builder) {
            if (typeof msg.wood === 'number') builder.wood = msg.wood;
            if (typeof msg.brick === 'number') builder.brick = msg.brick;
            if (typeof msg.metal === 'number') builder.metal = msg.metal;
            if (typeof msg.metalShieldActiveUntil === 'number') {
              builder.metalShieldActiveUntil = msg.metalShieldActiveUntil;
            }
            builder.dirty = true;
          }
          broadcastJson({ type: 'struct_add', structure: st });
          break;
        }

        case 'struct_hit': {
          const id = typeof msg.id === 'string' ? msg.id : '';
          const dmg = typeof msg.damage === 'number' ? msg.damage : 0;
          const st = id ? roomStructures.get(id) : undefined;
          if (!st || dmg <= 0) return;
          st.hp -= dmg;
          const destroyed = st.hp <= 0;
          if (destroyed) {
            roomStructures.delete(id);
          }
          broadcastJson({
            type: 'struct_upd',
            id,
            hp: Math.max(0, st.hp),
            destroyed,
            attackerUid: ws.uid
          });
          break;
        }

        case 'crate_drop': {
          const cr = msg.crate as RoomCrate | undefined;
          if (!cr || !cr.id) return;
          if (roomCrates.size >= 14) return;
          roomCrates.set(cr.id, { ...cr, isClaimed: false });
          broadcastJson({ type: 'crate_add', crate: cr });
          break;
        }

        case 'crate_claim': {
          const crateId = typeof msg.crateId === 'string' ? msg.crateId : '';
          const uid = ws.uid || (typeof msg.uid === 'string' ? msg.uid : '');
          const cr = crateId ? roomCrates.get(crateId) : undefined;
          if (!cr || cr.isClaimed) {
            // Already claimed by someone else
            if (cr?.claimedBy) {
              ws.send(JSON.stringify({ type: 'crate_claimed', crateId, uid: cr.claimedBy }));
            }
            return;
          }
          cr.isClaimed = true;
          cr.claimedBy = uid;
          roomCrates.delete(crateId);
          const p = uid ? roomPlayers.get(uid) : undefined;
          if (p) {
            const skinDef = getFantasySkin(p.avatar || 'cultist');
            const isGoblin = skinDef.id === 'goblin';
            const maxSh = skinDef.id === 'knight_hero' ? 120 : (p.maxShield || 100);
            if (cr.rewardType === 'shield') {
              const prevSh = p.shield || 0;
              const nextSh = Math.min(maxSh, prevSh + 50);
              const overflow = Math.max(0, prevSh + 50 - maxSh);
              p.shield = nextSh;
              if (overflow > 0) {
                p.hp = Math.min(100, (p.hp || 0) + overflow);
              }
            } else {
              p.wood = (p.wood || 0) + (isGoblin ? 30 : 20);
              p.brick = (p.brick || 0) + (isGoblin ? 23 : 15);
              p.metal = (p.metal || 0) + (isGoblin ? 15 : 10);
            }
            p.dirty = true;
          }
          broadcastJson({ type: 'crate_claimed', crateId, uid });
          break;
        }

        case 'match_control': {
          if (
            msg.action === 'start' ||
            msg.action === 'end' ||
            msg.action === 'reset' ||
            msg.action === 'lobby_open' ||
            msg.action === 'lobby_join' ||
            msg.action === 'lobby_leave' ||
            msg.action === 'config_update'
          ) {
            applyServerBattleControl({
              action: msg.action,
              state: msg.state,
              players: msg.players,
              crates: msg.crates,
              lobbyPlayer: msg.lobbyPlayer,
              config: msg.config
            });
          }
          break;
        }
      }
    });

    ws.on('close', () => {
      connectedClients.delete(ws);
    });
  });

  console.log('Battle Royale 20Hz WebSocket Relay attached at /ws/battle');
  return wss;
}
