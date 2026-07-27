// src/pages/public/ForgotPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import logoDc from "@/assets/images/logo_dc.png";
import background from "@/assets/images/bg.jpg";
import { toast } from "react-hot-toast";
import { authApi } from "@/services/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success("Link reset password telah dikirim ke email Anda");
    } catch (err) {
      toast.error(err?.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="absolute blur-sm opacity-90 inset-0">
        <img
          src={background}
          alt="Latar belakang"
          className="w-full h-full object-cover"
        />
      </div>

      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:bg-white/20"
        onClick={() => navigate("/login")}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Kembali ke Login
      </Button>

      <Card className="w-full max-w-md shadow-2xl relative z-10">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto p-4 rounded-2xl w-fit">
            <img
              src={logoDc}
              alt="Logo Desa Cantik"
              className="w-20 h-20 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Lupa Password
          </CardTitle>
          <CardDescription className="text-base">
            Masukkan email Anda untuk menerima link reset password
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-gray-600">
                Link reset password telah dikirim ke <strong>{email}</strong>.
                Silakan cek inbox atau folder spam Anda.
              </p>
              <Button
                variant="outline"
                onClick={() => setSent(false)}
                className="w-full"
              >
                Kirim Ulang
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#33A1E0] hover:bg-[#1C6EA4] text-white h-11"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Sudah ingat password?{" "}
                <Link to="/login" className="text-[#33A1E0] hover:underline">
                  Login di sini
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
