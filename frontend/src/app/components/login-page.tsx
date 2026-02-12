import { useState } from 'react';
import { auth } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Heart, Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    emergencyContact: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (isSignUp && (!formData.name || !formData.emergencyContact)) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSignUp && !emailRegex.test(formData.emergencyContact)) {
      toast.error('Please enter a valid emergency contact email');
      return;
    }

    setIsLoading(true);
    try {
      let user: User;
      if (isSignUp) {
        const response = await auth.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          emergencyContact: formData.emergencyContact,
        });
        user = { id: response.userId, name: formData.name, email: formData.email };
        toast.success('Account created successfully!');
      } else {
        const response = await auth.login({
          email: formData.email,
          password: formData.password,
        });
        user = { id: response.userId, name: response.name || formData.name || 'User', email: formData.email };
        toast.success('Welcome back!');
      }
      onLogin(user);
    } catch (error: any) {
      toast.error(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-xl mb-4 transform hover:scale-105 transition-transform duration-300">
            <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
            LifeTrack
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Your Daily Wellness Companion
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-indigo-100 p-8">
            <CardTitle className="text-3xl text-center font-bold text-gray-800">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center text-gray-600 text-base">
              {isSignUp
                ? 'Join us effectively managing your daily life'
                : 'Sign in to access your dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50"
                  required
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-gray-700 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    Emergency Contact Email
                  </Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50"
                    required={isSignUp}
                  />
                  <p className="text-xs text-gray-500">We'll alert this contact if you miss check-ins.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transform active:scale-95 transition-all duration-200 h-12 text-lg font-semibold rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isSignUp ? (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    {isSignUp ? 'Already a member?' : 'New to LifeTrack?'}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-indigo-600 hover:text-purple-700 font-semibold hover:underline transition-all"
                >
                  {isSignUp
                    ? 'Sign in to your account'
                    : 'Create a free account'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-10 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-3xl mb-2 block">💊</span>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Medicine</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-3xl mb-2 block">🍽️</span>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Meals</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-3xl mb-2 block">💧</span>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Hydration</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-3xl mb-2 block">🚨</span>
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Emergency</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
          © 2026 LifeTrack. Caring for what matters most.
        </p>
      </div>
    </div>
  );
}
