import { ArrowRight, Loader2, Lock, Phone, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import useStore from '../store/useStore';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useStore();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.sendOtp(phone);
      setStep('otp');
    } catch {
      setError('Failed to send OTP. Check if server is running.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await authApi.verifyOtp(phone, otp);
      if (result.success) {
        // Store user and worker data in localStorage
        const userData = {
          id: result.user.id,
          name: result.user.name,
          phone: result.user.phone,
          email: result.user.email,
          role: result.user.role,
          workerId: result.worker?.id,
          worker: result.worker
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        if (result.worker) {
          localStorage.setItem('currentWorker', JSON.stringify(result.worker));
        }
        
        // Force reload to get fresh user data
        window.location.href = result.user.role === 'admin' ? '/dashboard' : '/worker-dashboard';
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch {
      setError('Verification failed. Invalid code or technical error.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-primary-950 to-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-2xl shadow-primary-500/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GigShield</h1>
          <p className="text-primary-300/70 text-sm mt-1.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Parametric Insurance
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              {step === 'phone' ? 'Welcome back' : 'Verify Identity'}
            </h2>
            <p className="text-sm text-dark-400 mt-1">
              {step === 'phone'
                ? 'Sign in to access your dashboard'
                : `Enter the code sent to +91 ${phone}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-2 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-dark-400 text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full pl-20 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-dark-600 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Get Magic Link <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-2 block">Verify OTP</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="------"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-dark-600 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm tracking-[0.3em] text-center font-mono text-lg"
                    autoFocus
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-dark-500 mt-2 italic">Check backend console for your mock OTP code</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Secure Login <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="w-full py-2 text-sm text-dark-400 hover:text-primary-400 transition-colors"
              >
                Change phone number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-dark-600 mt-6 font-mono tracking-widest uppercase">
          GigShield AI Engine v2.4a
        </p>
      </div>
    </div>
  );
}
