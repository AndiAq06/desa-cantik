// src/pages/admin/UbahPasswordAdminBPS.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { dataApi } from '@/services/dataApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function UbahPasswordAdminBPS() {
  const [targetUser, setTargetUser] = useState('self'); // 'self' or user.id
  const [villageUsers, setVillageUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch village officers on mount
  useEffect(() => {
    const fetchVillageOfficers = async () => {
      try {
        const { items } = await dataApi.listUsers({ role: 'village_officer' });
        setVillageUsers(items || []);
      } catch (err) {
        console.error('Failed to fetch village officers:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchVillageOfficers();
  }, []);

  // State untuk form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State untuk visibilitas password
  const [showOldPasswordInput, setShowOldPasswordInput] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Tentukan apakah field "Password Lama" perlu ditampilkan
  // tampil jika admin mengubah password-nya sendiri
  const showOldPassword = targetUser === 'self';

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validasi 1: Konfirmasi password harus sama
    if (newPassword !== confirmPassword) {
      setError('Password Baru dan Konfirmasi Password tidak cocok.');
      setLoading(false);
      return;
    }

    // Validasi 2: Password baru tidak boleh kosong
    if (!newPassword) {
      setError('Password Baru tidak boleh kosong.');
      setLoading(false);
      return;
    }

    // Call API
    try {
      if (targetUser === 'self') {
        // Update own password (requires old password)
        await dataApi.updatePassword(oldPassword, newPassword);
        const msg = 'Password berhasil diperbarui. Silakan login kembali.';
        setSuccess(msg);
        toast.success(msg);
      } else {
        // Reset village officer password (admin privilege)
        await dataApi.resetUserPassword(targetUser, newPassword);
        const user = villageUsers.find(u => u.id === parseInt(targetUser));
        const msg = `Password untuk ${user?.full_name || 'pengguna'} berhasil direset.`;
        setSuccess(msg);
        toast.success(msg);
      }

      // Kosongkan form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (apiError) {
      const errMsg = apiError.message || 'Gagal memperbarui password. Silakan coba lagi.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password (Admin)</CardTitle>
          <CardDescription>
            Anda dapat mengubah password akun Anda atau mereset password akun Perangkat Desa.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            {/* Opsi Target */}
            <div className="space-y-2">
              <Label htmlFor="targetUser">Ubah Password Untuk Akun</Label>
              <Select value={targetUser} onValueChange={setTargetUser}>
                <SelectTrigger id="targetUser">
                  <SelectValue placeholder="Pilih target pengguna..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Saya (Administrator)</SelectItem>
                  {loadingUsers ? (
                    <SelectItem value="loading" disabled>Memuat...</SelectItem>
                  ) : (
                    villageUsers.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.full_name} - {user.village?.name || 'N/A'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Field Password Lama */}
            {showOldPassword && (
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Password Lama</Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPasswordInput ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPasswordInput(!showOldPasswordInput)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showOldPasswordInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Field Password Baru */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Field Konfirmasi Password Baru */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Feedback (Error/Success) */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

          </CardContent>
          <CardFooter>
            <Button className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm whitespace-nowrap" type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
