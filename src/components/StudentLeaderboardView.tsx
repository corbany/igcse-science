import React from 'react';
import { UserProfile, StudentProgress } from '../types';
import { StudentLeaderboard } from './StudentLeaderboard';

interface StudentLeaderboardViewProps {
  user: UserProfile;
  progress: StudentProgress;
  enrolledClassIds?: string[];
  onNavigateToLessons?: (subtopicCode?: string) => void;
  onNavigateToQuizzes?: (topicCode?: string) => void;
  onNavigateToProfile?: () => void;
}

export const StudentLeaderboardView: React.FC<StudentLeaderboardViewProps> = (props) => {
  return <StudentLeaderboard {...props} />;
};

export default StudentLeaderboardView;
