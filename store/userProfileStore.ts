import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  name: string;
  email: string;
  profileImage: string | null;
  newsletterSubscribed: boolean;
  location: string;
  bio: string;
  experienceLevel: "beginner" | "intermediate" | "advanced" | "expert";
  favoriteePlantType: string;
}

interface UserProfileStore {
  userProfile: UserProfile;

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setProfileImage: (imageUri: string | null) => void;
  setLocation: (location: string) => void;
  setBio: (bio: string) => void;
  setExperienceLevel: (level: UserProfile["experienceLevel"]) => void;
  setFavoritePlantType: (type: string) => void;
  toggleNewsletterSubscription: () => void;
  clearProfile: () => void;
}

const defaultProfile: UserProfile = {
  name: "",
  email: "",
  profileImage: null,
  newsletterSubscribed: false,
  location: "",
  bio: "",
  experienceLevel: "beginner",
  favoriteePlantType: "",
};

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      userProfile: defaultProfile,

      updateProfile: (updates) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...updates },
        })),

      setName: (name) =>
        set((state) => ({
          userProfile: { ...state.userProfile, name },
        })),

      setEmail: (email) =>
        set((state) => ({
          userProfile: { ...state.userProfile, email },
        })),

      setProfileImage: (profileImage) =>
        set((state) => ({
          userProfile: { ...state.userProfile, profileImage },
        })),

      setLocation: (location) =>
        set((state) => ({
          userProfile: { ...state.userProfile, location },
        })),

      setBio: (bio) =>
        set((state) => ({
          userProfile: { ...state.userProfile, bio },
        })),

      setExperienceLevel: (experienceLevel) =>
        set((state) => ({
          userProfile: { ...state.userProfile, experienceLevel },
        })),

      setFavoritePlantType: (favoriteePlantType) =>
        set((state) => ({
          userProfile: { ...state.userProfile, favoriteePlantType },
        })),

      toggleNewsletterSubscription: () =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            newsletterSubscribed: !state.userProfile.newsletterSubscribed,
          },
        })),

      clearProfile: () =>
        set(() => ({
          userProfile: defaultProfile,
        })),
    }),
    {
      name: "user-profile-storage",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
