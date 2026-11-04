import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Swords, 
  Play, 
  RotateCcw, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Package, 
  Radio, 
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Award,
  Lock,
  Unlock,
  LayoutDashboard,
  Crown,
  StopCircle,
  Flag,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  BattleEventConfig, 
  BattleEventState, 
  LobbyPlayer, 
  ArenaPlayer,
  subscribeToBattleConfig, 
  subscribeToBattleState, 
  subscribeToLobby, 
  subscribeToArenaPlayers,
  updateBattleConfig, 
  startBattleRoyale, 
  resetBattleEvent,
  endBattleRoyale,
  dropMidGameSupplyCrate,
  SHOP_ITEMS,
  setLobbyOpen,
  resetAllStudentsGameProfiles
} from '../services/firebaseGameService';

interface AdminBattleControlProps {
  user?: UserProfile;
  currentUser?: UserProfile;
  onEnterArena?: () => void;
  onJoinSpectate?: () => void;
  onClose?: () => void;
}

export const AdminBattleControl: React.FC<AdminBattleControlProps> = ({
  user: userProp,
  currentUser,
  onEnterArena,
  onJoinSpectate,
  onClose
}) => {
  const user = (currentUser || userProp) as UserProfile;
  const handleEnterArena = onJoinSpectate || onEnterArena;
  const [config, setConfig] = useState<BattleEventConfig | null>(null);
  const [battleState, setBattleState] = useState<BattleEventState | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [arenaPlayers, setArenaPlayers] = useState<ArenaPlayer[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingStudents, setIsResettingStudents] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedWinnerUid, setSelectedWinnerUid] = useState<string>('auto');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit schedule state
  const [editDate, setEditDate] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSeason, setEditSeason] = useState<number>(1);

  // Check authorization: must be instructor or designated admin
  const isAuthorized = user.role === 'instructor' || user.email === 'corbanb@gisboyshigh.net';

  useEffect(() => {
    const unsubConfig = subscribeToBattleConfig((cfg) => {
      setConfig(cfg);
      if (cfg.nextEventDate) {
        // Format for datetime-local input: YYYY-MM-DDTHH:mm
        try {
          const d = new Date(cfg.nextEventDate);
          const pad = (n: number) => String(n).padStart(2, '0');
          const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          setEditDate(localIso);
        } catch {
          // ignore
        }
      }
      setEditTitle(cfg.title || '');
      setEditSeason(cfg.season || 1);
    });

    const unsubState = subscribeToBattleState((st) => {
      setBattleState(st);
    });

    const unsubLobby = subscribeToLobby((pl) => {
      setLobbyPlayers(pl);
    });

    const unsubArena = subscribeToArenaPlayers((players) => {
      setArenaPlayers(players);
    });

    return () => {
      unsubConfig();
      unsubState();
      unsubLobby();
      unsubArena();
    };
  }, []);

  if (!isAuthorized) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-lg font-black text-white">Teacher Host Authorization Required</h2>
        <p className="text-xs text-slate-400">
          This control console is strictly restricted to instructor accounts ({user.email}).
        </p>
      </div>
    );
  }

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBattleConfig({
        nextEventDate: new Date(editDate).toISOString(),
        title: editTitle,
        season: Number(editSeason)
      });
      setFeedback('Tournament schedule updated successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(`Failed to update schedule: ${e.message}`);
    }
  };

  const handleStartBattle = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setFeedback('Deploying all lobby students into the live arena...');
    try {
      await startBattleRoyale();
      setFeedback('BATTLE ROYALE IS LIVE! All connected students redirected.');
      if (onEnterArena) {
        setTimeout(() => onEnterArena(), 800);
      }
    } catch (e: any) {
      setFeedback(`Error starting battle: ${e.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndMatch = async () => {
    setIsEnding(true);
    setFeedback('Terminating match and calculating final placements...');
    try {
      let chosenWinner: { uid: string; name: string; avatar: string } | null = null;
      if (selectedWinnerUid !== 'none') {
        if (selectedWinnerUid === 'auto') {
          // Top alive player
          const alive = arenaPlayers.filter(p => p.isAlive);
          const top = alive.length > 0
            ? [...alive].sort((a, b) => (b.kills * 100 + b.hp) - (a.kills * 100 + a.hp))[0]
            : [...arenaPlayers].sort((a, b) => (b.kills * 100 + b.hp) - (a.kills * 100 + a.hp))[0];
          if (top) {
            chosenWinner = { uid: top.uid, name: top.name, avatar: top.avatar };
          }
        } else {
          const found = arenaPlayers.find(p => p.uid === selectedWinnerUid);
          if (found) {
            chosenWinner = { uid: found.uid, name: found.name, avatar: found.avatar };
          }
        }
      }
      await endBattleRoyale(chosenWinner);
      setShowEndModal(false);
      setFeedback(chosenWinner 
        ? `🏆 Match ended by teacher! ${chosenWinner.name} crowned champion with Victory Royale.`
        : '🏁 Match ended by teacher without a declared winner (Draw / Practice Over).'
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (e: any) {
      setFeedback(`Error ending match: ${e.message}`);
    } finally {
      setIsEnding(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset arena and return status to LOBBY? This clears all existing structures and player HP.')) {
      return;
    }
    setIsResetting(true);
    try {
      await resetBattleEvent();
      setFeedback('Arena reset! State restored to LOBBY and map cleared.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(`Error resetting arena: ${e.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetAllStudents = async () => {
    if (!window.confirm('⚠️ WARNING: This will reset ALL student accounts to 100 Gold and the default common starter loadout (Cultist Skin, Bunsen Burner weapon, Element Shield). Instructor accounts are protected. Are you sure you want to proceed?')) {
      return;
    }
    setIsResettingStudents(true);
    try {
      const res = await resetAllStudentsGameProfiles(user?.email);
      if (res.success) {
        setFeedback(`✅ Successfully reset ${res.count} students back to common starting loadout & 100 gold!`);
      } else {
        setFeedback(`❌ Error resetting students: ${res.message}`);
      }
      setTimeout(() => setFeedback(null), 5000);
    } catch (e: any) {
      setFeedback(`Error resetting students: ${e.message}`);
    } finally {
      setIsResettingStudents(false);
    }
  };

  const handleDropCrate = async () => {
    try {
      await dropMidGameSupplyCrate();
      setFeedback('Mid-game Science Supply Crate air-dropped into arena!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(`Failed to drop crate: ${e.message}`);
    }
  };

  const handleToggleLobby = async () => {
    const nextState = !battleState?.isLobbyOpen;
    try {
      await setLobbyOpen(nextState);
      setFeedback(nextState 
        ? '🔓 Tournament Lobby is now OPEN! Students can now access the waiting room.' 
        : '🔒 Tournament Lobby is now CLOSED. Student access is locked.'
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (e: any) {
      setFeedback(`Failed to update lobby access: ${e.message}`);
    }
  };

  const readyCount = lobbyPlayers.filter(p => p.isReady).length;
  const isMatchLive = battleState?.status === 'IN_PROGRESS';
  const isLobbyOpen = Boolean(battleState?.isLobbyOpen);
  const alivePlayers = arenaPlayers.filter(p => p.isAlive);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Teacher Host Controls
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Revision Royale
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  isLobbyOpen 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isLobbyOpen ? 'Lobby: OPEN' : 'Lobby: CLOSED'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage student lobby access, tournament schedules, launch live multiplayer battles, and reset arena state.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {onEnterArena && (
              <button
                onClick={onEnterArena}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Spectate / Play Arena</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Return to Instructor Teaching Hub & Classes"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>Teaching Hub</span>
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* STUDENT LOBBY ACCESS GATE CONTROLLER */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition shadow-xl ${
        isLobbyOpen 
          ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/40 shadow-emerald-500/10'
          : 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-amber-500/40 shadow-amber-500/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isLobbyOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">Student Access Gate</span>
              <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                isLobbyOpen 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isLobbyOpen ? 'LOBBY OPEN TO STUDENTS' : 'LOBBY CLOSED TO STUDENTS'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white">
              {isLobbyOpen 
                ? 'Tournament Lobby Is OPEN' 
                : 'Tournament Lobby Is CLOSED (Students Locked Out)'}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {isLobbyOpen 
                ? 'Students can now click Royale in the navigation, enter the lobby waiting room, customize weapons and skins, and ready up.' 
                : 'Students do NOT have access to the Royale game until you determine when the lobby is open. Any student trying to access Royale will see a locked screen.'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleToggleLobby}
              className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg active:scale-95 cursor-pointer ${
                isLobbyOpen
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              {isLobbyOpen ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Close Lobby for Students</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Open Lobby for Students</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Launch & Match Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Status Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Arena Lifecycle State
          </span>
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${
              isMatchLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span className="text-lg font-black text-white font-mono">
              {battleState?.status || 'LOBBY'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isMatchLive 
              ? 'The match is currently in progress! Students are fighting and building in the arena.' 
              : 'Students are in the waiting room waiting for you to press the launch button.'}
          </p>
          {battleState?.currentWinner && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Last Winner: {battleState.currentWinner.name}</span>
            </div>
          )}

          {isMatchLive && handleEnterArena && (
            <button
              onClick={handleEnterArena}
              className="mt-3 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Enter / Spectate Arena</span>
            </button>
          )}
        </div>

        {/* Lobby Roster Counter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Waiting Students
          </span>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black font-mono text-cyan-400">
              {lobbyPlayers.length} <span className="text-xs font-normal text-slate-400">students</span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              {readyCount} Ready
            </span>
          </div>
          <p className="text-xs text-slate-400">
            All connected students in this list will spawn into the arena on match start.
          </p>
        </div>

        {/* Match Launch or End Trigger Card */}
        <div className={`border rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-3 ${
          isMatchLive
            ? 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-900 border-rose-500/50 shadow-rose-950/20'
            : 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/40'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-black tracking-wider block ${
                isMatchLive ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isMatchLive ? 'Active Match Controller' : 'Match Launch Trigger'}
              </span>
              {isMatchLive && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  {alivePlayers.length} Alive
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isMatchLive
                ? 'Match is currently LIVE! Terminate battle at any moment to declare a champion and award Victory Royale.'
                : 'Launches the match instantly and pushes all students from LOBBY into the 2D arena.'}
            </p>
          </div>

          {isMatchLive ? (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setShowEndModal(true)}
                disabled={isEnding}
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl active:scale-95 cursor-pointer bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30"
              >
                <StopCircle className="w-5 h-5 text-white" />
                <span>{isEnding ? 'Ending Match...' : 'END MATCH NOW'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartBattle}
              disabled={isStarting}
              className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl active:scale-95 cursor-pointer ${
                isStarting
                  ? 'bg-emerald-800 text-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              <Swords className="w-5 h-5 text-slate-950" />
              <span>{isStarting ? 'Launching Arena...' : 'START BATTLE ROYALE'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Arena Maintenance & Schedule Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Event Schedule Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Schedule Next Monthly Tournament
            </h2>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tournament Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="e.g. Cambridge 0653 Monthly Royale"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Event Date & Time</label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Season Number</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={editSeason}
                  onChange={e => setEditSeason(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-xs mt-2 cursor-pointer"
            >
              Update Scheduled Date
            </button>
          </form>
        </div>

        {/* Live Arena Operations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Arena Controls & Reset
              </h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use these tools during or after matches to drop extra science supply crates, restore student health, or clear demolished structures from the map.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleDropCrate}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left space-y-1 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Package className="w-4 h-4 text-cyan-400" />
                  <span>Drop Supply Crate</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Spawns a random Cambridge science question crate onto the map.
                </p>
              </button>

              <button
                onClick={handleReset}
                disabled={isResetting}
                className="p-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-left space-y-1 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Reset Arena & HP</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Restores status to LOBBY, clears structures, and resets HP.
                </p>
              </button>

              <button
                onClick={handleResetAllStudents}
                disabled={isResettingStudents}
                className="p-3 rounded-xl bg-amber-950/25 hover:bg-amber-950/45 border border-amber-500/40 text-left space-y-1 transition cursor-pointer sm:col-span-2"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <RefreshCw className={`w-4 h-4 text-amber-400 ${isResettingStudents ? 'animate-spin' : ''}`} />
                  <span>{isResettingStudents ? 'Resetting Student Loadouts...' : 'Reset All Students (100 Gold & Common Loadout)'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Resets all student accounts back to 100 Gold, starter Cultist skin, Bunsen Burner, and standard starter loadout. Instructors are protected.
                </p>
              </button>

              {isMatchLive && (
                <button
                  onClick={() => setShowEndModal(true)}
                  disabled={isEnding}
                  className="p-3 rounded-xl bg-gradient-to-r from-rose-950/40 to-red-950/40 hover:from-rose-950/60 hover:to-red-950/60 border border-rose-500/50 text-left space-y-1 transition cursor-pointer sm:col-span-2"
                >
                  <div className="flex items-center gap-2 text-xs font-black text-rose-300">
                    <StopCircle className="w-4 h-4 text-rose-400" />
                    <span>End Active Match (Crown Champion & Close)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Immediately terminates the current battle, declares a champion with Victory Royale XP, and returns students to match results.
                  </p>
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
            💡 <strong>Teacher Tip:</strong> All connected students in the lobby will automatically have their game screen switch directly into the arena the moment you click <strong>START BATTLE ROYALE</strong>.
          </div>
        </div>

      </div>

      {/* Connected Students Roster View */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected Lobby Roster ({lobbyPlayers.length})
            </h2>
          </div>
        </div>

        {lobbyPlayers.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No students currently in the lobby.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lobbyPlayers.map((p) => {
              const skin = SHOP_ITEMS.find(i => i.id === p.avatar) || SHOP_ITEMS[0];
              const wp = SHOP_ITEMS.find(i => i.id === p.equippedWeapon) || SHOP_ITEMS[6];
              return (
                <div key={p.uid} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl">{skin.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{wp.icon} {wp.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">🪵{p.wood} 🧱{p.brick} ⚙️{p.metal}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.isReady ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {p.isReady ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* END MATCH CONFIRMATION & CHAMPION SELECTION MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <StopCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">End Active Battle Royale</h3>
                  <p className="text-[11px] text-slate-400">Teacher Match Termination & Victory Crown</p>
                </div>
              </div>
              <button
                onClick={() => setShowEndModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Terminating the match will end the current session for all connected students and display the Victory Royale screen. Choose which student is crowned champion:
            </p>

            {/* Winner Selection Options */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {/* Option 1: Auto-Crown top surviving player */}
              <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                selectedWinnerUid === 'auto'
                  ? 'bg-rose-500/15 border-rose-500 text-white ring-1 ring-rose-500'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="winnerSelection"
                    checked={selectedWinnerUid === 'auto'}
                    onChange={() => setSelectedWinnerUid('auto')}
                    className="accent-rose-500"
                  />
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Auto-Crown Top Survivor</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Awards Victory Royale to highest HP / most eliminations
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                  Recommended
                </span>
              </label>

              {/* Option 2: Select specific player */}
              {arenaPlayers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                    Or Crown Specific Student:
                  </span>
                  {arenaPlayers.map(p => (
                    <label
                      key={p.uid}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition text-xs ${
                        selectedWinnerUid === p.uid
                          ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="radio"
                          name="winnerSelection"
                          checked={selectedWinnerUid === p.uid}
                          onChange={() => setSelectedWinnerUid(p.uid)}
                          className="accent-amber-500"
                        />
                        <span className="font-bold truncate">{p.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${p.isAlive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                          {p.isAlive ? `HP: ${p.hp}` : 'Eliminated'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {p.kills} elims
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Option 3: End without winner */}
              <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                selectedWinnerUid === 'none'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="winnerSelection"
                    checked={selectedWinnerUid === 'none'}
                    onChange={() => setSelectedWinnerUid('none')}
                    className="accent-slate-400"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      End Match Without Winner (Draw / Practice Session)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Terminates match without awarding Victory Royale crown
                    </div>
                  </div>
                </div>
                <Flag className="w-4 h-4 text-slate-500" />
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndMatch}
                disabled={isEnding}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black transition shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
              >
                <StopCircle className="w-4 h-4" />
                <span>{isEnding ? 'Terminating Match...' : 'Confirm & End Match'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
