import React, { useState, useEffect } from 'react';
import FixtureDetail from './FixtureDetail';

function FixtureList() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedFixture, setSelectedFixture] = useState(null);

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      const response = await fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75');
      const data = await response.json();
      setFixtures(data.record);
      setLoading(false);
    } catch (error) {
      setError('Failed to load fixtures');
      setLoading(false);
      console.error('Error fetching fixtures:', error);
    }
  };

  const filteredFixtures = fixtures.filter(fixture =>
    searchText === '' || fixture.opponent.toLowerCase().includes(searchText.toLowerCase())
  );

  const getResultColor = (fixture) => {
    if (!fixture.result) return '#999';
    if (fixture.BWFCScore > fixture.opponentScore) return '#28a745';
    if (fixture.BWFCScore === fixture.opponentScore) return '#ffc107';
    return '#dc3545';
  };

  const getHomeAwayColor = (homeOrAway) => {
    return homeOrAway === 'Home' ? '#ffffff' : '#ffc107';
  };

  // Show detail view if a fixture is selected
  if (selectedFixture) {
    return (
      <FixtureDetail 
        fixture={selectedFixture} 
        onBack={() => setSelectedFixture(null)} 
      />
    );
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading fixtures...</div>;
  if (error) return <div style={{ padding: '20px' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img 
          src="/bwfc.png" 
          alt="BWFC" 
          style={{ width: '50px', height: '50px', marginRight: '15px' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 style={{ color: '#003f7f', margin: 0 }}>Fixtures</h1>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter opponent name here"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            border: '2px solid #003f7f',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Fixtures List */}
      <div style={{ maxWidth: '800px' }}>
        {filteredFixtures.map((fixture) => (
          <div 
            key={fixture.id} 
            onClick={() => setSelectedFixture(fixture)}
            style={{
              backgroundColor: '#003f7f',
              color: 'white',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateX(5px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateX(0)'}
          >
            {/* Left side - Opponent, Competition, Date */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '18px', 
                marginBottom: '5px' 
              }}>
                {fixture.opponent}
              </div>
              <div style={{ marginBottom: '3px' }}>
                {fixture.competition}
              </div>
              <div>
                {fixture.date}
              </div>
            </div>

            {/* Right side - Home/Away, Result */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontWeight: 'bold',
                color: getHomeAwayColor(fixture.homeOrAway),
                marginBottom: '5px'
              }}>
                {fixture.homeOrAway}
              </div>
              {fixture.result && (
                <div style={{
                  fontWeight: 'bold',
                  color: getResultColor(fixture)
                }}>
                  {fixture.result}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredFixtures.length === 0 && searchText && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No fixtures found matching "{searchText}"
        </div>
      )}
    </div>
  );
}

export default FixtureList;