/**
 * usePlayerStats Hook
 * Loads fixtures and scorers from JSONBin and calculates player statistics dynamically
 */

import { useState, useEffect, useMemo } from 'react';
import PlayerStatsCalculator from './PlayerStatsCalculator';

const usePlayerStats = () => {
  const [fixtures, setFixtures] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load fixtures and scorers from JSONBin
  // Load fixtures and scorers from JSONBin
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both fixtures and scorers data simultaneously
      const [fixturesResponse, scorersResponse] = await Promise.all([
        fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75', {
          headers: {
            'X-Master-Key': '$2a$10$tu1g4CPPDvkhNoGkNsMN..b8X1gYHLd7XTX4jYOiOfpELZJCYGzxi',
          }
        }),
        // Copy the exact working scorers fetch (no API key)
        fetch('https://api.jsonbin.io/v3/b/68283e668561e97a50159f8a')
      ]);
      
      if (!fixturesResponse.ok || !scorersResponse.ok) {
        throw new Error('Failed to load data');
      }
      
      const fixturesData = await fixturesResponse.json();
      const scorersData = await scorersResponse.json();
      
      // JSONBin wraps data in 'record' property
      const fixturesArray = fixturesData.record || [];
      // Process scorers exactly like the working ScorerList
      const scorersArray = scorersData?.record ? 
        scorersData.record.map(scorer => ({
          ...scorer,
          forename: String(scorer.forename || '').trim(),
          surname: String(scorer.surname || '').trim(),
          goals: Number(scorer.goals) || 0,
          league: Number(scorer.league) || 0,
          fACup: Number(scorer.fACup) || 0,
          eFLCup: Number(scorer.eFLCup) || 0,
          eFLTrophy: Number(scorer.eFLTrophy) || 0
        })) : [];
      
      setFixtures(fixturesArray);
      setScorers(scorersArray);
      
      console.log('Loaded data:', {
        fixtures: fixturesArray.length,
        scorers: scorersArray.length
      });
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  // Calculate player statistics whenever fixtures or scorers change
  const playerStats = useMemo(() => {
    if (!fixtures.length && !scorers.length) return [];
    
    try {
      const calculator = new PlayerStatsCalculator(fixtures);
      return calculator.calculateAllStats();
    } catch (err) {
      console.error('Error calculating player stats:', err);
      setError('Failed to calculate player statistics');
      return [];
    }
  }, [fixtures, scorers]);

  // Calculate goal statistics from scorers data
  // Calculate goal statistics from scorers data
const goalStats = useMemo(() => {
  if (!scorers.length) return new Map();
  
  const goalMap = new Map();
  
  scorers.forEach(scorer => {
    if (!scorer.forename || !scorer.surname) return;
    
    // Create full name like "Mason Burstow"
    const fullName = `${scorer.forename} ${scorer.surname}`;
    const playerName = fullName.toLowerCase();
    
    const goalData = {
      total: scorer.goals || 0,
      league: scorer.league || 0,
      fACup: scorer.fACup || 0,
      eFLCup: scorer.eFLCup || 0,
      eFLTrophy: scorer.eFLTrophy || 0
    };
    
    goalMap.set(playerName, goalData);
  });
  
  console.log('Final goalMap entries:', Array.from(goalMap.entries()));
  return goalMap;
}, [scorers]);


  // Create a map for quick player lookup
  const playerStatsMap = useMemo(() => {
    const map = new Map();
    playerStats.forEach(player => {
      map.set(player.name.toLowerCase(), player);
    });
    return map;
  }, [playerStats]);

  // Helper function to get stats for a specific player
  const getPlayerStats = (playerName) => {
    if (!playerName) return null;
    
    const key = playerName.toLowerCase();
    return playerStatsMap.get(key) || null;
  };

  // Helper function to get goal summary
  const getPlayerGoalSummary = (playerName) => {
  if (!playerName) return { total: 0, league: 0, fACup: 0, eFLCup: 0, eFLTrophy: 0 };
  
  const key = playerName.toLowerCase();
  const result = goalStats.get(key) || { total: 0, league: 0, fACup: 0, eFLCup: 0, eFLTrophy: 0 };
  
  console.log(`Goal lookup for "${playerName}":`, result, 'Available keys:', Array.from(goalStats.keys()));
  
  return result;
};

  // Helper function to get appearance summary
  const getPlayerAppearanceSummary = (playerName) => {
    const stats = getPlayerStats(playerName);
    if (!stats) return { total: 0, starts: 0, substitutes: 0, starterPercentage: 0 };
    
    return {
      total: stats.totalAppearances,
      starts: stats.summary.totalStarts,
      substitutes: stats.summary.totalSubstitutes,
      starterPercentage: stats.totalAppearances > 0 
        ? Math.round((stats.summary.totalStarts / stats.totalAppearances) * 100) 
        : 0
    };
  };

  // Helper function to get disciplinary summary
  const getPlayerDisciplinarySummary = (playerName) => {
    const stats = getPlayerStats(playerName);
    if (!stats) return { yellow: 0, red: 0, total: 0 };
    
    return {
      yellow: stats.totalYellowCards,
      red: stats.totalRedCards,
      total: stats.totalYellowCards + stats.totalRedCards
    };
  };

  // Helper function to get competition breakdown
  const getPlayerCompetitionBreakdown = (playerName) => {
    const stats = getPlayerStats(playerName);
    if (!stats) return {};
    
    return stats.summary.byCompetition;
  };

  return {
    fixtures,
    scorers,
    playerStats,
    goalStats,
    loading,
    error,
    
    // Helper functions
    getPlayerStats,
    getPlayerGoalSummary,
    getPlayerAppearanceSummary,
    getPlayerDisciplinarySummary,
    getPlayerCompetitionBreakdown,
    
    // Metadata
    totalFixtures: fixtures.length,
    totalPlayers: playerStats.length,
  };
};

export default usePlayerStats;