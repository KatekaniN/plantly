import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeType = "light" | "dark" | "auto";

type UserStore = {
  hasFinishedOnboarding: boolean;
  themePreference: ThemeType;
  toggleHasOnboarded: () => void;
  setThemePreference: (theme: ThemeType) => void;
};

export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      hasFinishedOnboarding: false,
      themePreference: "light",
      toggleHasOnboarded: () => {
        return set((state) => {
          return {
            ...state,
            hasFinishedOnboarding: !state.hasFinishedOnboarding,
          };
        });
      },
      setThemePreference: (theme: ThemeType) => {
        return set((state) => {
          return {
            ...state,
            themePreference: theme,
          };
        });
      },
    }),
    {
      name: "plantly-user-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
