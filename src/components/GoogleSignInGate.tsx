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
  ExternalLink
} from 'lucide-react';
import { googleSignIn } from '../services/firebaseAuth';
import { getOrCreateUserProfile } from '../services/firestoreService';
import { UserProfile } from '../types';

interface GoogleSignInGateProps {
  onSignInSuccess: (user: UserProfile, token: string) => void;
  theme: 'dark' | 'light';
  noticeMessage?: string | null;
}

export const GoogleSignInGate: React.FC<GoogleSignInGateProps> = ({
  onSignInSuccess,
  theme,
  noticeMessage
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState<boolean>(false);
  const [copiedHost, setCopiedHost] = useState<boolean>(false);

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
          `[Firebase Auth] Domain "${currentHostname}" is not yet authorized in Firebase Console.`
        );
        setErrorMessage(
          `This preview domain (${currentHostname}) is not yet registered under Firebase Authentication's Authorized Domains. Please add this domain to your Firebase Console under Authentication > Settings > Authorized Domains.`
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 bg-[#FDFBF7] text-slate-800 font-sans">
      <div className="relative max-w-xl w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-[#EBF3F5] text-slate-800 border border-slate-300 mb-2">
            <GraduationCap className="w-9 h-9" />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded bg-white text-slate-800 border border-slate-300">
              Cambridge IGCSE 0653
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded bg-[#EBF3F5] text-slate-800 border border-slate-300">
              Combined Science Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Revision & Teaching Portal
          </h1>

          <p className="text-base text-slate-600 max-w-md mx-auto">
            Authentic Cambridge 0653 lesson slides, past paper vault, interactive quizzes, and class progress.
          </p>
        </div>

        {/* Unauthorized Domain Guide Banner */}
        {isUnauthorizedDomain && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#EBF3F5] border border-slate-300 text-slate-800 text-sm space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-slate-800">Firebase Authorized Domain Notice</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Google OAuth requires this preview domain to be allowlisted in the Firebase Console:
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-300 text-xs font-mono">
              <span className="text-slate-800 truncate">{currentHostname}</span>
              <button
                onClick={handleCopyHostname}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition text-xs font-sans font-bold shrink-0 border border-slate-300"
              >
                {copiedHost ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHost ? 'Copied' : 'Copy Domain'}</span>
              </button>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errorMessage && !isUnauthorizedDomain && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Sign In Notice:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* Informational Notice */}
        {noticeMessage && !errorMessage && (
          <div className="p-4 rounded-xl bg-[#EBF3F5] border border-slate-300 text-slate-800 text-sm flex items-start gap-3 leading-relaxed">
            <AlertCircle className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-slate-800">Notice:</span> {noticeMessage}
            </div>
          </div>
        )}

        {/* Main Sign-In Card */}
        <div className="p-6 sm:p-8 rounded-xl border border-slate-200 bg-white shadow-xs text-slate-800 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Sign In to Continue</h2>
            <p className="text-sm text-slate-600">
              Sign in with your Google account to access your revision dashboard and class tasks.
            </p>
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-bold text-base transition border cursor-pointer ${
              loading
                ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-wait'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-black shadow-xs'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
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
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Account Access Bullet Points */}
          <div className="p-4 rounded-lg bg-[#FDFBF7] border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block">Account Access Information:</span>
            <ul className="space-y-1 text-slate-700 pl-4 list-disc">
              <li><strong>Students:</strong> Access all lesson slide decks, quizzes, past exam papers, and class tasks via teacher codes.</li>
              <li><strong>Instructors:</strong> Educators receive full cohort tracking and homework management tools.</li>
            </ul>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
            <BookOpen className="w-5 h-5 mx-auto text-slate-700" />
            <h3 className="font-bold text-sm text-slate-800">Lesson Slides</h3>
            <p className="text-xs text-slate-600">Cambridge syllabus slide decks</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
            <Award className="w-5 h-5 mx-auto text-slate-700" />
            <h3 className="font-bold text-sm text-slate-800">Practice Quizzes</h3>
            <p className="text-xs text-slate-600">10-question knowledge checks</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
            <Users className="w-5 h-5 mx-auto text-slate-700" />
            <h3 className="font-bold text-sm text-slate-800">Class Progress</h3>
            <p className="text-xs text-slate-600">Teacher task tracking</p>
          </div>
        </div>

        {/* Cambridge Disclaimer */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Designed specifically for Cambridge Assessment International Education IGCSE™ Combined Science (0653).
        </div>
      </div>
    </div>
  );
};
