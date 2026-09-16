import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

// List of known invalid icon names that should be mapped
const INVALID_ICON_MAP = {
  'diamond': 'shield-checkmark-outline',
  'diamond-outline': 'shield-checkmark-outline',
  'crown': 'trophy',
  'crown-outline': 'trophy-outline',
  // Add more invalid icon mappings as needed
};

// Wrapper component to ensure valid icons are always used
const SafeIonicons = ({ name, ...props }) => {
  // Check if the icon is valid
  if (Ionicons.glyphMap && Ionicons.glyphMap[name]) {
    // Icon is valid, use it directly
    return <Ionicons name={name} {...props} />;
  }
  
  // Icon is invalid, try to map it
  const hasKnownMapping = Object.prototype.hasOwnProperty.call(INVALID_ICON_MAP, name);
  const mappedName = hasKnownMapping ? INVALID_ICON_MAP[name] : 'shield-checkmark-outline';
  
  // Only warn about unknown names - known mappings are intentional
  if (!hasKnownMapping) {
    console.warn(`Icon "${name}" is not valid, using "${mappedName}" instead`);
  }
  
  return <Ionicons name={mappedName} {...props} />;
};

export default SafeIonicons;
