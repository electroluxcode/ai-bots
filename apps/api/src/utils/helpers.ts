/**
 * Format error response
 * @param statusCode HTTP status code
 * @param message Error message
 * @param errors Additional error details
 * @returns Error response object
 */
export const formatErrorResponse = (
  statusCode: number,
  message: string,
  errors?: string[]
): { status: string; statusCode: number; message: string; errors?: string[] } => {
  return {
    status: 'error',
    statusCode,
    message,
    errors: errors && errors.length > 0 ? errors : undefined,
  };
};

/**
 * Format success response
 * @param data Response data
 * @param message Success message
 * @returns Success response object
 */
export const formatSuccessResponse = <T>(
  data: T,
  message = 'Operation successful'
): { status: string; message: string; data: T } => {
  return {
    status: 'success',
    message,
    data,
  };
};

/**
 * Check if string is valid JSON
 * @param str String to check
 * @returns boolean
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Generate random string
 * @param length Length of the string
 * @returns Random string
 */
export const generateRandomString = (length = 10): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}; 