import React, { useState, useEffect, useCallback } from 'react';
import { useTripContext } from '../contexts/useTripContext';
import './Debug.css';

const Debug = () => {
  const tripContext = useTripContext();
  const { 
    trips = [], 
    getStorageStats, 
    getAIResponses, 
    reparseItinerary 
  } = tripContext || {};
  
  const [storageStats, setStorageStats] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [aiFiles, setAiFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadStorageStats = useCallback(async () => {
    if (!getStorageStats) {
      console.warn('getStorageStats is not available yet');
      return;
    }
    try {
      const result = await getStorageStats();
      if (result.success) {
        setStorageStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  }, [getStorageStats]);

  // Load storage stats on mount
  useEffect(() => {
    loadStorageStats();
  }, [loadStorageStats]);

  const loadAIFiles = async (tripId) => {
    if (!tripId || !getAIResponses) return;
    
    try {
      setLoading(true);
      const result = await getAIResponses(tripId);
      if (result.success) {
        setAiFiles(result.data.responses || []);
      }
    } catch (error) {
      console.error('Failed to load AI responses:', error);
      setAiFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReparseItinerary = async (tripId) => {
    if (!tripId || !reparseItinerary) return;
    
    try {
      setLoading(true);
      setMessage('Reparsing itinerary from stored MongoDB document...');
      
      const result = await reparseItinerary(tripId);
      if (result.success) {
        setMessage('✅ Itinerary reparsed successfully!');
        await loadAIFiles(tripId); // Refresh response list
      } else {
        setMessage(`❌ Failed to reparse: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTripSelect = (tripId) => {
    setSelectedTrip(tripId);
    loadAIFiles(tripId);
  };

  return (
    <div className="debug-panel">
      <h2>🔧 MongoDB Storage Debug Panel</h2>
      
      {/* Storage Statistics */}
      <div className="debug-section">
        <h3>📊 Storage Statistics</h3>
        {storageStats ? (
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Records:</span>
              <span className="stat-value">{storageStats.totalResponses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Size:</span>
              <span className="stat-value">{storageStats.totalSizeMB} MB</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Storage Type:</span>
              <span className="stat-value small">{storageStats.storageType}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Collection:</span>
              <span className="stat-value small">{storageStats.collectionName}</span>
            </div>
          </div>
        ) : (
          <p>Loading storage stats...</p>
        )}
        <button onClick={loadStorageStats} className="btn-secondary">
          🔄 Refresh Stats
        </button>
      </div>

      {/* Trip Selection */}
      <div className="debug-section">
        <h3>🗂️ Trip Files</h3>
        <div className="trip-selector">
          <label htmlFor="trip-select">Select a trip:</label>
          <select 
            id="trip-select"
            value={selectedTrip} 
            onChange={(e) => handleTripSelect(e.target.value)}
            className="select-input"
          >
            <option value="">-- Select Trip --</option>
            {trips.map(trip => (
              <option key={trip._id} value={trip._id}>
                {trip.title} ({trip.destination?.name || 'Unknown'})
              </option>
            ))}
          </select>
        </div>

        {selectedTrip && (
          <div className="trip-actions">
            <button 
              onClick={() => handleReparseItinerary(selectedTrip)}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? '⏳ Reparsing...' : '🔄 Reparse Itinerary'}
            </button>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      {/* AI Files List */}
      {selectedTrip && (
        <div className="debug-section">
          <h3>📁 AI Response Records</h3>
          {loading ? (
            <p>Loading responses...</p>
          ) : aiFiles.length > 0 ? (
            <div className="response-list">
              {aiFiles.map((response, index) => (
                <div key={index} className="response-item">
                  <span className="response-name">
                    {response.type} - {new Date(response.createdAt).toLocaleDateString()}
                  </span>
                  <span className="response-info">
                    {response.type === 'itinerary' ? '📋 Itinerary' : '💡 Tips'} • {(response.size / 1024).toFixed(1)}KB
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No AI response records found for this trip.</p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="debug-section">
        <h3>ℹ️ How to Test</h3>
        <ol className="instructions">
          <li>Create a new trip using the AI generator</li>
          <li>Select the trip from the dropdown above</li>
          <li>View the AI response records that were created in MongoDB</li>
          <li>Use "Reparse Itinerary" to reprocess the stored AI response from MongoDB</li>
          <li>Check that the itinerary is correctly parsed and displayed</li>
        </ol>
      </div>
    </div>
  );
};

export default Debug;
