import React, { useState } from 'react';
import ScorerList from './ScorerList';
import AppearanceStats from './AppearanceStats';
import DisciplinaryStats from './DisciplinaryStats';
import ImpactStats from './ImpactStats';

function Stats() {
  const [activeStatsView, setActiveStatsView] = useState('scorers');

  const statsNavItems = [
    { key: 'scorers', label: 'Scorers' },
    { key: 'appearances', label: 'Appearances' },
    { key: 'disciplinary', label: 'Disciplinary' },
    { key: 'impact', label: 'Impact' }
  ];

  const renderStatsView = () => {
    switch (activeStatsView) {
      case 'scorers':
        return <ScorerList />;
      case 'appearances':
        return <AppearanceStats />;
      case 'disciplinary':
        return <DisciplinaryStats />;
      case 'impact':
        return <ImpactStats />;
      default:
        return <ScorerList />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Stats Sub-Navigation */}
      <div style={{
        backgroundColor: '#003f7f',
        padding: '10px 20px',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          maxWidth: '1200px',
          margin: '0 auto',
          flexWrap: 'wrap'
        }}>
          {statsNavItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveStatsView(item.key)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                backgroundColor: activeStatsView === item.key ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                color: activeStatsView === item.key ? '#003f7f' : '#ffffff',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
              onMouseOver={(e) => {
                if (activeStatsView !== item.key) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                if (activeStatsView !== item.key) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Content */}
      <div>
        {renderStatsView()}
      </div>
    </div>
  );
}

export default Stats;