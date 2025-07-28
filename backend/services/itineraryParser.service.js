/**
 * Service for parsing AI responses and handling itinerary data
 */

/**
 * Parse AI-generated JSON itinerary response
 * @param {string} jsonText - The JSON text from AI
 * @param {string} startDate - The start date of the trip
 * @returns {Array} - Parsed itinerary array
 */
export const parseItineraryJSON = (jsonText, startDate) => {
  try {
    // Clean up the text to extract just the JSON part
    let cleanText = jsonText.trim();
    
    // Remove any markdown formatting
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find the JSON array start and end
    const jsonStart = cleanText.indexOf('[');
    const jsonEnd = cleanText.lastIndexOf(']');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON array found in response');
    }
    
    let jsonOnly = cleanText.substring(jsonStart, jsonEnd + 1);
    
    // Handle incomplete JSON by trying to fix common issues
    if (!jsonOnly.endsWith(']')) {
      // Find the last complete object
      let lastCompleteObject = jsonOnly.lastIndexOf('    }');
      if (lastCompleteObject !== -1) {
        // Find the activity array closing
        let activityArrayEnd = jsonOnly.lastIndexOf('    ]', lastCompleteObject);
        if (activityArrayEnd !== -1) {
          // Find the day object closing
          let dayObjectEnd = jsonOnly.indexOf('  }', activityArrayEnd);
          if (dayObjectEnd !== -1) {
            jsonOnly = jsonOnly.substring(0, dayObjectEnd + 3) + '\n]';
          }
        }
      }
    }
    
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonOnly);
    } catch (parseError) {
      console.error('JSON parsing failed, attempting to fix truncated JSON:', parseError.message);
      
      // Try to fix common truncation issues
      let fixedJson = jsonOnly.trim();
      
      // If the JSON ends mid-object, try to close it properly
      if (!fixedJson.endsWith(']')) {
        // Count open braces and brackets to determine what needs closing
        let openBraces = 0;
        let openBrackets = 0;
        let inString = false;
        let escaped = false;
        
        for (let i = 0; i < fixedJson.length; i++) {
          const char = fixedJson[i];
          
          if (escaped) {
            escaped = false;
            continue;
          }
          
          if (char === '\\') {
            escaped = true;
            continue;
          }
          
          if (char === '"') {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
            else if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;
          }
        }
        
        
        // Close any open objects/arrays
        while (openBraces > 0) {
          fixedJson += '}';
          openBraces--;
        }
        while (openBrackets > 0) {
          fixedJson += ']';
          openBrackets--;
        }
        
        try {
          parsedData = JSON.parse(fixedJson);
        } catch (fixError) {
          console.error('Failed to parse fixed JSON:', fixError.message);
          throw new Error(`JSON parsing failed even after attempted fix: ${parseError.message}`);
        }
      } else {
        throw parseError;
      }
    }
    
    // Validate and normalize the parsed data
    if (!Array.isArray(parsedData)) {
      throw new Error('Parsed data is not an array');
    }
    
    // Process each day to ensure proper structure
    const processedItinerary = parsedData.map((day, index) => {
      // Calculate proper date for each day
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + index);
      
      return {
        day: day.day || (index + 1),
        date: dayDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        activities: (day.activities || []).map(activity => {
          // Normalize activity type to match enum values
          let normalizedType = activity.category || activity.type || 'activity';
          const originalType = normalizedType;
          const lowerType = normalizedType.toLowerCase().trim();
          
          // Map common variations to valid enum values
          const typeMapping = {
            'sightseeing': 'sightseeing',
            'sight-seeing': 'sightseeing',
            'touring': 'sightseeing',
            'visit': 'sightseeing',
            'exploring': 'sightseeing',
            'attraction': 'sightseeing',
            'monument': 'sightseeing',
            'museum': 'sightseeing',
            'cultural': 'sightseeing',
            'heritage': 'sightseeing',
            'historical': 'sightseeing',
            
            'food': 'food',
            'dining': 'food',
            'restaurant': 'food',
            'eating': 'food',
            'meal': 'food',
            'lunch': 'food',
            'dinner': 'food',
            'breakfast': 'food',
            'cuisine': 'food',
            
            'accommodation': 'accommodation',
            'hotel': 'accommodation',
            'stay': 'accommodation',
            'lodging': 'accommodation',
            'check-in': 'accommodation',
            'check-out': 'accommodation',
            
            'transportation': 'transportation',
            'transport': 'transportation',
            'travel': 'transportation',
            'transfer': 'transportation',
            'taxi': 'transportation',
            'bus': 'transportation',
            'train': 'transportation',
            'metro': 'transportation',
            'flight': 'transportation',
            
            'activity': 'activity',
            'adventure': 'activity',
            'experience': 'activity',
            'tour': 'activity',
            'recreation': 'activity',
            'sport': 'activity',
            'outdoor': 'activity',
            'nature': 'activity',
            'park': 'activity',
            'garden': 'activity',
            'shopping': 'activity',
            'walk': 'activity',
            'relaxation': 'activity',
            'wellness': 'activity',
            'spa': 'activity',
            
            'nightlife': 'nightlife',
            'night': 'nightlife',
            'bar': 'nightlife',
            'club': 'nightlife',
            'entertainment': 'nightlife',
            'show': 'nightlife',
            
            'other': 'other',
            'misc': 'other',
            'miscellaneous': 'other'
          };
          
          normalizedType = typeMapping[lowerType] || 'activity';
          
          // Debug logging for type normalization
          if (originalType !== normalizedType) {
          }
          
          // Sanitize location: convert object to string if needed
          let locationValue = activity.location;
          if (typeof locationValue === 'object' && locationValue !== null) {
            locationValue = [locationValue.name, locationValue.address].filter(Boolean).join(', ');
          }
          if (typeof locationValue !== 'string') {
            locationValue = String(locationValue || 'TBD');
          }

          // Sanitize cost: convert string with currency to number
          let costValue = activity.cost;
          if (typeof costValue === 'string') {
            const numeric = costValue.replace(/[^0-9.]/g, '');
            costValue = Number(numeric) || 0;
          }
          if (typeof costValue !== 'number') {
            costValue = 0;
          }
          
          return {
            activity: activity.activity || activity.title || 'Untitled Activity',
            description: activity.description || '',
            category: normalizedType,
            time: activity.time || '09:00',
            duration: activity.duration || '1 hour',
            cost: costValue,
            location: locationValue
          };
        })
      };
    });
    
    return processedItinerary;
    
  } catch (error) {
    console.error('Error parsing JSON itinerary:', error);
    console.error('JSON text length:', jsonText.length);
    console.error('JSON text preview:', jsonText.substring(0, 500) + '...');
    throw error;
  }
};

/**
 * Parse AI-generated itinerary text into structured data (fallback method)
 * @param {string} text - The text from AI
 * @param {string} startDate - The start date of the trip
 * @returns {Array} - Parsed itinerary array
 */
export const parseItineraryText = (text, startDate) => {
  try {
    const itinerary = [];
    const lines = text.split('\n');

    let currentDay = null;
    let currentDate = new Date(startDate);

    for (const line of lines) {
      // Look for day indicators like "Day 1:", "Day 2:", etc.
      const dayMatch = line.match(/day\s+(\d+)[:\s-]/i);
      
      if (dayMatch) {
        const dayNumber = parseInt(dayMatch[1]);
        
        // Create a new day entry
        currentDay = {
          day: dayNumber,
          date: new Date(currentDate),
          activities: []
        };
        
        // Add days to the current date for subsequent days
        if (itinerary.length === 0) {
          // First day, use the startDate
          currentDay.date = new Date(startDate);
        } else {
          // For each new day, add a day to the previous date
          currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + (dayNumber - 1));
          currentDay.date = new Date(currentDate);
        }
        
        itinerary.push(currentDay);
        continue;
      }

      // If we have a current day, look for activities
      if (currentDay) {
        // Simple pattern matching for activities
        // Time pattern like "9:00 AM", "14:30", etc.
        const timeMatch = line.match(/(\d{1,2}:\d{2}(?:\s*(?:AM|PM)?)?)/i);
        
        if (timeMatch && line.trim().length > 5) {
          const activity = {
            activity: line.trim(),
            time: timeMatch[1],
            category: categorizeActivity(line),
            description: '',
            duration: '1 hour',
            cost: '₹0'
          };
          
          // Extract any location information (simple approach)
          const locationMatch = line.match(/at\s+([^,\.]+)/i);
          if (locationMatch) {
            activity.location = { 
              name: locationMatch[1].trim(),
              address: ''
            };
          } else {
            activity.location = { name: 'TBD', address: '' };
          }
          
          currentDay.activities.push(activity);
        }
      }
    }

    return itinerary;
  } catch (error) {
    console.error("Error parsing itinerary text:", error);
    return [];
  }
};

/**
 * Simple function to categorize activities based on keywords
 * @param {string} activityText - The activity text to categorize
 * @returns {string} - The category
 */
export const categorizeActivity = (activityText) => {
  const text = activityText.toLowerCase();
  
  if (text.includes('breakfast') || text.includes('lunch') || text.includes('dinner') || 
      text.includes('restaurant') || text.includes('café') || text.includes('cafe')) {
    return 'food';
  }
  
  if (text.includes('hotel') || text.includes('check-in') || text.includes('check-out') ||
      text.includes('accommodation') || text.includes('hostel') || text.includes('airbnb')) {
    return 'accommodation';
  }
  
  if (text.includes('flight') || text.includes('airport') || text.includes('train') ||
      text.includes('bus') || text.includes('taxi') || text.includes('transfer')) {
    return 'transportation';
  }
  
  if (text.includes('museum') || text.includes('landmark') || text.includes('monument') ||
      text.includes('tour') || text.includes('visit') || text.includes('explore')) {
    return 'sightseeing';
  }
  
  return 'activity';
};

/**
 * Parse AI response from stored MongoDB data
 * @param {Object} storedData - The AIResponse document from MongoDB
 * @param {string} startDate - The start date of the trip
 * @returns {Array} - Parsed itinerary array
 */
export const parseStoredAIResponse = (storedData, startDate) => {
  if (!storedData || !storedData.rawResponse) {
    console.error('No stored AI response data found');
    return [];
  }
  
  try {
    // Try JSON parsing first (preferred method)
    return parseItineraryJSON(storedData.rawResponse, startDate);
  } catch (jsonError) {
    console.error('JSON parsing failed, trying text parsing:', jsonError.message);
    
    try {
      // Fall back to text parsing
      return parseItineraryText(storedData.rawResponse, startDate);
    } catch (textError) {
      console.error('Text parsing also failed:', textError.message);
      return [];
    }
  }
};

/**
 * Validate itinerary data structure
 * @param {Array} itinerary - The itinerary array to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateItinerary = (itinerary) => {
  const errors = [];
  
  if (!Array.isArray(itinerary)) {
    return { isValid: false, errors: ['Itinerary must be an array'] };
  }
  
  if (itinerary.length === 0) {
    return { isValid: false, errors: ['Itinerary cannot be empty'] };
  }
  
  itinerary.forEach((day, dayIndex) => {
    if (!day.day || typeof day.day !== 'number') {
      errors.push(`Day ${dayIndex + 1}: Missing or invalid day number`);
    }
    
    if (!day.date) {
      errors.push(`Day ${dayIndex + 1}: Missing date`);
    }
    
    if (!Array.isArray(day.activities)) {
      errors.push(`Day ${dayIndex + 1}: Activities must be an array`);
    } else {
      day.activities.forEach((activity, activityIndex) => {
        if (!activity.activity && !activity.title) {
          errors.push(`Day ${dayIndex + 1}, Activity ${activityIndex + 1}: Missing activity title`);
        }
        
        if (!activity.type) {
          errors.push(`Day ${dayIndex + 1}, Activity ${activityIndex + 1}: Missing type`);
        }
        
        if (!activity.time) {
          errors.push(`Day ${dayIndex + 1}, Activity ${activityIndex + 1}: Missing time`);
        }
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Normalize itinerary data to ensure all required fields are present
 * @param {Array} itinerary - The itinerary array to normalize
 * @param {string} startDate - The start date for calculating dates
 * @returns {Array} - Normalized itinerary array
 */
export const normalizeItinerary = (itinerary, startDate) => {
  if (!Array.isArray(itinerary)) {
    return [];
  }
  
  return itinerary.map((day, index) => {
    // Calculate proper date for each day
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + index);
    
    return {
      day: day.day || (index + 1),
      date: day.date || dayDate.toISOString().split('T')[0],
      activities: (day.activities || []).map(activity => {
        // Normalize activity type to match enum values in Trip schema
        let normalizedType = activity.category || activity.type || 'activity';
        
        // Convert to lowercase for comparison
        const lowerType = normalizedType.toLowerCase().trim();
        
        // Map common variations to valid enum values
        const typeMapping = {
          'sightseeing': 'sightseeing',
          'sight-seeing': 'sightseeing',
          'touring': 'sightseeing',
          'visit': 'sightseeing',
          'exploring': 'sightseeing',
          'attraction': 'sightseeing',
          'monument': 'sightseeing',
          'museum': 'sightseeing',
          'cultural': 'sightseeing',
          'heritage': 'sightseeing',
          'historical': 'sightseeing',
          
          'food': 'food',
          'dining': 'food',
          'restaurant': 'food',
          'eating': 'food',
          'meal': 'food',
          'lunch': 'food',
          'dinner': 'food',
          'breakfast': 'food',
          'cuisine': 'food',
          
          'accommodation': 'accommodation',
          'hotel': 'accommodation',
          'stay': 'accommodation',
          'lodging': 'accommodation',
          'check-in': 'accommodation',
          'check-out': 'accommodation',
          
          'transportation': 'transportation',
          'transport': 'transportation',
          'travel': 'transportation',
          'transfer': 'transportation',
          'taxi': 'transportation',
          'bus': 'transportation',
          'train': 'transportation',
          'metro': 'transportation',
          'flight': 'transportation',
          
          'activity': 'activity',
          'adventure': 'activity',
          'experience': 'activity',
          'tour': 'activity',
          'recreation': 'activity',
          'sport': 'activity',
          'outdoor': 'activity',
          'nature': 'activity',
          'park': 'activity',
          'garden': 'activity',
          'shopping': 'activity',
          'walk': 'activity',
          'relaxation': 'activity',
          'wellness': 'activity',
          'spa': 'activity',
          
          'nightlife': 'nightlife',
          'night': 'nightlife',
          'bar': 'nightlife',
          'club': 'nightlife',
          'entertainment': 'nightlife',
          'show': 'nightlife',
          
          'other': 'other',
          'misc': 'other',
          'miscellaneous': 'other'
        };
        
        // Find matching type or default to 'activity'
        normalizedType = typeMapping[lowerType] || 'activity';
        
        // Final validation - ensure it's in the valid enum values
        const validTypes = ['sightseeing', 'food', 'accommodation', 'transportation', 'activity', 'nightlife', 'other'];
        if (!validTypes.includes(normalizedType)) {
          normalizedType = 'activity';
        }
        
        // Sanitize location: convert object to string if needed
        let locationValue = activity.location;
        if (typeof locationValue === 'object' && locationValue !== null) {
          locationValue = [locationValue.name, locationValue.address].filter(Boolean).join(', ');
        }
        if (typeof locationValue !== 'string') {
          locationValue = String(locationValue || 'TBD');
        }

        // Sanitize cost: convert string with currency to number
        let costValue = activity.cost;
        if (typeof costValue === 'string') {
          const numeric = costValue.replace(/[^0-9.]/g, '');
          costValue = Number(numeric) || 0;
        }
        if (typeof costValue !== 'number') {
          costValue = 0;
        }
        
        return {
          activity: activity.activity || activity.title || 'Untitled Activity',
          description: activity.description || '',
          category: normalizedType,
          time: activity.time || '09:00',
          duration: activity.duration || '1 hour',
          cost: costValue,
          location: locationValue
        };
      })
    };
  });
};
