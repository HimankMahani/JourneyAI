/**
 * Service for handling MongoDB storage of AI responses
 */
import AIResponse from '../models/AIResponse.js';
import Trip from '../models/Trip.js';
import mongoose from 'mongoose';

/**
 * Store AI response to MongoDB
 * @param {string} tripId - The trip ID
 * @param {string} userId - The user ID  
 * @param {string} response - The AI response text
 * @param {string} type - Type of response (itinerary, tips, etc.)
 * @param {Object} metadata - Additional metadata to store
 * @returns {Promise<Object>} - The stored AIResponse document
 */
export const storeAIResponse = async (tripId, userId, response, type = 'itinerary', metadata = {}) => {
  try {
    
    const aiResponse = new AIResponse({
      tripId: new mongoose.Types.ObjectId(tripId),
      userId: new mongoose.Types.ObjectId(userId),
      type,
      rawResponse: response,
      metadata,
      status: 'completed'
    });
    
    const savedResponse = await aiResponse.save();
    
    return savedResponse;
  } catch (error) {
    console.error('Error storing AI response:', error);
    throw error;
  }
};

/**
 * Retrieve AI response from MongoDB
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response (itinerary, tips, etc.)
 * @param {string} responseId - Specific response ID (optional, will get latest if not provided)
 * @returns {Promise<Object|null>} - The stored AIResponse document or null if not found
 */
export const retrieveAIResponse = async (tripId, type = 'itinerary', responseId = null) => {
  try {
    
    let aiResponse;
    
    if (responseId) {
      aiResponse = await AIResponse.findById(responseId);
    } else {
      aiResponse = await AIResponse.getLatest(tripId, type);
    }
    
    if (aiResponse) {
      return aiResponse;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving AI response:', error);
    return null;
  }
};

/**
 * List all AI response documents for a trip
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response (optional, will return all types if not specified)
 * @returns {Array} - Array of AIResponse document summaries
 */
export const listAIResponses = async (tripId, type = null) => {
  try {
    
    const aiResponses = await AIResponse.getAllVersions(tripId, type);
    
    return aiResponses.map(response => ({
      id: response._id,
      type: response.type,
      createdAt: response.createdAt,
      status: response.status,
      version: response.version,
      size: response.rawResponse ? response.rawResponse.length : 0
    }));
  } catch (error) {
    console.error('Error listing AI responses:', error);
    return [];
  }
};

/**
 * Clean up old AI response documents (keep only the latest N documents per trip/type)
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response
 * @param {number} keepCount - Number of documents to keep (default: 3)
 * @returns {Promise<number>} - Number of documents deleted
 */
export const cleanupOldAIResponses = async (tripId, type = 'itinerary', keepCount = 3) => {
  try {
    
    const deletedCount = await AIResponse.cleanupOldVersions(tripId, type, keepCount);
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old AI responses:', error);
    return 0;
  }
};

/**
 * Get storage statistics from MongoDB
 * @returns {Object} - Storage statistics
 */
export const getStorageStats = async () => {
  try {
    
    // Get total count of AI responses
    const totalResponses = await AIResponse.countDocuments();
    
    // Get count by type
    const typeStats = await AIResponse.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgSize: { $avg: { $strLenCP: '$rawResponse' } }
        }
      }
    ]);
    
    // Get total size estimation (rough calculation based on string length)
    const sizeStats = await AIResponse.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: { $strLenCP: '$rawResponse' } },
          avgSize: { $avg: { $strLenCP: '$rawResponse' } }
        }
      }
    ]);
    
    // Get recent activity
    const recentResponses = await AIResponse.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('tripId type createdAt status')
      .populate('tripId', 'title destination');
    
    const stats = {
      totalResponses,
      totalSizeMB: sizeStats[0] ? (sizeStats[0].totalSize / (1024 * 1024)).toFixed(2) : 0,
      avgSizeKB: sizeStats[0] ? (sizeStats[0].avgSize / 1024).toFixed(2) : 0,
      typeBreakdown: typeStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          avgSizeKB: (stat.avgSize / 1024).toFixed(2)
        };
        return acc;
      }, {}),
      recentActivity: recentResponses,
      storageType: 'MongoDB',
      collectionName: 'airesponses'
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalResponses: 0,
      totalSizeMB: 0,
      avgSizeKB: 0,
      typeBreakdown: {},
      recentActivity: [],
      storageType: 'MongoDB',
      collectionName: 'airesponses',
      error: error.message
    };
  }
};


