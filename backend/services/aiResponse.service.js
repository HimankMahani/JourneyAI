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
    console.log(`Storing AI response for trip ${tripId}, user ${userId}, type ${type}`);
    
    const aiResponse = new AIResponse({
      tripId: new mongoose.Types.ObjectId(tripId),
      userId: new mongoose.Types.ObjectId(userId),
      type,
      rawResponse: response,
      metadata,
      status: 'completed'
    });
    
    const savedResponse = await aiResponse.save();
    console.log(`Stored AI response with ID: ${savedResponse._id}`);
    
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
    console.log(`Retrieving AI response for trip ${tripId}, type ${type}`);
    
    let aiResponse;
    
    if (responseId) {
      aiResponse = await AIResponse.findById(responseId);
    } else {
      aiResponse = await AIResponse.getLatest(tripId, type);
    }
    
    if (aiResponse) {
      console.log(`Retrieved AI response with ID: ${aiResponse._id}`);
      return aiResponse;
    } else {
      console.log(`No AI response found for trip ${tripId}, type ${type}`);
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
    console.log(`Listing AI responses for trip ${tripId}, type ${type || 'all'}`);
    
    const aiResponses = await AIResponse.getAllVersions(tripId, type);
    
    console.log(`Found ${aiResponses.length} AI responses for trip ${tripId}`);
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
 * Delete AI response document
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response
 * @param {string} responseId - Specific response ID (optional, will delete latest if not provided)
 * @returns {Promise<boolean>} - Success status
 */
export const deleteAIResponse = async (tripId, type = 'itinerary', responseId = null) => {
  try {
    console.log(`Deleting AI response for trip ${tripId}, type ${type}`);
    
    let result;
    
    if (responseId) {
      result = await AIResponse.findByIdAndDelete(responseId);
    } else {
      const latestResponse = await AIResponse.getLatest(tripId, type);
      if (latestResponse) {
        result = await AIResponse.findByIdAndDelete(latestResponse._id);
      }
    }
    
    if (result) {
      console.log(`Deleted AI response with ID: ${result._id}`);
      return true;
    } else {
      console.log(`No AI response found to delete for trip ${tripId}, type ${type}`);
      return false;
    }
  } catch (error) {
    console.error('Error deleting AI response:', error);
    return false;
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
    console.log(`Cleaning up old AI responses for trip ${tripId}, type ${type}, keeping ${keepCount}`);
    
    const deletedCount = await AIResponse.cleanupOldVersions(tripId, type, keepCount);
    
    console.log(`Cleaned up ${deletedCount} old AI response documents for trip ${tripId} type ${type}`);
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
    console.log('Getting storage statistics from MongoDB');
    
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
    
    console.log('Storage statistics:', stats);
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

/**
 * Store parsed itinerary data along with raw response
 * @param {string} responseId - The AI response ID
 * @param {Array} parsedData - The parsed itinerary data
 * @returns {Promise<boolean>} - Success status
 */
export const storeParsedData = async (responseId, parsedData) => {
  try {
    console.log(`Storing parsed data for AI response ${responseId}`);
    
    const result = await AIResponse.findByIdAndUpdate(
      responseId,
      { 
        parsedData,
        status: 'completed'
      },
      { new: true }
    );
    
    if (result) {
      console.log(`Stored parsed data for AI response ${responseId}`);
      return true;
    } else {
      console.log(`AI response ${responseId} not found`);
      return false;
    }
  } catch (error) {
    console.error('Error storing parsed data:', error);
    return false;
  }
};

/**
 * Mark AI response as failed with error message
 * @param {string} responseId - The AI response ID
 * @param {string} errorMessage - The error message
 * @returns {Promise<boolean>} - Success status
 */
export const markAIResponseFailed = async (responseId, errorMessage) => {
  try {
    console.log(`Marking AI response ${responseId} as failed`);
    
    const result = await AIResponse.findByIdAndUpdate(
      responseId,
      { 
        status: 'failed',
        errorMessage
      },
      { new: true }
    );
    
    if (result) {
      console.log(`Marked AI response ${responseId} as failed`);
      return true;
    } else {
      console.log(`AI response ${responseId} not found`);
      return false;
    }
  } catch (error) {
    console.error('Error marking AI response as failed:', error);
    return false;
  }
};
