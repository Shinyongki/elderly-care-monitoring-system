import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppSettings {
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  backupInterval: number; // in days
  lastBackup: Date | null;
}

interface AppState {
  settings: AppSettings;
  currentTab: string;
  isLoading: boolean;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setCurrentTab: (tab: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        theme: 'light',
        language: 'ko',
        autoSave: true,
        autoSaveInterval: 30,
        backupInterval: 7,
        lastBackup: null,
      },
      currentTab: 'dashboard',
      isLoading: false,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setCurrentTab: (tab) => set({ currentTab: tab }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'monitoring-app-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

interface SurveyFormState {
  currentSection: number;
  formData: Record<string, any>;
  savedData: Record<string, any>;
  updateFormData: (section: string, data: any) => void;
  saveFormData: () => void;
  loadFormData: () => void;
  resetForm: () => void;
  setCurrentSection: (section: number) => void;
}

export const useSurveyFormStore = create<SurveyFormState>()(
  persist(
    (set, get) => ({
      currentSection: 0,
      formData: {},
      savedData: {},
      updateFormData: (section, data) =>
        set((state) => ({
          formData: { ...state.formData, [section]: data },
        })),
      saveFormData: () =>
        set((state) => ({
          savedData: { ...state.formData },
        })),
      loadFormData: () =>
        set((state) => ({
          formData: { ...state.savedData },
        })),
      resetForm: () =>
        set({
          currentSection: 0,
          formData: {},
          savedData: {},
        }),
      setCurrentSection: (section) => set({ currentSection: section }),
    }),
    {
      name: 'survey-form-data',
    }
  )
);
