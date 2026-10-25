'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser } from '@/components/AuthModal';
import AuthModal from '@/components/AuthModal';
import { ToastContainer, toast } from '@/components/Toast';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updated: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    authService
      .getMe()
      .then((data) => {
        if (!ignore) {
          setUser(data.user || null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to check user session:', err);
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback((loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    toast.success(`Selamat datang kembali, ${loggedInUser.username}!`, 'Berhasil Masuk');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Anda berhasil keluar dari akun.', 'Sampai Jumpa');
    } catch (e) {
      console.error('Failed to logout:', e);
      toast.error('Gagal memproses logout.', 'Kesalahan');
    }
  }, []);

  const updateUser = useCallback((updated: AuthUser) => {
    setUser(updated);
  }, []);

  const isGuest = !user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}

      {/* Global Auth Modal mounted once across the entire app */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={login}
      />

      {/* Global Toast Container mounted once */}
      <ToastContainer />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
