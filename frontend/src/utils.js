// Email validation
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation - at least 6 chars, mix of letters and numbers
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Strong password - 8+ chars, uppercase, lowercase, number
export const isStrongPassword = (password) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

// Phone validation - basic 10-15 digits
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// Address validation - at least 10 characters
export const isValidAddress = (address) => {
  const trimmed = (address || '').trim();
  return trimmed.length >= 10;
};

// Name validation - at least 2 characters
export const isValidName = (name) => {
  const trimmed = (name || '').trim();
  return trimmed.length >= 2;
};

// Price validation - positive number
export const isValidPrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0;
};

// Date validation - future date
export const isValidFutureDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

// Number of guests validation - at least 1
export const isValidGuestCount = (guests) => {
  const num = parseInt(guests);
  return !isNaN(num) && num > 0;
};
