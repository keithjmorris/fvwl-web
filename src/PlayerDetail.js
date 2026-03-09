import React from 'react';

function PlayerDetail({ player, onBack, user }) {
  const showFinancials = !!user;

  const formatCurrency = (amount) => {
    return amount ? `£${amount.toLocaleString()}` : '£0';
  };

  const formatDate = (dateString) => {
    return dateString || 'N/A';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      {/* Back button */}
      <button 
        onClick={onBack}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#003f7f',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Back to Squad
      </button>

      {/* Player name */}
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#003f7f',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        {player.forename} {player.surname}
      </div>

      {/* Basic Info - Always visible */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold'
      }}>
        <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>Basic Information</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Status:</span>
          <span>{player.notes}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Date of Birth:</span>
          <span>{formatDate(player.DOB)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Rating:</span>
          <span>{player.rating || 'Not rated'}/5</span>
        </div>
      </div>

      {/* Goal Statistics - Always visible */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold'
      }}>
        <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>Goal Statistics</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Total Goals:</span>
          <span>{player.goals || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>League:</span>
          <span>{player.league || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>FA Cup:</span>
          <span>{player.fACup || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>EFL Cup:</span>
          <span>{player.eFLCup || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>EFL Trophy:</span>
          <span>{player.eFLTrophy || 0}</span>
        </div>
      </div>

      {/* CONTRACT INFO - Auth required */}
      {showFinancials && (
        <div style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>Contract Details</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Contract Start:</span>
            <span>{formatDate(player.contractStartDate)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Contract End:</span>
            <span>{formatDate(player.contractEndDate)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Weekly Wage:</span>
            <span>{formatCurrency(player.currentWeeklyWage)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Annual Wage:</span>
            <span>{formatCurrency(player.currentAnnualWage)}</span>
          </div>
        </div>
      )}

      {/* WAGE BREAKDOWN - Auth required */}
      {showFinancials && (
        <div style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>Wage Breakdown</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>NI Contributions:</span>
            <span>{formatCurrency(player.NI)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Total Cost:</span>
            <span>{formatCurrency(player.Total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Bonuses:</span>
            <span>{formatCurrency(player.bonuses)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Loyalty Bonus:</span>
            <span>{formatCurrency(player.loyalty)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Loyalty NI:</span>
            <span>{formatCurrency(player.loyaltyNI)}</span>
          </div>
        </div>
      )}

      {/* AGENT FEES - Auth required */}
      {showFinancials && (
        <div style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>Agent Fees</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Fees (Inc VAT):</span>
            <span>{formatCurrency(player.agentFeesIncVat)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Agent Fees NI:</span>
            <span>{formatCurrency(player.agentFeesNI)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Club Net Cost:</span>
            <span>{formatCurrency(player.agentFeesClubNet)}</span>
          </div>
        </div>
      )}

      {/* OTHER COSTS - Auth required */}
      {showFinancials && (
        <div style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>Additional Costs</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Accommodation:</span>
            <span>{formatCurrency(player.accommodationCosts)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Relocation:</span>
            <span>{formatCurrency(player.relocation)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Loan Income:</span>
            <span>{formatCurrency(player.loanIncome)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>YTD Team Bonuses:</span>
            <span>{formatCurrency(player.ytdTeamBonusesLeague)}</span>
          </div>
        </div>
      )}

      {/* CONTRACT CONTINGENTS - Auth required */}
      {showFinancials && (player.otherContractContingent || player.otherContractContingent2 || player.promotionContingents) && (
        <div style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>Contract Contingents</div>
          {player.otherContractContingent && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', color: '#ccc' }}>{player.otherContractContingent}</div>
              <div>{formatCurrency(player.otherContractContingentPounds)}</div>
            </div>
          )}
          {player.otherContractContingent2 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', color: '#ccc' }}>{player.otherContractContingent2}</div>
              <div>{formatCurrency(player.otherContractContingent2Pounds)}</div>
            </div>
          )}
          {player.promotionContingents && (
            <div>
              <div style={{ fontSize: '14px', color: '#ccc' }}>{player.promotionContingents}</div>
              <div>{formatCurrency(player.promotionContingentsPounds)}</div>
            </div>
          )}
        </div>
      )}

      {/* TRANSFER INFO - Auth required */}
      {showFinancials && (
        <div style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>Transfer Details</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Date Signed:</span>
            <span>{formatDate(player.dateBought)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Transfer Fee:</span>
            <span>{formatCurrency(player.transferFee)}</span>
          </div>
          {player.addOns && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', color: '#ccc' }}>Add-ons:</div>
              <div>{player.addOns}</div>
            </div>
          )}
          {player.sellOn && (
            <div>
              <div style={{ fontSize: '14px', color: '#ccc' }}>Sell-on Clause:</div>
              <div>{player.sellOn}</div>
            </div>
          )}
        </div>
      )}

      {/* FINANCIAL TOTAL - Auth required */}
      {showFinancials && (
        <div style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold',
          fontSize: '18px',
          textAlign: 'center'
        }}>
          <div>OVERALL TOTAL: {formatCurrency(player.overallTotal)}</div>
        </div>
      )}

      {/* Auth prompt for non-logged users */}
      {!showFinancials && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #003f7f',
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 10px 0', fontStyle: 'italic' }}>
            Contract, financial, and transfer details available to authorized users
          </p>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Click the gear icon (⚙️) to access admin login
          </p>
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;