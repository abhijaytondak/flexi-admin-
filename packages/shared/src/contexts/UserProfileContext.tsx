import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../utils/api";
import { DEFAULT_PROFILE, AVATAR_COLORS, type AdminProfile } from "../types";
export { AVATAR_COLORS };

interface ProfileContextType {
  profile: AdminProfile;
  loading: boolean;
  saving: boolean;
  updateProfile: (updates: Partial<AdminProfile>) => void;
  saveProfile: (updates?: Partial<AdminProfile>) => Promise<void>;
  refetch: () => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: DEFAULT_PROFILE, loading: false, saving: false,
  updateProfile: () => {}, saveProfile: async () => {}, refetch: () => {},
});

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getProfile();
      setProfile({ ...DEFAULT_PROFILE, ...res.data });
    } catch { /* fall back to defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = (updates: Partial<AdminProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const saveProfile = async (updates?: Partial<AdminProfile>) => {
    const prev = profile;
    const toSave = updates ? { ...profile, ...updates } : profile;
    if (updates) setProfile(p => ({ ...p, ...updates }));
    setSaving(true);
    try {
      const res = await api.saveProfile(toSave);
      setProfile({ ...DEFAULT_PROFILE, ...res.data });
    } catch (err) {
      setProfile(prev);
      throw err;
    } finally { setSaving(false); }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, saving, updateProfile, saveProfile, refetch: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useUserProfile() { return useContext(ProfileContext); }
