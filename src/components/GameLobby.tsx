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
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-left">
      
      {/* 1. SCHEDULED EVENT COUNTDOWN BANNER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-7 shadow-xs relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#EBF3F5] text-slate-800 border border-teal-300 flex items-center gap-1.5 shadow-xs">
                <Radio className="w-3.5 h-3.5 text-teal-700" />
                <span>Season {config?.season || 1} Tournament</span>
              </span>
              <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Next Event: {config?.nextEventDate ? new Date(config.nextEventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled Soon'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{config?.title || 'Monthly Cambridge 0653 Revision Royale'}</span>
              <span className="text-2xl">🏆</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {config?.description || 'Build barriers, answer science supply drops, and outsmart the shrinking storm with your classmates!'}
            </p>
          </div>

          {/* Countdown Clock Digit Boxes */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#FDFBF7] p-3 sm:p-4 rounded-xl border border-slate-300 shadow-xs self-start lg:self-auto">
            {/* Days */}
            <div className="text-center min-w-[50px] sm:min-w-[60px]">
              <div className="font-mono font-bold text-xl sm:text-2xl text-slate-900 bg-white border border-slate-300 rounded-lg py-1.5">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mt-1 block">Days</span>
            </div>
            <span className="font-mono font-bold text-slate-400 text-xl -mt-4">:</span>

            {/* Hours */}
            <div className="text-center min-w-[50px] sm:min-w-[60px]">
              <div className="font-mono font-bold text-xl sm:text-2xl text-slate-900 bg-white border border-slate-300 rounded-lg py-1.5">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mt-1 block">Hours</span>
            </div>
            <span className="font-mono font-bold text-slate-400 text-xl -mt-4">:</span>

            {/* Minutes */}
            <div className="text-center min-w-[50px] sm:min-w-[60px]">
              <div className="font-mono font-bold text-xl sm:text-2xl text-slate-900 bg-white border border-slate-300 rounded-lg py-1.5">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mt-1 block">Mins</span>
            </div>
            <span className="font-mono font-bold text-slate-400 text-xl -mt-4">:</span>

            {/* Seconds */}
            <div className="text-center min-w-[50px] sm:min-w-[60px]">
              <div className="font-mono font-bold text-xl sm:text-2xl text-amber-700 bg-white border border-slate-300 rounded-lg py-1.5">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mt-1 block">Secs</span>
            </div>
          </div>
        </div>

        {/* Pulsing Teacher Status Banner */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {battleState?.status === 'IN_PROGRESS' 
                ? 'Battle is live! Redirecting players into the arena...' 
                : 'Waiting for Teacher to Start the Battle...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenShop}
              className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-black font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Customize Loadout</span>
            </button>
            <button
              onClick={onBackToStudy}
              className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold transition"
            >
              Back to Study
            </button>
          </div>
        </div>
      </div>

      {/* 2. STUDENT WAITING ROOM & ROSTER */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        
        {/* Lobby Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Student Waiting Room
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-300">
                  {lobbyPlayers.length} Connected
                </span>
              </div>
              <p className="text-xs text-slate-600">
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-emerald-700 shadow-xs transition cursor-pointer"
              >
                <Swords className="w-4 h-4 text-white" />
                <span>Join Lobby</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleToggleReady}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                    isReady
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700 border border-amber-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isReady ? 'Ready for Battle!' : 'Click to Ready Up'}</span>
                </button>

                <button
                  onClick={handleLeave}
                  className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-black transition cursor-pointer"
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
          <div className="bg-[#FDFBF7] border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{equippedSkin.icon}</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">Your Battle Loadout</span>
                <span className="font-bold text-slate-900 text-sm">{user.name} ({equippedSkin.name})</span>
                <span className="text-xs text-amber-800 ml-2 font-mono font-bold">[{equippedWeapon.icon} {equippedWeapon.name}]</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold mr-1">Materials:</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900">
                🪵 {gameProfile?.wood || 20}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-50 border border-orange-300 text-orange-900">
                🧱 {gameProfile?.brick || 10}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                ⚙️ {gameProfile?.metal || 5}
              </span>
            </div>
          </div>
        )}

        {/* Connected Students Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold uppercase tracking-wider">Connected Classmates</span>
            <span className="font-semibold">{lobbyPlayers.filter(p => p.isReady).length} / {lobbyPlayers.length} Ready</span>
          </div>

          {lobbyPlayers.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-300 rounded-xl space-y-3 bg-[#FDFBF7]">
              <span className="text-4xl block">⏳</span>
              <p className="text-sm font-bold text-slate-800">No students in the lobby yet</p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
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
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                      isMe 
                        ? 'bg-[#EBF3F5] border-2 border-teal-400 shadow-xs' 
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                        <span role="img" aria-label="avatar">{skin.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {player.name}
                          </span>
                          {isMe && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate font-medium">
                          {weapon.icon} {weapon.name}
                        </p>
                        {/* Materials preview */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-600 font-mono mt-0.5 font-semibold">
                          <span>🪵{player.wood ?? 20}</span>
                          <span>🧱{player.brick ?? 10}</span>
                          <span>⚙️{player.metal ?? 5}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {player.isReady ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-semibold">
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
