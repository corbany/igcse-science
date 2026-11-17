import type {
  ArenaPlayer,
  ArenaStructure,
  BattleEventState,
  SupplyCrate
} from './firebaseGameService';

export type BattleTickTuple = [
  string, // 0: uid
  number, // 1: x
  number, // 2: y
  number, // 3: angle
  number, // 4: hp
  number, // 5: shield
  number, // 6: isAlive (1 | 0)
  number, // 7: kills
  string, // 8: avatar
  string, // 9: equippedWeapon
  number, // 10: highGroundActive (1 | 0)
  number, // 11: metalShieldActiveUntil
  number  // 12: frostSlowUntil
];

export interface BattleShotEvent {
  ownerId: string;
  weaponId: string;
  isAlt: boolean;
  altType?: string;
  x: number;
  y: number;
  angle: number;
  color: string;
  projectiles?: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    range: number;
    damage: number;
    color: string;
    isAlt?: boolean;
    altType?: string;
  }>;
  vfx?: any[];
}

export interface BattleDamageEvent {
  targetUid: string;
  attackerUid?: string;
  isStorm: boolean;
  damage: number;
  hp: number;
  shield: number;
  isAlive: boolean;
  killed: boolean;
  brittleGuardTriggered?: boolean;
  bricksGained?: number;
  newBrick?: number;
  killerKills?: number;
  chillMs?: number;
  frostSlowUntil?: number;
}

export interface BattleRealtimeHandlers {
  onConnectionChange?: (connected: boolean) => void;
  onWelcome?: (payload: {
    state: Partial<BattleEventState>;
    players: ArenaPlayer[];
    structures: ArenaStructure[];
    crates: SupplyCrate[];
  }) => void;
  onTick?: (tuples: BattleTickTuple[], serverTs: number) => void;
  onShot?: (shot: BattleShotEvent) => void;
  onDamage?: (dmg: BattleDamageEvent) => void;
  onStructAdd?: (structure: ArenaStructure) => void;
  onStructUpdate?: (upd: { id: string; hp: number; destroyed: boolean; attackerUid?: string }) => void;
  onCrateAdd?: (crate: SupplyCrate) => void;
  onCrateClaimed?: (payload: { crateId: string; uid: string }) => void;
  onMatchStart?: (payload: {
    state: Partial<BattleEventState>;
    players: ArenaPlayer[];
    crates: SupplyCrate[];
  }) => void;
  onMatchState?: (state: Partial<BattleEventState>) => void;
  onMatchReset?: (state: Partial<BattleEventState>) => void;
}

export class BattleRealtimeClient {
  private ws: WebSocket | null = null;
  private handlers: BattleRealtimeHandlers = {};
  private helloGetter: (() => Record<string, any>) | null = null;
  private closedByCaller = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  public isConnected = false;

  public connect(
    helloGetter: () => Record<string, any>,
    handlers: BattleRealtimeHandlers
  ) {
    this.closedByCaller = false;
    this.helloGetter = helloGetter;
    this.handlers = handlers;
    this.openSocket();
  }

  private openSocket() {
    if (this.closedByCaller || typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws/battle`;

    try {
      const sock = new WebSocket(url);
      this.ws = sock;

      sock.onopen = () => {
        if (this.closedByCaller) {
          sock.close();
          return;
        }
        this.reconnectAttempts = 0;
        this.isConnected = true;
        this.handlers.onConnectionChange?.(true);
        if (this.helloGetter) {
          this.sendRaw({ type: 'hello', ...this.helloGetter() });
        }
      };

      sock.onmessage = (evt) => {
        let msg: any;
        try {
          msg = JSON.parse(evt.data);
        } catch {
          return;
        }
        if (!msg || typeof msg.type !== 'string') return;
        switch (msg.type) {
          case 'welcome':
            this.handlers.onWelcome?.(msg);
            break;
          case 'tick':
            if (Array.isArray(msg.u)) {
              this.handlers.onTick?.(msg.u, msg.t || Date.now());
            }
            break;
          case 'shot':
            this.handlers.onShot?.(msg);
            break;
          case 'dmg':
            this.handlers.onDamage?.(msg);
            break;
          case 'struct_add':
            if (msg.structure) this.handlers.onStructAdd?.(msg.structure);
            break;
          case 'struct_upd':
            this.handlers.onStructUpdate?.(msg);
            break;
          case 'crate_add':
            if (msg.crate) this.handlers.onCrateAdd?.(msg.crate);
            break;
          case 'crate_claimed':
            this.handlers.onCrateClaimed?.(msg);
            break;
          case 'match_start':
            this.handlers.onMatchStart?.(msg);
            break;
          case 'match_state':
            if (msg.state) this.handlers.onMatchState?.(msg.state);
            break;
          case 'match_reset':
            if (msg.state) this.handlers.onMatchReset?.(msg.state);
            break;
        }
      };

      sock.onclose = () => {
        const wasConnected = this.isConnected;
        this.isConnected = false;
        this.ws = null;
        if (wasConnected) {
          this.handlers.onConnectionChange?.(false);
        }
        if (!this.closedByCaller) {
          const delay = Math.min(4000, 800 * Math.pow(1.5, this.reconnectAttempts));
          this.reconnectAttempts++;
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.openSocket();
          }, delay);
        }
      };

      sock.onerror = () => {
        // Error handler ensures clean close -> reconnect without uncaught noise
      };
    } catch {
      this.isConnected = false;
    }
  }

  public sendRaw(payload: Record<string, any>): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  public sendPosition(data: {
    x: number;
    y: number;
    angle: number;
    avatar?: string;
    equippedWeapon?: string;
    wood?: number;
    brick?: number;
    metal?: number;
    highGroundActive?: boolean;
    metalShieldActiveUntil?: number;
  }): boolean {
    return this.sendRaw({ type: 'pos', ...data });
  }

  public sendShot(shot: BattleShotEvent): boolean {
    return this.sendRaw({ type: 'shot', ...shot });
  }

  public sendHit(
    targetUid: string,
    damage: number,
    attackerUid?: string,
    isStorm: boolean = false,
    chillMs?: number
  ): boolean {
    return this.sendRaw({
      type: 'hit',
      targetUid,
      damage,
      attackerUid,
      isStorm,
      ...(chillMs && chillMs > 0 ? { chillMs } : {})
    });
  }

  public sendBuild(
    structure: ArenaStructure,
    mats: { wood?: number; brick?: number; metal?: number; metalShieldActiveUntil?: number }
  ): boolean {
    return this.sendRaw({ type: 'build', structure, ...mats });
  }

  public sendStructHit(id: string, damage: number): boolean {
    return this.sendRaw({ type: 'struct_hit', id, damage });
  }

  public sendCrateDrop(crate: SupplyCrate): boolean {
    return this.sendRaw({ type: 'crate_drop', crate });
  }

  public sendCrateClaim(crateId: string, uid: string, rewardType: 'shield' | 'materials'): boolean {
    return this.sendRaw({ type: 'crate_claim', crateId, uid, rewardType });
  }

  public sendSelfVitals(vitals: { hp?: number; shield?: number; wood?: number; brick?: number; metal?: number }): boolean {
    return this.sendRaw({ type: 'self_vitals', ...vitals });
  }

  public disconnect() {
    this.closedByCaller = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isConnected = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }
}

export async function notifyServerBattleControl(payload: {
  action: 'start' | 'end' | 'reset' | 'crate_drop';
  state?: Partial<BattleEventState>;
  players?: ArenaPlayer[];
  crates?: SupplyCrate[];
  crate?: SupplyCrate;
}): Promise<void> {
  if (typeof fetch === 'undefined') return;
  try {
    await fetch('/api/battle/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // Non-fatal if running offline
  }
}
