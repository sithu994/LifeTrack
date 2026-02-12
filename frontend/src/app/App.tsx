import { useState, useEffect } from 'react';
import Dashboard from '@/app/components/dashboard';
import LoginPage from '@/app/components/login-page';
import { Toaster } from '@/app/components/ui/sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('lifetrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('lifetrack_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lifetrack_user');
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </div>
      <Toaster />
    </>
  );
}
