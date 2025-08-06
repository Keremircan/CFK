import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Global state store
export const useGlobalStore = create(
  persist(
    (set, get) => ({
      // Exam state
      exam: null,
      examLoading: false,
      currentQuestion: 0,
      examAnswers: {},
      examShowResults: false,
      examResults: null,
      examSeconds: 0,
      
      // UI state
      selectedExam: 'tyt',
      selectedSubject: 'turkce',
      selectedLevel: 'orta',
      questionCount: 10,
      
      // Actions
      setExam: (exam) => set({ exam }),
      setExamLoading: (loading) => set({ examLoading: loading }),
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      setExamAnswers: (answers) => set({ examAnswers: answers }),
      setExamShowResults: (show) => set({ examShowResults: show }),
      setExamResults: (results) => set({ examResults: results }),
      setExamSeconds: (seconds) => set({ examSeconds: seconds }),
      
      setSelectedExam: (exam) => set({ selectedExam: exam }),
      setSelectedSubject: (subject) => set({ selectedSubject: subject }),
      setSelectedLevel: (level) => set({ selectedLevel: level }),
      setQuestionCount: (count) => set({ questionCount: count }),
      
      // Reset functions
      resetExam: () => set({
        exam: null,
        examLoading: false,
        currentQuestion: 0,
        examAnswers: {},
        examShowResults: false,
        examResults: null,
        examSeconds: 0,
      }),
      
      // Clear all data
      clearAll: () => set({
        exam: null,
        examLoading: false,
        currentQuestion: 0,
        examAnswers: {},
        examShowResults: false,
        examResults: null,
        examSeconds: 0,
      }),
    }),
    {
      name: 'cfk-global-store',
      // Sadece UI state'lerini persist et
      partialize: (state) => ({
        selectedExam: state.selectedExam,
        selectedSubject: state.selectedSubject,
        selectedLevel: state.selectedLevel,
        questionCount: state.questionCount,
        exam: state.exam,
        currentQuestion: state.currentQuestion,
        examAnswers: state.examAnswers,
        examShowResults: state.examShowResults,
        examResults: state.examResults,
        examSeconds: state.examSeconds,
      }),
    }
  )
); 