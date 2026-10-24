'use client';

import React, { useState } from 'react';
import { User, Phone, Mail, Sparkles, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthUser } from './AuthModal';
import { toast } from './Toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onProfileUpdated: (updatedUser: AuthUser) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!username.trim() || !phone.trim()) {
      setErrorMsg('Username dan Nomor HP wajib diisi');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMsg('Username minimal 3 karakter');
      return;
    }

    if (phone.trim().length < 6) {
      setErrorMsg('Nomor HP minimal 6 digit');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          phone_number: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal memperbarui profil');
        return;
      }

      onProfileUpdated({
        ...user,
        username: data.user.username,
        phone_number: data.user.phone_number,
      });
      toast.success('Profil akun Anda berhasil diperbarui!', 'Profil Tersimpan');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Pengaturan Profil Pengguna
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Perbarui nama tampilan dan kontak WhatsApp akun Anda
              </p>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Email (Read only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Alamat Email (Tetap):
            </label>
            <div className="relative">
              <Input
                type="email"
                value={user.email}
                disabled
                className="pl-9 opacity-60 cursor-not-allowed bg-secondary/30"
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Username Tampilan:
            </label>
            <div className="relative">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: helmitech"
                className="pl-9"
                required
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Nama ini akan muncul di kartu aktivitas dan papan peringkat leaderboard.
            </p>
          </div>

          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Nomor Handphone (WhatsApp):
            </label>
            <div className="relative">
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="pl-9"
                required
              />
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 font-semibold shadow-md shadow-primary/25"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
