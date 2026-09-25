import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { AuthLayout } from '../components/layout/AuthLayout';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.success) {
      navigate('/');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your personal productivity system"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-surface-700 dark:text-surface-300">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5"
          isLoading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-xs text-surface-500 dark:text-surface-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};
