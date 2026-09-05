'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  createdAt?: string;
  lastSignInAt?: string;
  provider?: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  /**
   * Optimistically or explicitly update partial user profile state in memory
   */
  setProfile: (partialProfile: Partial<UserProfile>) => void;
  /**
   * Fetch current profile from Supabase profiles table and auth session
   */
  fetchProfile: () => Promise<UserProfile | null>;
  /**
   * Reset profile on logout
   */
  clearProfile: () => void;
}

/**
 * Global reactive Zustand store managing user authentication and profile state.
 * Ensures instant real-time synchronization between Sidebar, Dashboard, Settings, and Copilot.
 */
export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,

  setProfile: (partialProfile) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partialProfile } : (partialProfile as UserProfile),
    })),

  clearProfile: () => set({ profile: null, isLoading: false }),

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        set({ profile: null, isLoading: false });
        return null;
      }

      // 1. Fetch live record from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      const effectiveName =
        profileData?.display_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User';

      const effectiveAvatar =
        profileData?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        '';

      const profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        displayName: effectiveName,
        avatarUrl: effectiveAvatar,
        bio: user.user_metadata?.bio || '',
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        provider: user.app_metadata?.provider || 'google',
      };

      set({ profile, isLoading: false });
      return profile;
    } catch (err) {
      set({ isLoading: false });
      return null;
    }
  },
}));
