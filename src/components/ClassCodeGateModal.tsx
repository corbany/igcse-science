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
  BookOpen,
  LogOut
} from 'lucide-react';
import { UserProfile, StudentProgress } from '../types';
import { joinClassWithCode, ClassItem } from '../services/firestoreService';

interface ClassCodeGateModalProps {
  user: UserProfile;
  progress: StudentProgress;
  onClassJoined: (classItem: ClassItem) => void;
  onSignOut?: () => void;
  theme?: 'dark' | 'light';
}

export const ClassCodeGateModal: React.FC<ClassCodeGateModalProps> = ({
  user,
  progress,
  onClassJoined,
  onSignOut,
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

    if (clean === 'SCI-0653' || clean === '0653') {
      setErrorMessage('The default class code SCI-0653 has been discontinued. Please enter an active class code created by your instructor.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="relative max-w-lg w-full rounded-xl border border-slate-300 bg-white shadow-md p-6 sm:p-8 text-slate-800 space-y-6">
        {!joinedSuccessClass ? (
          <div className="space-y-6">
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-[#EBF3F5] text-slate-800 border border-slate-300 mb-1">
                <Users className="w-8 h-8" />
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-white text-slate-700 border border-slate-300">
                  Student Class Enrollment
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Enter Your Class Code
              </h2>

              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Welcome, <strong>{user.name}</strong>. Enter the Class Code provided by your teacher to access assignments and lesson slides.
              </p>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold">Notice:</span> {errorMessage}
                </div>
              </div>
            )}

            {/* Class Code Input Form */}
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Instructor Class Code</span>
                  <span className="text-xs text-slate-500">e.g. SCI-XXXX</span>
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-black text-center font-mono text-lg font-bold tracking-widest uppercase outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !classCodeInput.trim()}
                className={`w-full py-3 px-6 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  loading || !classCodeInput.trim()
                    ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500 border border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Joining Class...</span>
                  </>
                ) : (
                  <>
                    <span>Join Class</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-200 space-y-3">
              <p className="text-xs text-slate-600">
                Ask your science teacher for your class code (e.g. <span className="font-mono font-bold text-slate-800">SCI-WA5U</span>).
              </p>

              {onSignOut && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Wrong account?</span>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-black transition cursor-pointer px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#EBF3F5] text-slate-800 border border-slate-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-600">
                Enrollment Verified
              </span>
              <h2 className="text-2xl font-bold text-slate-800">
                Welcome to {joinedSuccessClass.name}
              </h2>
              <p className="text-sm text-slate-600">
                Class Code: <span className="font-mono font-bold text-slate-800">{joinedSuccessClass.classCode}</span>
              </p>
            </div>

            {/* Email notification confirmation pill */}
            <div className="p-3.5 rounded-lg bg-[#FDFBF7] border border-slate-300 text-left space-y-1 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Mail className="w-4 h-4" />
                <span>Instructor Notification Sent</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                An email alert has been sent to your instructor (<strong className="text-slate-800">{joinedSuccessClass.instructorEmail || 'corbanb@gisboyshigh.net'}</strong>) confirming your enrollment into this class.
              </p>
            </div>

            <button
              onClick={() => onClassJoined(joinedSuccessClass)}
              className="w-full py-3 px-6 rounded-lg font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
