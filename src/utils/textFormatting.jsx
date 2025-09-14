/**
 * Parse text with **bold** markdown syntax and convert to JSX elements
 * @param {string} text - The text to parse
 * @returns {Array} Array of JSX elements and strings
 */
export const parseBoldText = (text) => {
  if (!text) return text;
  
  // Split text by **bold** patterns
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is bold text (starts and ends with **)
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      // Remove the ** markers and wrap in <strong>
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-bold">{boldText}</strong>;
    }
    return part;
  });
};

/**
 * Parse text with **bold** markdown syntax for plain text (no JSX)
 * @param {string} text - The text to parse
 * @returns {string} Text with bold markers removed
 */
export const parseBoldTextPlain = (text) => {
  if (!text) return text;
  
  // Remove ** markers from bold text
  return text.replace(/\*\*([^*]+)\*\*/g, '$1');
};
