import { FileText, Brain, GraduationCap, Trophy, MessageSquare } from 'lucide-react';

/* =========================
   Stats Cards Data
========================= */
export const STATS_DATA = [
  {
    label: 'Documents Uploaded',
    value: '24',
    trend: 12,
    icon: <FileText size={20} />,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    label: 'Flashcards Created',
    value: '156',
    trend: 8,
    icon: <Brain size={20} />,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Quizzes Completed',
    value: '32',
    trend: 15,
    icon: <GraduationCap size={20} />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Average Quiz Score',
    value: '87%',
    trend: 5,
    icon: <Trophy size={20} />,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

/* =========================
   Recent Activity Data
========================= */
export const ACTIVITY_DATA = [
  {
    id: '1',
    type: 'upload',
    title: 'Uploaded new document',
    description: 'Biology Chapter 5 • 2 hours ago',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'quiz',
    title: 'Completed quiz',
    description: 'Physics: Thermodynamics • 4 hours ago',
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    type: 'flashcard',
    title: 'Created 12 flashcards',
    description: 'History: World War II • Yesterday',
    timestamp: 'Yesterday',
  },
  {
    id: '4',
    type: 'chat',
    title: 'Chat session',
    description: 'Mathematics: Calculus • Yesterday',
    timestamp: 'Yesterday',
  },
];

/* =========================
   Study Chart Data
========================= */
export const STUDY_CHART_DATA = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.1 },
  { day: 'Fri', hours: 2.9 },
  { day: 'Sat', hours: 5.2 },
  { day: 'Sun', hours: 3.5 },
];
