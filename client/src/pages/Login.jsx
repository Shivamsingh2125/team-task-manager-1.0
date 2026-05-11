import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.1), transparent)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card login-box"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              background: 'var(--glass)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 15px',
            }}
          >
            <LogIn className="gradient-text" size={32} />
          </div>

          <h1 className="gradient-text">Welcome Back</h1>

          <p style={{ color: 'var(--text-muted)' }}>
            Login to manage your team tasks
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              Email Address
            </label>

            <div style={{ position: 'relative' }}>
              <Mail
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
                size={18}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--glass)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'white',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              Password
            </label>

            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
                size={18}
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--glass)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'white',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background:
                'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '25px',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{
              color: 'var(--primary)',
              fontWeight: 500,
            }}
          >
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;