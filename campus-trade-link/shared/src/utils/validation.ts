export const isStudentEmail = (email: string): boolean => {
  return email.endsWith('@st.ug.edu.gh');
};

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  if (!isValidImageFile(file)) {
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }
    return { isValid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};