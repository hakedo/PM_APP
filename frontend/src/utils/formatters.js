// Utility function to format phone numbers
export const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedNumber = phoneNumber.slice(0, 10);
  
  // Format based on length
  if (limitedNumber.length < 4) {
    return limitedNumber;
  } else if (limitedNumber.length < 7) {
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
  } else {
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
  }
};
