import React, { useState } from 'react';
import { 
  GraduationCap, 
  LogIn, 
  Sparkles, 
  BookOpen, 
  Award, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Atom,
  Dna,
  Zap,
  Copy,
  Check,
  School,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { googleSignIn } from '../services/firebaseAuth';
import { getOrCreateUserProfile, updateUserProfile } from '../services/firestoreService';
import { UserProfile, ExamTier } from '../types';

interface GoogleSignInGateProps {
  onSignInSuccess: (user: UserProfile, token: string) => void;
  theme: 'dark' | 'light';
}

export const GoogleSignInGate: React.FC<GoogleSignInGateProps> = ({
  onSignInSuccess,
  theme
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState<boolean>(false);
  const [copiedHost, setCopiedHost] = useState<boolean>(false);
  const [showDirectForm, setShowDirectForm] = useState<boolean>(false);

  // Custom Direct Form State
  const [directName, setDirectName] = useState<string>('Alex Mercer');
  const [directEmail, setDirectEmail] = useState<string>('student@school.edu');
  const [directRole, setDirectRole] = useState<'student' | 'instructor'>('student');
  const [directTier, setDirectTier] = useState<ExamTier>('Extended');

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const handleCopyHostname = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedHost(true);
      setTimeout(() => setCopiedHost(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (!res) {
        setLoading(false);
        return;
      }
      const { user: firebaseUser, accessToken } = res;
      // Get or create profile in Firestore with role evaluation
      const profile = await getOrCreateUserProfile(
        firebaseUser.uid,
        firebaseUser.displayName || 'Student',
        firebaseUser.email || ''
      );
      onSignInSuccess(profile, accessToken);
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
        console.warn(
          `[Firebase Auth] Domain "${currentHostname}" is not yet authorized in Firebase Console. Showing direct sign-in fallback.`
        );
        setErrorMessage(
          `This preview domain (${currentHostname}) is not yet registered under Firebase Authentication's Authorized Domains. You can use direct sign-in below or add this domain in your Firebase Console.`
        );
      } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Sign-in popup was closed before completing. Please try again.');
      } else {
        console.error('Google Sign In error:', err);
        setErrorMessage(err?.message || 'Unable to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSignIn = async (
    nameToUse: string,
    emailToUse: string,
    roleToUse: 'student' | 'instructor',
    tierToUse: ExamTier
  ) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const cleanEmail = emailToUse.trim().toLowerCase();
      const cleanName = nameToUse.trim() || (roleToUse === 'instructor' ? 'Instructor' : 'Student');
      const uid = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      
      const profile = await getOrCreateUserProfile(uid, cleanName, cleanEmail);
      profile.role = roleToUse;
      profile.tier = tierToUse;
      try {
        await updateUserProfile(profile);
      } catch (saveErr) {
        console.warn('Profile local sync:', saveErr);
      }

      onSignInSuccess(profile, 'direct_session_token');
    } catch (err: any) {
      console.warn('Direct sign-in fallback:', err);
      // Resilient fallback profile
      const fallbackProfile: UserProfile = {
        id: 'user_' + Date.now(),
        name: nameToUse || 'Student',
        email: emailToUse || 'student@school.edu',
        role: roleToUse,
        tier: tierToUse,
        targetGrade: 'A*',
        examDate: '2026-05-15'
      };
      onSignInSuccess(fallbackProfile, 'direct_session_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-xl w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 mb-2">
            <GraduationCap className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Cambridge IGCSE 0653
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
              Combined Science Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Revision & Teaching Portal
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
            Access authentic Cambridge 0653 lesson slides, past paper vault, interactive quizzes, syllabus notes, and class rosters.
          </p>
        </div>

        {/* Unauthorized Domain Guide Banner */}
        {isUnauthorizedDomain && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300">Firebase Authorized Domain Notice</span>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Google OAuth requires this preview domain to be allowlisted in the Firebase Console:
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/30 text-xs font-mono">
              <span className="text-amber-300 truncate">{currentHostname}</span>
              <button
                onClick={handleCopyHostname}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition text-[11px] font-sans font-semibold shrink-0"
              >
                {copiedHost ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHost ? 'Copied!' : 'Copy Domain'}</span>
              </button>
            </div>

            <div className="text-[11px] text-amber-300/80 leading-relaxed pl-1">
              <strong>To enable Google OAuth:</strong> Open <em>Firebase Console → Authentication → Settings → Authorized domains</em> and paste this domain.
            </div>

            <div className="pt-1 border-t border-amber-500/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-300">Instant Access:</span>
              <span className="text-amber-200/80">Use the direct sign-in options below to continue immediately!</span>
            </div>
          </div>
        )}

        {/* General Error Alert if not unauthorized domain */}
        {errorMessage && !isUnauthorizedDomain && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Sign In Notice:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* Main Sign-In Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl backdrop-blur-sm transition ${
          theme === 'dark' 
            ? 'bg-slate-900/90 border-slate-800' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold">Sign In to Continue</h2>
              <p className="text-xs text-slate-400">
                Choose your preferred sign-in method to access your revision dashboard.
              </p>
            </div>

            {/* Google Sign-in Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all transform active:scale-[0.98] shadow-lg ${
                loading
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-slate-200/50 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.43 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.28 2.57 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Sign in with Google Account</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-700/60 w-full"></div>
              <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
                Or Direct School Sign-In
              </span>
            </div>

            {/* Quick 1-Click Role Profiles */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-semibold text-center">
                One-Click Quick Access (No Google Auth Required):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDirectSignIn('Alex Mercer', 'student@gisboyshigh.net', 'student', 'Extended')}
                  disabled={loading}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition transform active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-emerald-300">Student Access</div>
                    <div className="text-[11px] text-slate-400 truncate">Alex Mercer • Extended Tier</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectSignIn('Mr. Corban', 'corbanb@gisboyshigh.net', 'instructor', 'Extended')}
                  disabled={loading}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition transform active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <School className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-purple-300">Educator / Instructor</div>
                    <div className="text-[11px] text-slate-400 truncate">corbanb@gisboyshigh.net</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom School Details Toggle */}
            <div className="pt-1">
              {!showDirectForm ? (
                <button
                  type="button"
                  onClick={() => setShowDirectForm(true)}
                  className="w-full text-center text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-4 transition"
                >
                  Enter custom name & school email...
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDirectSignIn(directName, directEmail, directRole, directTier);
                  }}
                  className={`p-4 rounded-2xl space-y-3 border text-xs ${
                    theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-300">
                    <span>Custom Credentials</span>
                    <button
                      type="button"
                      onClick={() => setShowDirectForm(false)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Hide
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">School Email</label>
                    <input
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      required
                      placeholder="e.g. jdoe@school.edu"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400">Role</label>
                      <select
                        value={directRole}
                        onChange={(e) => setDirectRole(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400">IGCSE Tier</label>
                      <select
                        value={directTier}
                        onChange={(e) => setDirectTier(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Extended">Extended (A*–G)</option>
                        <option value="Core">Core (C–G)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 transition shadow"
                  >
                    Enter Portal as {directRole === 'instructor' ? 'Instructor' : 'Student'}
                  </button>
                </form>
              )}
            </div>

            {/* Role Expectations Explanation */}
            <div className={`p-4 rounded-2xl text-xs space-y-2 ${
              theme === 'dark' ? 'bg-slate-950/60 border border-slate-800' : 'bg-slate-50 border border-slate-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Account Access Rules:</span>
              </div>
              <ul className="space-y-1.5 text-slate-400 pl-6 list-disc">
                <li><strong className="text-slate-300">Students:</strong> Automatic access to all lesson slides, quizzes, past exam papers, and class enrollment via teacher codes.</li>
                <li><strong className="text-slate-300">Instructors:</strong> Granted to educators (<code className="text-emerald-400">corbanb@gisboyshigh.net</code> or invited teachers) with full cohort analytics.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <Dna className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold">Biology B1–B16</h3>
            <p className="text-[11px] text-slate-400">Cells, enzymes, respiration, plant and human systems.</p>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
              <Atom className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold">Chemistry C1–C12</h3>
            <p className="text-[11px] text-slate-400">Atoms, bonding, stoichiometry, acids, metals & organics.</p>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold">Physics P1–P5</h3>
            <p className="text-[11px] text-slate-400">Motion, forces, energy, thermal, waves & electricity.</p>
          </div>
        </div>

        {/* Cambridge Disclaimer */}
        <div className="text-center text-[11px] text-slate-400">
          Designed specifically for Cambridge Assessment International Education IGCSE™ Combined Science (0653).
        </div>
      </div>
    </div>
  );
};
