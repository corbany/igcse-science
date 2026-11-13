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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-left">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Teacher Host Controls
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                  Revision Royale
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isLobbyOpen 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {isLobbyOpen ? 'Lobby: OPEN' : 'Lobby: CLOSED'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Manage student lobby access, tournament schedules, launch live multiplayer battles, and reset arena state.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {handleEnterArena && (
              <button
                onClick={handleEnterArena}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-black text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Test Game Arena & Map</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Return to Instructor Teaching Hub & Classes"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-700" />
                <span>Teaching Hub</span>
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-[#EBF3F5] border border-teal-300 text-slate-800 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* STUDENT LOBBY ACCESS GATE CONTROLLER */}
      <div className={`p-5 sm:p-6 rounded-2xl border shadow-xs transition ${
        isLobbyOpen 
          ? 'bg-emerald-50/60 border-emerald-300'
          : 'bg-amber-50/60 border-amber-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isLobbyOpen ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Student Access Gate</span>
              <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                isLobbyOpen 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {isLobbyOpen ? 'LOBBY OPEN TO STUDENTS' : 'LOBBY CLOSED TO STUDENTS'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isLobbyOpen 
                ? 'Tournament Lobby Is OPEN' 
                : 'Tournament Lobby Is CLOSED (Students Locked Out)'}
            </h2>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              {isLobbyOpen 
                ? 'Students can now click Royale in the navigation, enter the lobby waiting room, customize weapons and skins, and ready up.' 
                : 'Students do NOT have access to the Royale game until you determine when the lobby is open. Any student trying to access Royale will see a locked screen.'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleToggleLobby}
              className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-xs cursor-pointer border-2 border-black ${
                isLobbyOpen
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
            Arena Lifecycle State
          </span>
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${
              isMatchLive ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
            <span className="text-lg font-bold text-slate-900 font-mono">
              {battleState?.status || 'LOBBY'}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {isMatchLive 
              ? 'The match is currently in progress! Students are fighting and building in the arena.' 
              : 'Students are in the waiting room waiting for you to press the launch button.'}
          </p>
          {battleState?.currentWinner && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Last Winner: {battleState.currentWinner.name}</span>
            </div>
          )}

          {isMatchLive && handleEnterArena && (
            <button
              onClick={handleEnterArena}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer border border-black"
            >
              <Eye className="w-4 h-4" />
              <span>Enter / Spectate Arena</span>
            </button>
          )}
        </div>

        {/* Lobby Roster Counter */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
            Waiting Students
          </span>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {lobbyPlayers.length} <span className="text-xs font-normal text-slate-600">students</span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#EBF3F5] border border-teal-300 text-slate-800">
              {readyCount} Ready
            </span>
          </div>
          <p className="text-xs text-slate-600">
            All connected students in this list will spawn into the arena on match start.
          </p>
        </div>

        {/* Match Launch or End Trigger Card */}
        <div className={`border rounded-2xl p-5 flex flex-col justify-between shadow-xs space-y-3 bg-white ${
          isMatchLive ? 'border-rose-300' : 'border-[#E2E8F0]'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                isMatchLive ? 'text-rose-700' : 'text-slate-700'
              }`}>
                {isMatchLive ? 'Active Match Controller' : 'Match Launch Trigger'}
              </span>
              {isMatchLive && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  {alivePlayers.length} Alive
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {isMatchLive
                ? 'Match is currently live. Terminate battle at any moment to declare a champion and award Victory Royale.'
                : 'Launches the match instantly and pushes all students from the lobby into the 2D arena.'}
            </p>
          </div>

          {isMatchLive ? (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setShowEndModal(true)}
                disabled={isEnding}
                className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs cursor-pointer bg-rose-600 hover:bg-rose-700 text-white border-2 border-black"
              >
                <StopCircle className="w-5 h-5 text-white" />
                <span>{isEnding ? 'Ending Match...' : 'End Match Now'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartBattle}
              disabled={isStarting}
              className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs cursor-pointer border-2 border-black ${
                isStarting
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Swords className="w-5 h-5 text-white" />
              <span>{isStarting ? 'Launching Arena...' : 'Start Battle Royale'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Arena Maintenance & Schedule Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Event Schedule Editor */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <Calendar className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Schedule Next Monthly Tournament
            </h2>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tournament Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-slate-900 font-medium focus:outline-hidden"
                placeholder="e.g. Cambridge 0653 Monthly Royale"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Event Date and Time</label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-slate-900 font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Season Number</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={editSeason}
                  onChange={e => setEditSeason(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border-2 border-black rounded-xl text-slate-900 font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs mt-2 cursor-pointer border border-black"
            >
              Update Scheduled Date
            </button>
          </form>
        </div>

        {/* Live Arena Operations */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Live Arena Controls and Reset
              </h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Use these tools during or after matches to drop extra science supply crates, restore student health, or clear demolished structures from the map.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleDropCrate}
                className="p-3 rounded-xl bg-[#FDFBF7] hover:bg-slate-50 border border-black text-left space-y-1 transition cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>Drop Supply Crate</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Spawns a random Cambridge science question crate onto the map.
                </p>
              </button>

              <button
                onClick={handleReset}
                disabled={isResetting}
                className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-left space-y-1 transition cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Reset Arena and HP</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Restores status to LOBBY, clears structures, and resets HP.
                </p>
              </button>

              <button
                onClick={handleResetAllStudents}
                disabled={isResettingStudents}
                className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left space-y-1 transition cursor-pointer sm:col-span-2 shadow-xs"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <RefreshCw className={`w-4 h-4 text-amber-700 ${isResettingStudents ? 'animate-spin' : ''}`} />
                  <span>{isResettingStudents ? 'Resetting Student Loadouts...' : 'Reset All Students (100 Gold & Starter Loadout)'}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Resets all student accounts back to 100 Gold, starter skin, Bunsen Burner, and standard starter loadout. Instructors are protected.
                </p>
              </button>

              {isMatchLive && (
                <button
                  onClick={() => setShowEndModal(true)}
                  disabled={isEnding}
                  className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-2 border-black text-left space-y-1 transition cursor-pointer sm:col-span-2 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <StopCircle className="w-4 h-4 text-white" />
                    <span>End Active Match (Crown Champion & Close)</span>
                  </div>
                  <p className="text-[11px] text-rose-100">
                    Immediately terminates the current battle, declares a champion with Victory Royale XP, and returns students to match results.
                  </p>
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FDFBF7] border border-slate-300 text-[11px] text-slate-700">
            <strong>Teacher Tip:</strong> All connected students in the lobby will automatically have their game screen switch directly into the arena the moment you click <strong>Start Battle Royale</strong>.
          </div>
        </div>

      </div>

      {/* Connected Students Roster View */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Connected Lobby Roster ({lobbyPlayers.length})
            </h2>
          </div>
        </div>

        {lobbyPlayers.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No students currently in the lobby.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lobbyPlayers.map((p) => {
              const skin = SHOP_ITEMS.find(i => i.id === p.avatar) || SHOP_ITEMS[0];
              const wp = SHOP_ITEMS.find(i => i.id === p.equippedWeapon) || SHOP_ITEMS[6];
              return (
                <div key={p.uid} className="p-3 rounded-xl bg-[#FDFBF7] border border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl">{skin.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-600 truncate">{wp.icon} {wp.name}</div>
                      <div className="text-[10px] text-slate-600 font-mono font-semibold">🪵{p.wood} 🧱{p.brick} ⚙️{p.metal}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.isReady ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <StopCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">End Active Battle Royale</h3>
                  <p className="text-[11px] text-slate-600 font-medium">Teacher Match Termination and Victory Crown</p>
                </div>
              </div>
              <button
                onClick={() => setShowEndModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Terminating the match will end the current session for all connected students and display the Victory Royale screen. Choose which student is crowned champion:
            </p>

            {/* Winner Selection Options */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {/* Option 1: Auto-Crown top surviving player */}
              <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                selectedWinnerUid === 'auto'
                  ? 'bg-rose-50 border-2 border-rose-600 text-slate-900'
                  : 'bg-[#FDFBF7] border border-slate-300 text-slate-800 hover:border-black'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="winnerSelection"
                    checked={selectedWinnerUid === 'auto'}
                    onChange={() => setSelectedWinnerUid('auto')}
                    className="accent-rose-600"
                  />
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span>Auto-Crown Top Survivor</span>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Awards Victory Royale to highest HP / most eliminations
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 font-bold">
                  Recommended
                </span>
              </label>

              {/* Option 2: Select specific player */}
              {arenaPlayers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block px-1">
                    Or Crown Specific Student:
                  </span>
                  {arenaPlayers.map(p => (
                    <label
                      key={p.uid}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition text-xs ${
                        selectedWinnerUid === p.uid
                          ? 'bg-amber-50 border-2 border-amber-600 text-slate-900'
                          : 'bg-[#FDFBF7] border border-slate-300 text-slate-800 hover:border-black'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="radio"
                          name="winnerSelection"
                          checked={selectedWinnerUid === p.uid}
                          onChange={() => setSelectedWinnerUid(p.uid)}
                          className="accent-amber-600"
                        />
                        <span className="font-bold truncate">{p.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${p.isAlive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                          {p.isAlive ? `HP: ${p.hp}` : 'Eliminated'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono shrink-0">
                        {p.kills} elims
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Option 3: End without winner */}
              <label className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                selectedWinnerUid === 'none'
                  ? 'bg-slate-100 border-2 border-black text-slate-900'
                  : 'bg-[#FDFBF7] border border-slate-300 text-slate-700 hover:border-black'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="winnerSelection"
                    checked={selectedWinnerUid === 'none'}
                    onChange={() => setSelectedWinnerUid('none')}
                    className="accent-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      End Match Without Winner (Draw / Practice Session)
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Terminates match without awarding Victory Royale crown
                    </div>
                  </div>
                </div>
                <Flag className="w-4 h-4 text-slate-600" />
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndMatch}
                disabled={isEnding}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer border border-black"
              >
                <StopCircle className="w-4 h-4" />
                <span>{isEnding ? 'Terminating Match...' : 'Confirm and End Match'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
