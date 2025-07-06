/**
 * Service for handling file storage of AI responses
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage directory for AI responses
const STORAGE_DIR = path.join(__dirname, '..', 'storage', 'ai-responses');

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('Created storage directory:', STORAGE_DIR);
  }
}

/**
 * Generate filename for AI response based on trip ID
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response (itinerary, tips, etc.)
 * @returns {string} - The filename
 */
function generateFilename(tripId, type = 'itinerary') {
  return `${tripId}_${type}_${Date.now()}.json`;
}

/**
 * Get the latest filename for a specific trip and type
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response (itinerary, tips, etc.)
 * @returns {string|null} - The latest filename or null if not found
 */
function getLatestFilename(tripId, type = 'itinerary') {
  ensureStorageDir();
  
  try {
    const files = fs.readdirSync(STORAGE_DIR);
    const pattern = new RegExp(`^${tripId}_${type}_\\d+\\.json$`);
    
    const matchingFiles = files
      .filter(file => pattern.test(file))
      .sort((a, b) => {
        // Extract timestamp from filename and sort by newest first
        const timestampA = parseInt(a.split('_')[2].replace('.json', ''));
        const timestampB = parseInt(b.split('_')[2].replace('.json', ''));
        return timestampB - timestampA;
      });
    
    return matchingFiles.length > 0 ? matchingFiles[0] : null;
  } catch (error) {
    console.error('Error getting latest filename:', error);
    return null;
  }
}

/**
 * Store AI response to file
 * @param {string} tripId - The trip ID
 * @param {string} response - The AI response text
 * @param {string} type - Type of response (itinerary, tips, etc.)
 * @param {Object} metadata - Additional metadata to store
 * @returns {Promise<string>} - The filename where the response was stored
 */
export const storeAIResponse = async (tripId, response, type = 'itinerary', metadata = {}) => {
  try {
    ensureStorageDir();
    
    const filename = generateFilename(tripId, type);
    const filepath = path.join(STORAGE_DIR, filename);
    
    const dataToStore = {
      tripId,
      type,
      timestamp: Date.now(),
      response: response,
      metadata,
      createdAt: new Date().toISOString()
    };
    
    await fs.promises.writeFile(filepath, JSON.stringify(dataToStore, null, 2), 'utf8');
    console.log(`Stored AI response to file: ${filename}`);
    
    return filename;
  } catch (error) {
    console.error('Error storing AI response:', error);
    throw error;
  }
};

/**
 * Retrieve AI response from file
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response (itinerary, tips, etc.)
 * @param {string} filename - Specific filename (optional, will get latest if not provided)
 * @returns {Promise<Object|null>} - The stored data or null if not found
 */
export const retrieveAIResponse = async (tripId, type = 'itinerary', filename = null) => {
  try {
    ensureStorageDir();
    
    const fileToRead = filename || getLatestFilename(tripId, type);
    
    if (!fileToRead) {
      console.log(`No AI response file found for trip ${tripId} type ${type}`);
      return null;
    }
    
    const filepath = path.join(STORAGE_DIR, fileToRead);
    
    if (!fs.existsSync(filepath)) {
      console.log(`AI response file does not exist: ${filepath}`);
      return null;
    }
    
    const fileContent = await fs.promises.readFile(filepath, 'utf8');
    const data = JSON.parse(fileContent);
    
    console.log(`Retrieved AI response from file: ${fileToRead}`);
    return data;
  } catch (error) {
    console.error('Error retrieving AI response:', error);
    return null;
  }
};

/**
 * List all AI response files for a trip
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response (optional, will return all types if not specified)
 * @returns {Array} - Array of filenames
 */
export const listAIResponseFiles = (tripId, type = null) => {
  try {
    ensureStorageDir();
    
    const files = fs.readdirSync(STORAGE_DIR);
    let pattern;
    
    if (type) {
      pattern = new RegExp(`^${tripId}_${type}_\\d+\\.json$`);
    } else {
      pattern = new RegExp(`^${tripId}_\\w+_\\d+\\.json$`);
    }
    
    return files
      .filter(file => pattern.test(file))
      .sort((a, b) => {
        // Sort by timestamp descending (newest first)
        const timestampA = parseInt(a.split('_')[2].replace('.json', ''));
        const timestampB = parseInt(b.split('_')[2].replace('.json', ''));
        return timestampB - timestampA;
      });
  } catch (error) {
    console.error('Error listing AI response files:', error);
    return [];
  }
};

/**
 * Delete AI response file
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response
 * @param {string} filename - Specific filename (optional, will delete latest if not provided)
 * @returns {Promise<boolean>} - Success status
 */
export const deleteAIResponse = async (tripId, type = 'itinerary', filename = null) => {
  try {
    ensureStorageDir();
    
    const fileToDelete = filename || getLatestFilename(tripId, type);
    
    if (!fileToDelete) {
      console.log(`No AI response file found to delete for trip ${tripId} type ${type}`);
      return false;
    }
    
    const filepath = path.join(STORAGE_DIR, fileToDelete);
    
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
      console.log(`Deleted AI response file: ${fileToDelete}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting AI response:', error);
    return false;
  }
};

/**
 * Clean up old AI response files (keep only the latest N files per trip/type)
 * @param {string} tripId - The trip ID
 * @param {string} type - Type of response
 * @param {number} keepCount - Number of files to keep (default: 3)
 * @returns {Promise<number>} - Number of files deleted
 */
export const cleanupOldAIResponses = async (tripId, type = 'itinerary', keepCount = 3) => {
  try {
    const files = listAIResponseFiles(tripId, type);
    
    if (files.length <= keepCount) {
      return 0; // Nothing to clean up
    }
    
    const filesToDelete = files.slice(keepCount); // Keep first N files (newest)
    let deletedCount = 0;
    
    for (const filename of filesToDelete) {
      const success = await deleteAIResponse(tripId, type, filename);
      if (success) {
        deletedCount++;
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old AI response files for trip ${tripId} type ${type}`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old AI responses:', error);
    return 0;
  }
};

/**
 * Get storage directory statistics
 * @returns {Object} - Storage statistics
 */
export const getStorageStats = () => {
  try {
    ensureStorageDir();
    
    const files = fs.readdirSync(STORAGE_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      const filepath = path.join(STORAGE_DIR, file);
      const stats = fs.statSync(filepath);
      totalSize += stats.size;
    }
    
    return {
      totalFiles: files.length,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      storageDir: STORAGE_DIR
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalFiles: 0,
      totalSizeBytes: 0,
      totalSizeMB: '0.00',
      storageDir: STORAGE_DIR
    };
  }
};
