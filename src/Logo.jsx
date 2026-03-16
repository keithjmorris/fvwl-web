import React from 'react';

function Logo() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'white'
    }}>
      <img
        src="/BWFC_AppStoreIcon1024.png"
        alt="Bolton Wanderers FC"
        style={{
          width: '200px',
          height: '200px',
          objectFit: 'contain',
          mixBlendMode: 'multiply'
        }}
      />
      <p style={{ marginTop: '20px', color: '#003f7f', fontSize: '16px' }}>
        Logo preview — with mix-blend-mode: multiply
      </p>

      {/* Second version without blend mode so you can compare */}
      <img
        src="/BWFC_logo2.jpeg"
        alt="Bolton Wanderers FC"
        style={{
          width: '200px',
          height: '200px',
          objectFit: 'contain',
          marginTop: '40px'
        }}
      />
      <p style={{ marginTop: '20px', color: '#003f7f', fontSize: '16px' }}>
        Logo preview — no blend mode
      </p>
    </div>
  );
}

export default Logo;