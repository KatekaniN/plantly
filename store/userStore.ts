import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserStore = {
    hasFinishedOnboarding: boolean;
    toggleHasOnboarded: () => void;
}

export const useUserStore = create(
    persist<UserStore>(
        (set) => ({
            hasFinishedOnboarding: false,
            toggleHasOnboarded: () => {
                return set((state) => {
                    return {
                        ...state,
                        hasFinishedOnboarding: !state.hasFinishedOnboarding
                    };
                });
            },
        }),
        {
            name: "plantly-user-store",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
