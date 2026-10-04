import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { UserProfile, StudentProgress } from '../types';
import { joinClassWithCode, ClassItem, DEFAULT_CLASS_CODE } from '../services/firestoreService';

interface ClassCodeGateModalProps {
  user: UserProfile;
  progress: StudentProgress;
  onClassJoined: (classItem: ClassItem) => void;
  theme?: 'dark' | 'light';
}

export const ClassCodeGateModal: React.FC<ClassCodeGateModalProps> = ({
  user,
  progress,
  onClassJoined,
  theme = 'dark'
}) => {
  const [classCodeInput, setClassCodeInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [joinedSuccessClass, setJoinedSuccessClass] = useState<ClassItem | null>(null);

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = classCodeInput.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('Please enter a class code to join your class.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await joinClassWithCode(clean, user, progress);
      if (res.success && res.classItem) {
        setJoinedSuccessClass(res.classItem);
      } else {
        setErrorMessage(res.message || 'No active class found with that code. Please check with your instructor.');
      }
    } catch (err: any) {
      console.error('Error joining class:', err);
      setErrorMessage(err?.message || 'Failed to join class. Please try again or check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDefaultCode = () => {
    setClassCodeInput(DEFAULT_CLASS_CODE);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative max-w-lg w-full rounded-3xl border shadow-2xl p-6 sm:p-8 transition ${
        theme === 'dark' 
          ? 'bg-slate-900 border-slate-700/80 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
      }`}>
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {!joinedSuccessClass ? (
          <div className="space-y-6">
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 mb-1">
                <Users className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  First-Time Student Onboarding
                </span>
              </div>

              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Enter Your Class Code
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                Welcome, <strong className="text-emerald-400 font-semibold">{user.name}</strong>! To activate your revision hub, please enter the Class Code provided by your instructor.
              </p>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold">Notice:</span> {errorMessage}
                </div>
              </div>
            )}

            {/* Class Code Input Form */}
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Instructor Class Code</span>
                  <span className="text-[11px] text-slate-500 lowercase">e.g. SCI-XXXX</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={classCodeInput}
                    onChange={(e) => {
                      setClassCodeInput(e.target.value.toUpperCase());
                      setErrorMessage(null);
                    }}
                    placeholder="SCI-XXXX"
                    maxLength={15}
                    autoFocus
                    className={`w-full px-4 py-3.5 rounded-2xl border text-center font-mono text-lg font-black tracking-widest uppercase transition outline-none shadow-inner ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-700 text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-300 text-emerald-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                </div>
              </div>

              {/* Quick default code helper */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">Default Class Available:</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseDefaultCode}
                  className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                >
                  Use Code: {DEFAULT_CLASS_CODE}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !classCodeInput.trim()}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  loading || !classCodeInput.trim()
                    ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Joining Class & Notifying Instructor...</span>
                  </>
                ) : (
                  <>
                    <span>Join Class with Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80">
              <p className="text-[11px] text-slate-400">
                Your instructor will receive an automated email notification as soon as you join with your name and details.
              </p>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Enrollment Verified
              </span>
              <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Welcome to {joinedSuccessClass.name}!
              </h2>
              <p className="text-xs text-slate-400">
                Class Code: <span className="font-mono font-bold text-emerald-400">{joinedSuccessClass.classCode}</span>
              </p>
            </div>

            {/* Email notification confirmation pill */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Mail className="w-4 h-4" />
                <span>Instructor Notification Sent</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                An email alert has been sent to your instructor (<strong className="text-white">{joinedSuccessClass.instructorEmail || 'corbanb@gisboyshigh.net'}</strong>) confirming your enrollment into this class.
              </p>
            </div>

            <button
              onClick={() => onClassJoined(joinedSuccessClass)}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Science Hub & Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
