import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

function Auth({ user, onAuthChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const auth = getAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in:', userCredential.user);
      onAuthChange(userCredential.user);
    } catch (error) {
      setError('Invalid email or password');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onAuthChange(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (user) {
    return (
      <div style={{ 
        padding: '20px', 
        borderBottom: '2px solid #003f7f',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Welcome, {user.email}</span>
        <button 
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '400px', 
      margin: '20px auto',
      border: '2px solid #003f7f',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2 style={{ textAlign: 'center', color: '#003f7f' }}>Admin Login</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Sign in to view detailed player information
      </p>
      
      <form onSubmit={handleSignIn}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        
        {error && (
          <div style={{ 
            color: '#dc3545', 
            marginBottom: '15px', 
            textAlign: 'center' 
          }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#003f7f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default Auth;