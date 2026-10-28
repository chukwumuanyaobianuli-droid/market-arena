import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidNgPhone } from '../utils/phone';
import { Lock, Mail, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [location, setLocation] = useState('UNICAL');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { currentUser, login, signup, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Already logged in? Go home.
  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  const locations = [
    'UNICAL',
    'UNICROSS',
    'Etta Agbo',
    'Marian Road',
    'Watt Market',
    'Satellite Town',
    'Atimbo',
    'State Housing'
  ];

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('');
      } else {
        setError('Google sign in failed. If you opened this link inside WhatsApp or Facebook, open it in Chrome and try again, or use email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isSignup) {
      if (!displayName || !whatsappNumber) {
        return setError('Please fill in your name and WhatsApp number.');
      }
      if (!isValidNgPhone(whatsappNumber)) {
        return setError('Enter a valid Nigerian number, e.g. 08123456789.');
      }
      if (password.length < 6) {
        return setError('Password must be at least 6 characters.');
      }
    }

    try {
      setLoading(true);
      if (isSignup) {
        const userCredential = await signup(email, password, displayName, whatsappNumber, location);
        // Send email verification to cut fake accounts
        if (userCredential?.user) {
          await sendEmailVerification(userCredential.user);
        }
        setMessage('Account created successfully! Please check your email inbox to verify your account.');
        setTimeout(() => navigate('/'), 3000); // Give them 3 seconds to read the message before going home
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many tries. Please wait a few minutes and try again.');
      } else {
        setError('Authentication failed. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const handleReset = async () => {
    setError('');
    setMessage('');
    if (!email) return setError('Type your email above first, then tap "Forgot password?".');
    try {
      await resetPassword(email);
      setMessage('Reset link sent. Check your email (also check Spam).');
    } catch (err) {
      console.error(err);
      setError('Could not send reset email. Check the email and try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-gray-50/50">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Header with Custom Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img 
              src="/logo.png" 
              alt="Market Arena Logo" 
              className="w-16 h-16 object-contain rounded-2xl p-1 bg-emerald-50/50 border border-emerald-100 shadow-sm"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignup ? 'Create Market Arena Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isSignup 
              ? 'Start buying and selling with Calabar residents & vendors' 
              : 'Sign in to manage your listings and contact sellers'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs rounded-xl">
            {message}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition-colors mb-4 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-3 text-gray-400 text-[10px] font-bold tracking-wider uppercase">Or with Email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {isSignup && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chukwuma Obianuli"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#22C55E] bg-gray-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08123456789"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#22C55E] bg-gray-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Calabar Area</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#22C55E] bg-gray-50/50 focus:bg-white cursor-pointer transition-all"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#22C55E] bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#22C55E] bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>
          </div>

          {!isSignup && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#16a34a] font-semibold hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle between Signup and Login */}
        <div className="text-center mt-6 text-xs text-gray-500">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setMessage('');
            }}
            className="text-[#16a34a] font-bold hover:underline cursor-pointer"
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}