import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('phone', data.phone);
      formData.append('ward', data.ward);
      formData.append('role', 'citizen');
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }
      
      await registerUser(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto my-12 bg-white border border-govborder p-8 rounded-sm shadow-sm">
      <div className="text-center mb-6">
        <span className="text-[10px] text-govtext-muted font-bold uppercase tracking-wider block mb-1">
          Citizen Registration
        </span>
        <h1 className="text-xl font-bold text-govtext-dark">Create Account</h1>
        <p className="text-[11px] text-govtext-muted mt-1">
          Register to file complaints, track timelines, and submit resolution feedback.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger-light text-danger border border-danger-light text-xs rounded-sm font-medium flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Jane Doe"
            {...register('name', { required: 'Full name is required' })}
            className={`w-full p-2.5 border text-xs rounded-sm focus:outline-none focus:border-primary ${
              errors.name ? 'border-danger' : 'border-govborder'
            }`}
          />
          {errors.name && (
            <span className="text-[10px] text-danger mt-1 block font-medium">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="jane.doe@example.com"
              {...register('email', { required: 'Email address is required' })}
              className={`w-full p-2.5 border text-xs rounded-sm focus:outline-none focus:border-primary ${
                errors.email ? 'border-danger' : 'border-govborder'
              }`}
            />
            {errors.email && (
              <span className="text-[10px] text-danger mt-1 block font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="9876543210"
              {...register('phone', { required: 'Phone number is required' })}
              className={`w-full p-2.5 border text-xs rounded-sm focus:outline-none focus:border-primary ${
                errors.phone ? 'border-danger' : 'border-govborder'
              }`}
            />
            {errors.phone && (
              <span className="text-[10px] text-danger mt-1 block font-medium">
                {errors.phone.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
              Ward No / Location
            </label>
            <select
              {...register('ward', { required: 'Ward selection is required' })}
              className={`w-full p-2.5 border text-xs rounded-sm focus:outline-none focus:border-primary bg-white ${
                errors.ward ? 'border-danger' : 'border-govborder'
              }`}
            >
              <option value="">Select Local Ward</option>
              <option value="Ward 1: Civil Lines">Ward 1: Civil Lines</option>
              <option value="Ward 2: Katra">Ward 2: Katra</option>
              <option value="Ward 3: Georgetown">Ward 3: Georgetown</option>
              <option value="Ward 4: Naini">Ward 4: Naini</option>
              <option value="Ward 5: Ashok Nagar">Ward 5: Ashok Nagar</option>
              <option value="Ward 6: Jhalwa">Ward 6: Jhalwa</option>
            </select>
            {errors.ward && (
              <span className="text-[10px] text-danger mt-1 block font-medium">
                {errors.ward.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className={`w-full p-2.5 border text-xs rounded-sm focus:outline-none focus:border-primary ${
                errors.password ? 'border-danger' : 'border-govborder'
              }`}
            />
            {errors.password && (
              <span className="text-[10px] text-danger mt-1 block font-medium">
                {errors.password.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-govtext-dark mb-1.5 uppercase tracking-wider">
            Profile Photo (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-govborder file:text-xs file:font-semibold file:bg-govbg hover:file:bg-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded-sm transition-colors flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : 'Create Official Profile'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-govtext-muted border-t border-govborder pt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-bold">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
