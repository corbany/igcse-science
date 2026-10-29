import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Swords, 
  ShoppingBag, 
  ArrowRight, 
  Flame, 
  Radio, 
  Calendar, 
  AlertCircle,
  LogOut,
  Zap,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  BattleEventConfig, 
  BattleEventState, 
  LobbyPlayer, 
  UserGameProfile,
  subscribeToBattleConfig, 
  subscribeToBattleState, 
  subscribeToLobby, 
  subscribeToGameProfile,
  joinLobby, 
  leaveLobby, 
  setLobbyReady,
  SHOP_ITEMS 
} from '../services/firebaseGameService';

interface GameLobbyProps {
  user: UserProfile;
  onBattleStart?: () => void;
  onEnterBattle?: () => void;
  onOpenShop?: () => void;
  onBackToStudy?: () => void;
  onBack?: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  user,
  onBattleStart,
  onEnterBattle,
  onOpenShop,
  onBackToStudy,
  onBack
}) => {
  const handleBattleStart = onEnterBattle || onBattleStart || (() => {});
  const handleBackToStudy = onBack || onBackToStudy || (() => {});
  const [config, setConfig] = useState<BattleEventConfig | null>(null);
  const [battleState, setBattleState] = useState<BattleEventState | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [gameProfile, setGameProfile] = useState<UserGameProfile | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // 1. Subscribe to tournament schedule config
  useEffect(() => {
    const unsub = subscribeToBattleConfig((cfg) => {
      setConfig(cfg);
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to battle state (auto-transition when IN_PROGRESS)
  useEffect(() => {
    const unsub = subscribeToBattleState((st) => {
      setBattleState(st);
      if (st.status === 'IN_PROGRESS') {
        handleBattleStart();
      }
    });
    return () => unsub();
  }, [handleBattleStart]);

  // 3. Subscribe to lobby members
  useEffect(() => {
    const unsub = subscribeToLobby((players) => {
      setLobbyPlayers(players);
    });
    return () => unsub();
  }, []);

  // 4. Subscribe to student's own game profile
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToGameProfile(user.id, (p) => {
      setGameProfile(p);
    });
    return () => unsub();
  }, [user?.id]);

  // Live countdown timer targeting next scheduled monthly event date
  useEffect(() => {
    if (!config?.nextEventDate) return;
    
    const updateCountdown = () => {
      const targetTime = new Date(config.nextEventDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [config?.nextEventDate]);

  const isInLobby = lobbyPlayers.some(p => p.uid === user.id);
  const myLobbyEntry = lobbyPlayers.find(p => p.uid === user.id);
  const isReady = myLobbyEntry?.isReady ?? false;

  const handleJoin = async () => {
    if (!user?.id || isJoining) return;
    setIsJoining(true);
    try {
      await joinLobby({
        uid: user.id,
        name: user.name || 'Science Scholar',
        avatar: gameProfile?.avatar || 'cyber_scientist',
        equippedWeapon: gameProfile?.equippedWeapon || 'bunsen_burner',
        wood: gameProfile?.wood || 20,
        brick: gameProfile?.brick || 10,
        metal: gameProfile?.metal || 5,
        isReady: true,
        joinedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to join lobby:', e);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!user?.id) return;
    try {
      await leaveLobby(user.id);
    } catch (e) {
      console.error('Failed to leave lobby:', e);
    }
  };

  const handleToggleReady = async () => {
    if (!user?.id) return;
    try {
      await setLobbyReady(user.id, !isReady);
    } catch (e) {
      console.error('Failed to toggle ready:', e);
    }
  };

  const equippedSkin = SHOP_ITEMS.find(i => i.id === (gameProfile?.avatar || 'cyber_scientist')) || SHOP_ITEMS[0];
  const equippedWeapon = SHOP_ITEMS.find(i => i.id === (gameProfile?.equippedWeapon || 'bunsen_burner')) || SHOP_ITEMS[6];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* 1. SCHEDULED EVENT COUNTDOWN BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Neon Glow Accents */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black tracking-widest uppercase px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Season {config?.season || 1} Tournament</span>
              </span>
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Next Event: {config?.nextEventDate ? new Date(config.nextEventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled Soon'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{config?.title || 'Monthly Cambridge 0653 Revision Royale'}</span>
              <span className="text-2xl">🏆</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {config?.description || 'Build barriers, answer science supply drops, and outsmart the shrinking storm with your classmates!'}
            </p>
          </div>

          {/* Countdown Clock Digit Boxes */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-slate-800/90 shadow-xl self-start lg:self-auto">
            {/* Days */}
            <div className="text-center min-w-[50px] sm:min-w-[60px]">
              <div className="font-mono font-black text-xl sm:text-2xl text-emerald-400 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-inner">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">Days</span>
            </div>
            <span className="font-mono font-black text-slate-600 text-xl -mt-4">:</span>

            {/* Hours */}
            <div className="text-center min-w-[50px] sm:min-w-[60px]">
              <div className="font-mono font-black text-xl sm:text-2xl text-emerald-400 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-inner">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">Hours</span>
            </div>
            <span className="font-mono font-black text-slate-600 text-xl -mt-4">:</span>

            {/* Minutes */}
            <div className="text-center min-w-[50px] sm:min-w-[60px]">
              <div className="font-mono font-black text-xl sm:text-2xl text-emerald-400 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-inner">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">Mins</span>
            </div>
            <span className="font-mono font-black text-slate-600 text-xl -mt-4">:</span>

            {/* Seconds */}
            <div className="text-center min-w-[50px] sm:min-w-[60px]">
              <div className="font-mono font-black text-xl sm:text-2xl text-amber-400 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-inner animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">Secs</span>
            </div>
          </div>
        </div>

        {/* Pulsing Teacher Status Banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              {battleState?.status === 'IN_PROGRESS' 
                ? '⚡ Battle is live! Redirecting players into the arena...' 
                : 'Waiting for Teacher to Start the Battle...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenShop}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Customize Loadout</span>
            </button>
            <button
              onClick={onBackToStudy}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition"
            >
              Back to Study
            </button>
          </div>
        </div>
      </div>

      {/* 2. STUDENT WAITING ROOM & ROSTER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        
        {/* Lobby Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Student Waiting Room
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {lobbyPlayers.length} Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                All connected students will be deployed into the 2D arena simultaneously when host launches.
              </p>
            </div>
          </div>

          {/* Action buttons: Join / Leave / Ready */}
          <div className="flex items-center gap-2.5 shrink-0">
            {!isInLobby ? (
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
              >
                <Swords className="w-4 h-4 text-white" />
                <span>Join Lobby</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleToggleReady}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer ${
                    isReady
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isReady ? 'Ready for Battle!' : 'Click to Ready Up'}</span>
                </button>

                <button
                  onClick={handleLeave}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition cursor-pointer"
                  title="Leave lobby"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* My Current Loadout Preview */}
        {isInLobby && (
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{equippedSkin.icon}</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Your Battle Loadout</span>
                <span className="font-bold text-white text-sm">{user.name} ({equippedSkin.name})</span>
                <span className="text-xs text-amber-400 ml-2 font-mono">[{equippedWeapon.icon} {equippedWeapon.name}]</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Materials:</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
                🪵 {gameProfile?.wood || 20}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-950/40 border border-orange-500/30 text-orange-300">
                🧱 {gameProfile?.brick || 10}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
                ⚙️ {gameProfile?.metal || 5}
              </span>
            </div>
          </div>
        )}

        {/* Connected Students Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Connected Classmates</span>
            <span>{lobbyPlayers.filter(p => p.isReady).length} / {lobbyPlayers.length} Ready</span>
          </div>

          {lobbyPlayers.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
              <span className="text-4xl block">⏳</span>
              <p className="text-sm font-bold text-slate-300">No students in the lobby yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to step into the waiting room! Click &quot;Join Lobby&quot; above to ready your avatar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lobbyPlayers.map((player) => {
                const skin = SHOP_ITEMS.find(i => i.id === player.avatar) || SHOP_ITEMS[0];
                const weapon = SHOP_ITEMS.find(i => i.id === player.equippedWeapon) || SHOP_ITEMS[6];
                const isMe = player.uid === user.id;

                return (
                  <div
                    key={player.uid}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                      isMe 
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm' 
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                        <span role="img" aria-label="avatar">{skin.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-white truncate">
                            {player.name}
                          </span>
                          {isMe && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {weapon.icon} {weapon.name}
                        </p>
                        {/* Materials preview */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>🪵{player.wood ?? 20}</span>
                          <span>🧱{player.brick ?? 10}</span>
                          <span>⚙️{player.metal ?? 5}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {player.isReady ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
