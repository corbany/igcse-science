export type ScienceSubject = 'biology' | 'chemistry' | 'physics';

export type ExamTier = 'Core' | 'Extended';

export type UserRole = 'student' | 'instructor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier: ExamTier;
  examDate?: string;
  dailyStudyMinutes?: number;
  targetGrade?: string;
}

export interface SlideItem {
  id: string;
  title: string;
  type: 'starter' | 'theory' | 'experiment' | 'task' | 'plenary' | 'summary';
  bullets?: string[];
  keywords?: string[];
  diagramPrompt?: string;
  methodSteps?: string[];
  riskAssessment?: { hazard: string; risk: string; precaution: string }[];
  taskQuestion?: string;
  wordBank?: string[];
  revealedAnswer?: string;
  practicalTip?: string;
}

export interface SlideDeckItem {
  id: string;
  title: string;
  deckType?: 'Theory' | 'Practical' | 'Planning' | 'Calculations' | 'Revision';
  googleSlidesUrl: string;
  googleSlidesEmbedUrl: string;
  isCustomUrl?: boolean;
  slides?: SlideItem[];
  keyTakeaways?: string[];
}

export interface LessonSlideDeck {
  id: string;
  topicCode: string; // e.g. B1, B2, C1, P1
  subtopicCode: string; // e.g. B2.1
  title: string;
  subject: ScienceSubject;
  tier: 'Core' | 'Supplement' | 'Core & Supplement';
  durationMinutes: number;
  googleSlidesUrl: string; // Direct Google Slides URL or ID
  googleSlidesEmbedUrl: string; // Formatted embed URL for iframe
  isCustomUrl?: boolean;
  slideDecks?: SlideDeckItem[]; // Multiple slide decks for subtopic
  slides?: SlideItem[];
  keyTakeaways?: string[];
}

export interface SyllabusItem {
  id: string;
  code: string; // e.g. B1, B2.1
  subject: ScienceSubject;
  title: string;
  coreObjectives: string[];
  supplementObjectives?: string[];
  essentialKeywords: string[];
  suggestedPracticals?: string[];
  commonMisconceptions?: string[];
}

export interface PastExamPaper {
  id: string;
  code: string; // e.g. '0653/41', '0653/61', '0653/21'
  title: string;
  series: string; // e.g. 'May/June 2026', 'October/November 2025', 'Specimen 2025'
  paperNumber: 'Paper 1' | 'Paper 2' | 'Paper 3' | 'Paper 4' | 'Paper 5' | 'Paper 6';
  tier: 'Core' | 'Extended' | 'Practical' | 'Alternative to Practical';
  duration: string;
  totalMarks: number;
  description: string;
  paperType?: 'theory' | 'alternative-to-practical' | 'multiple-choice' | 'example-candidate';
  questions: ExamQuestionItem[];
  examinerNotes?: string[];
  hasQualitativeAnalysisNotes?: boolean;
  gradeBoundaries?: {
    aStar?: number;
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
    f?: number;
    g?: number;
  };
}

export interface ExamQuestionItem {
  id: string;
  number: number;
  subPart?: string; // e.g. '(a)(i)', '(b)', etc.
  subParts?: any[];
  fullLabel?: string; // e.g. '1(a)(i)'
  questionText: string;
  questionType?: 'mcq' | 'written' | 'calculation' | 'diagram' | 'plan' | 'fill-gap' | 'structured' | 'practical';
  options?: { key: string; text: string }[];
  correctAnswer: string;
  marks: number;
  explanation: string;
  markSchemeBreakdown?: string[];
  guidanceNotes?: string[];
  examinerComment?: string;
  subject: ScienceSubject;
  syllabusCode: string;
  diagramSvg?: string;
  diagramCaption?: string;
  figureScreenshotUrl?: string; // Exact screenshot of the figure from the exam paper PDF
  figureCaption?: string; // e.g. "Fig. 1.1", "Fig. 2.1", "Fig. 4.2"
  figurePageNumber?: number; // Page in original question paper
  figurePromptDescription?: string;
  answerLinesCount?: number;
  inputPlaceholder?: string;
  exampleCandidateResponse?: {
    candidateAnswer: string;
    marksAwarded: number;
    examinerComment: string;
  };
}

export interface ExamAnswerAnalysis {
  questionId: string;
  marksAwarded: number;
  maxMarks: number;
  percentage: number;
  markBreakdown: {
    point: string;
    awarded: boolean;
    reason: string;
  }[];
  examinerFeedback: string;
  guidanceFollowed: string[];
  modelAnswer: string;
  keyTermsUsed: string[];
  keyTermsMissing: string[];
}

export interface QuizQuestion {
  id: string;
  subject: ScienceSubject;
  topicCode: string;
  topicTitle?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  syllabusRef: string;
}

export type TrafficLightStatus = 'red' | 'orange' | 'green';

export interface SubtopicQuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  date: string;
}

export interface StudentProgress {
  topicConfidence: Record<string, number>; // 1-5
  trafficLights: Record<string, TrafficLightStatus>; // subtopicCode -> red | orange | green
  subtopicQuizScores: Record<string, SubtopicQuizResult>; // subtopicCode -> quiz result
  completedLessons: string[]; // lesson ids
  quizScores: Record<string, { score: number; total: number; date: string }>;
  savedNotes: Record<string, string>; // syllabus code -> note content
  flaggedQuestions?: string[];
  lastActive?: string;
}

export interface ClassStudentData {
  id: string;
  name: string;
  email: string;
  tier: ExamTier;
  overallProgress: number; // 0 - 100
  biologyScore: number;
  chemistryScore: number;
  physicsScore: number;
  weakTopics: string[];
  lastActive: string;
}

export interface RevisionScheduleItem {
  id?: string;
  day?: string;
  date?: string;
  week?: number;
  theme?: string;
  subject?: string;
  topicCode?: string;
  topicTitle?: string;
  focusTopics?: string[];
  goals?: string[];
  tasks?: string[];
  estimatedMinutes?: number;
  completed?: boolean;
  dailyTasks?: {
    day: string;
    subject: string;
    task: string;
  }[];
}

export interface RevisionScheduleResponse {
  summary: string;
  weeklyPlan: RevisionScheduleItem[];
  examTips: string[];
}

export interface AIRecommendation {
  id?: string;
  topicCode?: string;
  topicTitle?: string;
  priority?: 'high' | 'medium' | 'low';
  reason?: string;
  suggestedAction?: string;
  actionLink?: string;
  studentStatus?: string;
  criticalWeaknesses?: string[];
  recommendedActionPlan?: {
    priority: 'High' | 'Medium' | 'Low';
    topicCode: string;
    topicName: string;
    recommendedSlides: string;
    actionStep: string;
    keyFormulaOrRule: string;
  }[];
  motivationalAdvice?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// -------------------------------------------------------------
// CLASS TASKS & ASSIGNMENTS
// -------------------------------------------------------------
export type TaskType = 'both' | 'slides_traffic_light' | 'practice_quiz' | 'exam_paper' | 'custom';
export type TaskProgressStatus = 'not_started' | 'incomplete' | 'completed';

export interface ClassTask {
  id: string;
  classId: string; // class ID or 'all'
  className: string;
  title: string;
  description: string;
  type: TaskType;
  targetSubtopics: string[]; // e.g. ['B1.1', 'C2.3']
  targetSubject: ScienceSubject | 'all';
  targetStudentIds?: string[]; // optional array of specific student UIDs; if empty/omitted, whole class
  dueDate: string; // ISO date string (e.g. 2026-10-10T23:59:59Z)
  instructorId: string;
  instructorName: string;
  createdAt: string;
}

export interface TaskSubmission {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: TaskProgressStatus;
  completedAt?: string;
  lastActivityAt?: string;
  quizScore?: number;
  trafficLight?: TrafficLightStatus;
  slidesCompleted?: boolean;
  quizCompleted?: boolean;
  notes?: string;
}

export interface TaskWithSubmission extends ClassTask {
  submission?: TaskSubmission;
  isOverdue?: boolean;
}
