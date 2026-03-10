// Add these state variables after your existing useState declarations
const [selectedStatuses, setSelectedStatuses] = useState(['Squad', 'Loan in']);
const [totalCost, setTotalCost] = useState({ Total: 0, overallTotal: 0 });

// Add this filtering logic before your return statement
const filteredPlayers = players.filter(player => 
  selectedStatuses.some(status => 
    player.notes && player.notes.toLowerCase().includes(status.toLowerCase())
  )
);

// Calculate totals for filtered players
useEffect(() => {
  const totals = filteredPlayers.reduce((acc, player) => ({
    Total: acc.Total + (player.Total || 0),
    overallTotal: acc.overallTotal + (player.overallTotal || 0)
  }), { Total: 0, overallTotal: 0 });
  setTotalCost(totals);
}, [filteredPlayers, user]);

// Add this filter component before your player grid
const statusOptions = ['Squad', 'On loan', 'Loan in', 'Gone'];

const StatusFilter = () => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#003f7f' }}>
      Filter by Status:
    </div>
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
      {statusOptions.map(status => (
        <button
          key={status}
          onClick={() => {
            if (selectedStatuses.includes(status)) {
              setSelectedStatuses(selectedStatuses.filter(s => s !== status));
            } else {
              setSelectedStatuses([...selectedStatuses, status]);
            }
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedStatuses.includes(status) ? '#003f7f' : 'transparent',
            color: selectedStatuses.includes(status) ? 'white' : '#003f7f',
            border: '2px solid #003f7f',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {status}
        </button>
      ))}
    </div>
    
    {/* Total row - only show if user is authenticated */}
    {user && (
      <div style={{
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '5px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Total for {selectedStatuses.join(', ')}:</span>
        <span>£{totalCost.overallTotal.toLocaleString()}</span>
      </div>
    )}
  </div>
);

// Then use filteredPlayers instead of players in your map
{filteredPlayers.map((player) => (
  // ... your existing player card code
))}