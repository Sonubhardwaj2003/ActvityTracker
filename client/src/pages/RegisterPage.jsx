import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { AuthLayout } from '../components/layout/AuthLayout';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);
    if (res?.success) {
      navigate('/');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building lifelong consistency with DailyTrack"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
            Your Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ram"
              className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
        </div>

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
          <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
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
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-surface-500 dark:text-surface-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
