import { create } from 'zustand';
import { persist } from 'zustand/middleware';


type UserStore = {
    hasFinishedOnboarding: boolean;
    toggleHasOnboarded: () => void;
}

export const useUserStore = create<UserStore>((set) => ({

}))