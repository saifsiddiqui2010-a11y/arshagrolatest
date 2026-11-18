import React, { useEffect, useRef, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { X, Lock, Mail, User, Phone, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, loginWithGoogle, quickLoginAs } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneConsent, setPhoneConsent] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (isOpen) return;
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
    setConfirmationResult(null);
    setVerificationCode('');
    setPhoneConsent(false);
  }, [isOpen]);

  useEffect(() => () => recaptchaVerifierRef.current?.clear(), []);

  if (!isOpen) return null;

  const getPhoneAuthErrorMessage = (error: unknown) => {
    if (!(error instanceof FirebaseError)) {
      return error instanceof Error ? error.message : 'Phone verification failed.';
    }

    switch (error.code) {
      case 'auth/billing-not-enabled':
        return 'SMS sign-in requires Firebase billing to be enabled. Please try again later.';
      case 'auth/operation-not-allowed':
        return 'Phone sign-in is not enabled for this Firebase project yet.';
      case 'auth/invalid-phone-number':
        return 'Enter a valid phone number in international format, for example +91 98765 43210.';
      case 'auth/invalid-verification-code':
        return 'That verification code is incorrect. Check the SMS and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a while before trying again.';
      case 'auth/captcha-check-failed':
        return 'The security check failed. Please try sending the code again.';
      default:
        return error.message || 'Phone verification failed.';
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(verificationCode.trim());
        onSuccess();
        onClose();
        return;
      }

      if (!phoneConsent) {
        setErrorMsg('Please consent to receive the SMS verification code before continuing.');
        return;
      }

      const normalizedPhone = phone.trim().replace(/[\s()-]/g, '');
      if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
        setErrorMsg('Enter a valid phone number in international format, for example +91 98765 43210.');
        return;
      }
      if (!recaptchaContainerRef.current) {
        throw new Error('Phone verification could not start. Please refresh and try again.');
      }

      recaptchaVerifierRef.current?.clear();
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { size: 'invisible' });
      recaptchaVerifierRef.current = verifier;
      const result = await signInWithPhoneNumber(auth, normalizedPhone, verifier);
      setConfirmationResult(result);
    } catch (error) {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      setErrorMsg(getPhoneAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMsg(res.message || 'Invalid email or password.');
        }
      } else {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        const res = await register(name, email, password, phone);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMsg(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Google Sign-In failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    await quickLoginAs();
    setIsLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-amber-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Green */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Arsh Agro Industry</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-serif-heading">
            {mode === 'login' ? 'Welcome Back' : 'Create User Account'}
          </h3>
          <p className="text-xs text-emerald-200 mt-1">
            {mode === 'login'
              ? 'Sign in to access your orders, track shipments & saved addresses.'
              : 'Join to order pure cold-pressed oil with fast checkout.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 border border-stone-300 rounded-2xl flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-stone-700 bg-white hover:bg-stone-50 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.37 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.63 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase">
              Or with {authMethod === 'email' ? 'Email' : 'Phone'}
            </span>
          </div>

          {authMethod === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-3">
              <div ref={recaptchaContainerRef} />
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {confirmationResult ? 'Verification Code' : 'Phone Number'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    autoComplete={confirmationResult ? 'one-time-code' : 'tel'}
                    inputMode={confirmationResult ? 'numeric' : 'tel'}
                    placeholder={confirmationResult ? 'Enter the SMS code' : '+91 98765 43210'}
                    value={confirmationResult ? verificationCode : phone}
                    onChange={(e) => {
                      if (confirmationResult) {
                        setVerificationCode(e.target.value);
                      } else {
                        setPhone(e.target.value);
                        setPhoneConsent(false);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>
              {!confirmationResult && (
                <label className="flex items-start gap-2 text-[11px] text-stone-600">
                  <input
                    type="checkbox"
                    required
                    checked={phoneConsent}
                    onChange={(e) => setPhoneConsent(e.target.checked)}
                    className="mt-0.5 accent-emerald-700"
                  />
                  <span>
                    I agree to receive a verification SMS. Firebase processes my number for verification and abuse prevention; message rates may apply.
                  </span>
                </label>
              )}
              <p className="text-[11px] text-amber-800">
                SMS sign-in requires Firebase Phone Authentication and billing to be enabled.
              </p>
              <button
                type="submit"
                disabled={isLoading || (confirmationResult !== null && !verificationCode.trim())}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                {isLoading ? 'Please wait...' : confirmationResult ? 'Verify and Sign In' : 'Send Verification Code'}
              </button>
              {confirmationResult && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmationResult(null);
                    setVerificationCode('');
                    setPhoneConsent(false);
                    setErrorMsg('');
                  }}
                  className="w-full text-xs font-semibold text-emerald-800 hover:underline"
                >
                  Change phone number
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setConfirmationResult(null);
                  setVerificationCode('');
                  setPhoneConsent(false);
                  recaptchaVerifierRef.current?.clear();
                  recaptchaVerifierRef.current = null;
                  setErrorMsg('');
                }}
                className="w-full text-xs font-semibold text-stone-600 hover:underline"
              >
                Use email instead
              </button>
            </form>
          ) : (
          <>
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : mode === 'login' ? (
                <span>Sign In to Account</span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setAuthMethod('phone');
              setErrorMsg('');
            }}
            disabled={isLoading}
            className="w-full py-2.5 border border-stone-300 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            <Phone className="w-4 h-4" />
            Continue with phone
          </button>

          {/* Toggle Login / Register */}
          <div className="text-center pt-2">
            {mode === 'login' ? (
              <p className="text-xs text-stone-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p className="text-xs text-stone-600">
                Already registered?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Sign In here
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Login Helpers */}
          <div className="pt-3 border-t border-stone-100">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center mb-2">
              Quick Customer Demo
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="py-1.5 px-2 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 rounded-lg text-[11px] font-semibold transition-colors"
              >
                👤 Demo Customer
              </button>
            </div>
          </div>
          </>
          )}

        </div>

      </div>
    </div>
  );
};
