import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Award, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  MessageSquare, 
  Search, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  Sun, 
  Moon,
  ChevronDown,
  LayoutDashboard,
  Compass,
  Users,
  LogOut
} from 'lucide-react';
import { ScienceSubject, UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedSubject: ScienceSubject | 'all';
  setSelectedSubject: (subj: ScienceSubject | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedSubject,
  setSelectedSubject,
  searchQuery,
  setSearchQuery,
  user,
  setUser,
  theme,
  onToggleTheme,
  onSignOut
}) => {
  const [showMoreTools, setShowMoreTools] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreTools(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTier = () => {
    setUser(prev => ({
      ...prev,
      tier: prev.tier === 'Extended' ? 'Core' : 'Extended'
    }));
  };

  const isStudent = user.role === 'student';
  const isExtraStudentTab = currentTab === 'schedule' || currentTab === 'recommendations' || currentTab === 'guidelines';

  return (
    <header className={`sticky top-0 z-50 border-b shadow-sm transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Top Banner with branding & role distinction */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Syllabus identifier */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setCurrentTab(isStudent ? 'lessons' : 'instructor')}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition ${
              isStudent 
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/20' 
                : 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/20'
            }`}>
              {isStudent ? (
                <GraduationCap className="w-6 h-6 text-slate-950 font-bold" />
              ) : (
                <LayoutDashboard className="w-5 h-5 text-white font-bold" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-base sm:text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  IGCSE Science 0653
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isStudent
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                }`}>
                  {isStudent ? 'Student Space' : 'Instructor Space'}
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {isStudent ? 'Interactive Slide Decks, Practice Quizzes & Class Progress' : 'Teaching Hub, Drive Sync & Class Tracking'}
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isStudent ? "Search topics, slides, or keywords (e.g. B1, B2 Cells, C2)..." : "Search topics, syllabus codes, slides..."}
                className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-sm transition focus:outline-none focus:ring-2 ${
                  isStudent ? 'focus:ring-emerald-500' : 'focus:ring-purple-500'
                } ${
                  theme === 'dark'
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-400'
                    : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${
                    theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Role Indicator / Mode Controls */}
            {isStudent ? (
              /* STUDENT: Restricted to Student Mode Only. No access to Instructor View! */
              <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold ${
                theme === 'dark' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Mode</span>
              </div>
            ) : (
              /* INSTRUCTOR: Mode switcher between Instructor Hub and Preview Student View */
              <div className={`flex items-center p-1 rounded-xl border transition ${
                theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-300'
              }`}>
                <button
                  onClick={() => setCurrentTab('instructor')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                    currentTab === 'instructor'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : theme === 'dark'
                        ? 'text-purple-300 hover:text-white'
                        : 'text-purple-700 hover:text-purple-950'
                  }`}
                  title="Full instructor dashboard with Cohort analytics and Google Drive sync"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instructor Hub</span>
                </button>

                <button
                  onClick={() => setCurrentTab('lessons')}
                  className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    currentTab !== 'instructor'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : theme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Preview student revision slides"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview Student</span>
                </button>
              </div>
            )}

            {/* Curriculum Tier button */}
            <button
              onClick={toggleTier}
              title="Toggle Core vs Extended curriculum tier"
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition hidden sm:flex items-center gap-1.5 ${
                user.tier === 'Extended' 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25' 
                  : 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-300 hover:bg-blue-500/25'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user.tier} Tier</span>
            </button>

            {/* Global Light / Dark Mode toggle */}
            <button
              onClick={onToggleTheme}
              title={`Switch entire website to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className={`text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border font-semibold transition flex items-center gap-1 shadow-xs ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline text-xs font-bold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden lg:inline text-xs font-bold">Dark</span>
                </>
              )}
            </button>

            {/* User Profile & Sign Out */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title={`Sign out (${user.email})`}
                className={`text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 shadow-xs ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/40'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-rose-600 hover:border-rose-400'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="py-2 pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search syllabus topics & slides..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className={`border-t px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between py-2 text-sm whitespace-nowrap">
          {/* Navigation Items */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* INSTRUCTOR-ONLY PROMINENT TAB */}
            {!isStudent && (
              <button
                onClick={() => setCurrentTab('instructor')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition shadow-xs ${
                  currentTab === 'instructor'
                    ? 'bg-purple-600 text-white shadow-purple-600/30'
                    : theme === 'dark'
                      ? 'bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 hover:text-white'
                      : 'bg-purple-100 border border-purple-300 text-purple-800 hover:bg-purple-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Instructor Classes & Drive Hub</span>
              </button>
            )}

            {/* Lessons / Slides Tab */}
            <button
              onClick={() => setCurrentTab('lessons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                currentTab === 'lessons'
                  ? isStudent ? 'bg-emerald-600 text-white shadow-xs' : 'bg-purple-600 text-white shadow-xs'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isStudent ? 'Lesson Slides' : 'Slides & Curriculum'}</span>
            </button>

            {/* Practice Quizzes */}
            <button
              onClick={() => setCurrentTab('quizzes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                currentTab === 'quizzes'
                  ? isStudent ? 'bg-emerald-600 text-white shadow-xs' : 'bg-purple-600 text-white shadow-xs'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Practice Quizzes</span>
            </button>

            {/* Past Papers Vault */}
            <button
              onClick={() => setCurrentTab('exams')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                currentTab === 'exams'
                  ? isStudent ? 'bg-emerald-600 text-white shadow-xs' : 'bg-purple-600 text-white shadow-xs'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Past Exam Papers</span>
            </button>

            {/* Syllabus Notebook */}
            <button
              onClick={() => setCurrentTab('notebook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                currentTab === 'notebook'
                  ? isStudent ? 'bg-emerald-600 text-white shadow-xs' : 'bg-purple-600 text-white shadow-xs'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Syllabus Notebook</span>
            </button>

            {/* Progress Tracker */}
            <button
              onClick={() => setCurrentTab('tracker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                currentTab === 'tracker'
                  ? isStudent ? 'bg-emerald-600 text-white shadow-xs' : 'bg-purple-600 text-white shadow-xs'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{isStudent ? 'My Progress' : 'Progress Tracker'}</span>
            </button>

            {/* STUDENT ONLY: My Classes Tab to Join with Code & Track Connection */}
            {isStudent && (
              <button
                onClick={() => setCurrentTab('classes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  currentTab === 'classes'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>My Classes</span>
              </button>
            )}

            {/* STUDENT MODE: Clean 'More Tools' Dropdown */}
            {isStudent ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowMoreTools(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                    isExtraStudentTab
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>
                    {currentTab === 'schedule' ? 'Revision Schedule' :
                     currentTab === 'recommendations' ? 'AI Learning Path' :
                     currentTab === 'guidelines' ? 'Exam Guidelines' : 'Study Tools'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {showMoreTools && (
                  <div className={`absolute left-0 mt-1 w-56 rounded-xl border p-1.5 shadow-xl z-50 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <button
                      onClick={() => { setCurrentTab('schedule'); setShowMoreTools(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        currentTab === 'schedule' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>AI Revision Schedule</span>
                    </button>

                    <button
                      onClick={() => { setCurrentTab('recommendations'); setShowMoreTools(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        currentTab === 'recommendations' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>AI Learning Path</span>
                    </button>

                    <button
                      onClick={() => { setCurrentTab('guidelines'); setShowMoreTools(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        currentTab === 'guidelines' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>Exam Guidelines (Core vs Ext)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* INSTRUCTOR MODE: Show all tools directly */
              <>
                <button
                  onClick={() => setCurrentTab('guidelines')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                    currentTab === 'guidelines'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Exam Guidelines</span>
                </button>

                <button
                  onClick={() => setCurrentTab('schedule')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                    currentTab === 'schedule'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Revision Schedule</span>
                </button>

                <button
                  onClick={() => setCurrentTab('recommendations')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                    currentTab === 'recommendations'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Learning Path</span>
                </button>
              </>
            )}

            {/* AI Chat Tutor */}
            <button
              onClick={() => setCurrentTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                currentTab === 'chat'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'dark'
                    ? 'text-indigo-300 hover:text-white hover:bg-indigo-900/40'
                    : 'text-indigo-700 hover:text-indigo-950 hover:bg-indigo-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Ask AI Tutor</span>
            </button>
          </div>

          {/* User Status Indicator */}
          <div className="hidden xl:flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isStudent 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            }`}>
              {isStudent ? `Student: ${user.name}` : `Educator: ${user.name}`}
            </span>
          </div>
        </div>
      </nav>

      {/* Quick Subject Switcher Sub-bar (for Lessons & Notebook views) */}
      {(currentTab === 'lessons' || currentTab === 'notebook' || currentTab === 'quizzes') && (
        <div className={`border-t px-4 sm:px-6 lg:px-8 py-2 transition-colors duration-200 ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800/60' : 'bg-white border-slate-200'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <span className={`font-medium mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Subject Filter:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  selectedSubject === 'all'
                    ? theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900 font-bold'
                    : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Subjects
              </button>
              <button
                onClick={() => setSelectedSubject('biology')}
                className={`px-2.5 py-1 rounded-full font-medium transition flex items-center gap-1.5 ${
                  selectedSubject === 'biology'
                    ? 'bg-emerald-500/25 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Biology (B1–B16)
              </button>
              <button
                onClick={() => setSelectedSubject('chemistry')}
                className={`px-2.5 py-1 rounded-full font-medium transition flex items-center gap-1.5 ${
                  selectedSubject === 'chemistry'
                    ? 'bg-sky-500/25 border border-sky-500/50 text-sky-700 dark:text-sky-300 font-semibold'
                    : 'text-sky-600 dark:text-sky-400 hover:bg-sky-500/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Chemistry (C1–C12)
              </button>
              <button
                onClick={() => setSelectedSubject('physics')}
                className={`px-2.5 py-1 rounded-full font-medium transition flex items-center gap-1.5 ${
                  selectedSubject === 'physics'
                    ? 'bg-amber-500/25 border border-amber-500/50 text-amber-700 dark:text-amber-300 font-semibold'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Physics (P1–P5)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

