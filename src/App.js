import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import EnhancedSquadList from './EnhancedSquadList';
import FixtureList from './FixtureList';
import Stats from './Stats';

const firebaseConfig = {
  apiKey: "AIzaSyAvITdQHZkF-Kjkacna0fsxPYqbBEKJwlg",
  authDomain: "fvwl-8109b.firebaseapp.com",
  databaseURL: "https://fvwl-8109b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fvwl-8109b",
  storageBucket: "fvwl-8109b.firebasestorage.app",
  messagingSenderId: "406636067359",
  appId: "1:406636067359:web:8b70673d38495254b2f32a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function Navigation({ activeView, onViewChange, user, onShowLogin }) {
  const navItems = [
    { key: 'squad', label: 'Squad' },
    { key: 'fixtures', label: 'Fixtures' },
    { key: 'stats', label: 'Stats' }
  ];

  return (
    <nav style={{
      backgroundColor: '#003f7f',
      padding: '15px 20px',
      marginBottom: '0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            style={{
              backgroundColor: activeView === item.key ? '#ffffff' : 'transparent',
              color: activeView === item.key ? '#003f7f' : '#ffffff',
              border: activeView === item.key ? 'none' : '2px solid #ffffff',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user ? (
          <span
            onClick={onShowLogin}
            style={{ color: 'white', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            &#9881;&#65039; Admin: {user.email.split('@')[0]}
          </span>
        ) : null}
      </div>
    </nav>
  );
}

function AdminModal({ user, onClose, onAuthChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onAuthChange(userCredential.user);
      onClose();
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onAuthChange(null);
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '10px',
        maxWidth: '400px', width: '90%', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '10px', right: '15px',
          backgroundColor: 'transparent', border: 'none', fontSize: '20px',
          cursor: 'pointer', color: '#666'
        }}>
          &times;
        </button>

        {user ? (
          <div>
            <h3 style={{ color: '#003f7f', textAlign: 'center' }}>Admin Panel</h3>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
              Logged in as: <strong>{user.email}</strong>
            </p>
            <button onClick={handleSignOut} style={{
              width: '100%', padding: '12px', backgroundColor: '#dc3545',
              color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px'
            }}>
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ color: '#003f7f', textAlign: 'center' }}>Admin Login</h3>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
              Access detailed squad financial information
            </p>
            <form onSubmit={handleSignIn}>
              <input type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '12px', margin: '10px 0', border: '2px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                style={{ width: '100%', padding: '12px', margin: '10px 0', border: '2px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
              {error && (
                <div style={{ color: '#dc3545', textAlign: 'center', margin: '10px 0', fontSize: '14px' }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px', backgroundColor: '#003f7f',
                color: 'white', border: 'none', borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px',
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState('squad');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [fixtures, setFixtures] = useState([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch fixtures once on load
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75/latest', {
          headers: { 'X-Master-Key': '$2a$10$VTMAZsuNJaZxXb2dEFdOheJXXwRGD7GJj7e5vRp9jKvHqF51SN29e' }
        });
        const data = await response.json();
        setFixtures(data.record);
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      } finally {
        setFixturesLoading(false);
      }
    };
    fetchFixtures();
  }, []);

  if (authLoading || fixturesLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  const renderView = () => {
    switch (activeView) {
      case 'squad':
        return <EnhancedSquadList fixtures={fixtures} isAuthenticated={!!user} onRequestLogin={() => setShowAdminModal(true)} user={user} />;
      case 'fixtures':
        return <FixtureList fixtures={fixtures} isAuthenticated={!!user} />;
      case 'stats':
        return <Stats fixtures={fixtures} />;
      default:
        return <EnhancedSquadList fixtures={fixtures} isAuthenticated={!!user} onRequestLogin={() => setShowAdminModal(true)} user={user} />;
    }
  };

  return (
    <div>
      <Navigation
        activeView={activeView}
        onViewChange={setActiveView}
        user={user}
        onShowLogin={() => setShowAdminModal(true)}
      />
      {renderView()}
      {showAdminModal && (
        <AdminModal
          user={user}
          onClose={() => setShowAdminModal(false)}
          onAuthChange={setUser}
        />
      )}
    </div>
  );
}

export default App;