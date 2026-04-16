import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          {submitted ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 mb-6">If an account exists for <strong className="text-white">{email}</strong>, a reset link has been sent.</p>
              <Link to="/login" className="flex items-center justify-center space-x-2 text-purple-400 hover:text-purple-300">
                <ArrowLeft className="w-4 h-4" /><span>Back to login</span>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /><span>Back to login</span>
              </Link>
              <h2 className="text-2xl font-bold text-white mb-2">Forgot password?</h2>
              <p className="text-gray-400 mb-6">Enter your email and we'll send you a reset link.</p>
              {error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
