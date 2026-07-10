import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const expiredToken = searchParams.get('expired');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[460px] mx-auto my-12 bg-white border border-govborder p-8 rounded-md shadow-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#0b1a30] text-white flex items-center justify-center font-black rounded-md text-base mx-auto shadow-sm border border-slate-700">
          PMC
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
            Prayagraj Municipal Corporation
          </span>
          <h1 className="text-2xl font-extrabold text-[#0b1a30] tracking-tight">Portal Authentication</h1>
          <p className="text-xs text-govtext-muted">
            Access secure dashboard controls, assignment details, and active logs.
          </p>
        </div>
      </div>

      {expiredToken && (
        <div className="p-3.5 bg-warning-light/35 text-warning border border-warning-light text-xs rounded-md font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Your session has expired. Please sign in again.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-danger-light/30 text-danger border border-danger-light text-xs rounded-md font-medium flex items-center gap-2">
          <ShieldAlert size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-govtext-dark uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. citizen@fixmycity.gov"
            {...register('email', { required: 'Email address is required' })}
            className={`w-full p-3 border text-sm rounded-md focus:outline-none focus:border-primary bg-govbg transition-all ${
              errors.email ? 'border-danger' : 'border-govborder'
            }`}
          />
          {errors.email && (
            <span className="text-[10px] text-danger block font-semibold">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-govtext-dark uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-primary hover:underline font-bold"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
            className={`w-full p-3 border text-sm rounded-md focus:outline-none focus:border-primary bg-govbg transition-all ${
              errors.password ? 'border-danger' : 'border-govborder'
            }`}
          />
          {errors.password && (
            <span className="text-[10px] text-danger block font-semibold">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-bold py-3 rounded-md transition-all flex justify-center items-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Authenticate Credentials'}
        </button>
      </form>

      {/* Demo Credentials Alert Info */}
      <div className="p-4 bg-blue-50/40 border border-blue-100/60 text-xs text-govtext-muted rounded-md space-y-2">
        <p className="font-bold text-[#0b1a30] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary block"></span>
          Municipal Demo Credentials:
        </p>
        <div className="space-y-1.5 font-mono text-[11px] text-slate-600 pl-3">
          <p>• Admin: <span className="text-govtext-dark font-semibold">admin@fixmycity.gov</span> / <span className="text-govtext-dark">admin123</span></p>
          <p>
            • Staff: <span className="text-govtext-dark font-semibold">road.emp@fixmycity.gov</span> / <span className="text-govtext-dark">employee123</span>
            <span className="block text-[9.5px] text-slate-500 font-sans mt-0.5 ml-2 leading-normal">
              (Scope: <strong>Road Department</strong> in <strong>Ward 1: Civil Lines</strong>. File a "Road Damage" complaint in Ward 1 as Citizen to test this workflow!)
            </span>
          </p>
          <p>• Citizen: <span className="text-govtext-dark font-semibold">citizen@fixmycity.gov</span> / <span className="text-govtext-dark">citizen123</span></p>
        </div>
      </div>

      <div className="text-center text-sm text-govtext-muted border-t border-govborder pt-4">
        Need to register a complaint?{' '}
        <Link to="/register" className="text-primary hover:underline font-bold">
          Create an Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
