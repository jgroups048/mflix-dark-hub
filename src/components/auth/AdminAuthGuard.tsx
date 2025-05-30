import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AdminPage from '@/pages/AdminPage'; // Assuming AdminPage is the component to render

const ADMIN_PASSWORD = 'mflix123'; // Your hardcoded password
const AUTH_FLAG_KEY = 'mflixAdminAuthenticated';

const AdminAuthGuard: React.FC = () => {
  console.log('[AdminAuthGuard] Component rendering started.');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const authFlag = localStorage.getItem(AUTH_FLAG_KEY);
    if (authFlag === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_FLAG_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (isAuthenticated) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <img src="/lovable-uploads/a177babb-70b0-43a3-9539-f3964d37f08a.png" alt="MFLIX Logo" className="w-32 h-auto mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-6 text-red-500">Admin Panel Access</h2>
        <p className="mb-4 text-gray-300">Enter Admin Password</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 w-full"
          />
          {error && <p className="text-yellow-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3">
            Unlock Admin Panel
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthGuard; 