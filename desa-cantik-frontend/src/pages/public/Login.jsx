// src/pages/public/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link dan useNavigate
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, User, Eye, EyeOff } from 'lucide-react';
import logoDc from '@/assets/images/logo_sangkutu.png'; // Import logo desa
import background from '@/assets/images/bg.jpg'; // Import gambar latar belakang
import { useAuth } from '@/contexts/AuthContext';

import { toast } from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(username, password);
      const roleName = user?.role?.role_name;

      toast.success(`Selamat datang, ${user?.full_name || 'User'}!`);

      // Navigate based on role
      const getSubdomain = () => {
        const hostname = window.location.hostname;
        if (/^[0-9.]+$/.test(hostname)) return null;
        const parts = hostname.split('.');
        const isTwoPartTld = parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'web' || parts[parts.length - 2] === 'go';
        const minPartsForSubdomain = isTwoPartTld ? 4 : 3;
        if (parts.length < minPartsForSubdomain || parts[0] === 'www' || parts[0] === 'api') return null;
        return parts[0];
      };

      const subdomain = getSubdomain();

      if (roleName === 'bps_admin') {
        navigate('/admin/dashboard');
      } else if (roleName === 'village_officer') {
        if (subdomain) {
          navigate('/dashboard');
        } else {
          const slug = user?.village?.name ? user.village.name.toLowerCase().replace(/\s+/g, '-') : 'desa';
          navigate(`/${slug}/dashboard`);
        }
      } else {
        console.warn('Role tidak dikenali:', roleName);
        if (subdomain) {
          navigate('/dashboard');
        } else {
          const slug = user?.village?.name ? user.village.name.toLowerCase().replace(/\s+/g, '-') : 'desa';
          navigate(`/${slug}/dashboard`);
        }
      }
    } catch (err) {
      console.error('Login Error:', err);
      const msg = err?.message || 'Username atau password salah.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="absolute blur-sm opacity-90 inset-0">
        <img
          src={background}
          alt="Latar belakang desa"
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = 'https://placehold.co/1920x600/1c6ea4/ffffff?text=Desa+Cantik'}
        />
        <div className="absolute inset-0 "></div>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:bg-white/20 px-2 sm:px-4"
        onClick={handleBack}
      >
        <ArrowLeft className="h-5 w-5 sm:mr-2" />
        <span className="hidden sm:inline">Kembali ke Home</span>
      </Button>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto p-3 rounded-2xl w-fit">
            <img src={logoDc} alt="Logo Desa Cantik" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
            Desa Cantik
          </CardTitle>
          <CardDescription className="text-xs sm:text-base">
            Sistem Informasi Desa Cinta Statistik
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Input Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Ingat Password */}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-600">Ingat saya</span>
              </label>

              {/* Lupa Password */}

              <Link to="/lupa-password" className="text-[#33A1E0] hover:underline">
                Lupa password?
              </Link>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-4 text-center">{error}</p>
            )}

            {/* Submit Button */}

            <Button
              type="submit"
              className="w-full bg-[#33A1E0] hover:bg-[#1C6EA4] text-white h-11"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
