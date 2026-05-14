import { create } from 'zustand';
import { getUserProfile, upsertUserProfile, UserProfile } from '../db/queries/profile';
import { calculateTDEE, ActivityLevel, suggestMacros } from '../utils/tdee';

interface UserState {
  profile: UserProfile | null;
  isLoaded: boolean;
  loadProfile: () => void;
  saveProfile: (updates: Partial<Omit<UserProfile, 'id' | 'updated_at'>>) => void;
  completeSetup: (data: {
    name?: string;
    age: number;
    sex: 'male' | 'female';
    height_cm: number;
    weight_kg: number;
    activity_level: ActivityLevel;
    target_calories: number;
    target_protein_g: number;
    target_carbs_g: number;
    target_fat_g: number;
  }) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoaded: false,

  loadProfile: () => {
    const profile = getUserProfile();
    set({ profile, isLoaded: true });
  },

  saveProfile: (updates) => {
    upsertUserProfile(updates);
    const profile = getUserProfile();
    set({ profile });
  },

  completeSetup: (data) => {
    const tdee = calculateTDEE(
      data.weight_kg,
      data.height_cm,
      data.age,
      data.sex,
      data.activity_level
    );
    upsertUserProfile({
      ...data,
      tdee,
      setup_complete: 1,
    });
    const profile = getUserProfile();
    set({ profile });
  },
}));
