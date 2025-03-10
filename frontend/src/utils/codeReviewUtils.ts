import brain from 'brain';

export interface ReviewRequest {
  filePath?: string;
  code?: string;
  language?: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  issues?: string[];
  suggestions?: string[];
  review?: string;
  fixed_code?: string;
  error?: string;
}

/**
 * Review code for issues
 */
export const reviewCode = async (request: ReviewRequest): Promise<ReviewResponse> => {
  try {
    // Use direct file path review if provided, otherwise use the code review API
    if (request.filePath) {
      const response = await brain.check_module({
        module_path: request.filePath, 
        check_type: "all"
      });
      const data = await response.json();
      return {
        success: data.success,
        message: data.message,
        issues: data.issues || [],
        suggestions: []
      };
    } else if (request.code) {
      const response = await brain.review_code({
        code: request.code,
        language: request.language || 'typescript',
        fix: false
      });
      const data = await response.json();
      return {
        success: data.success,
        message: data.message,
        issues: data.issues || [],
        suggestions: [],
        review: data.message,
        error: data.error
      };
    } else {
      return {
        success: false,
        message: "No file path or code provided",
        issues: ["No file path or code provided"]
      };
    }
  } catch (error) {
    console.error("Error reviewing code:", error);
    return {
      success: false,
      message: `Error: ${error.message || "Unknown error"}`,
      issues: [error.message || "Unknown error"]
    };
  }
};

/**
 * Fix code issues
 */
export const fixCode = async (request: ReviewRequest): Promise<ReviewResponse> => {
  try {
    if (request.filePath) {
      const response = await brain.fix_module({
        module_path: request.filePath,
        check_type: "all"
      });
      const data = await response.json();
      return {
        success: data.success,
        message: data.message,
        issues: data.issues || [],
        suggestions: []
      };
    } else if (request.code) {
      const response = await brain.review_code({
        code: request.code,
        language: request.language || 'typescript',
        fix: true
      });
      const data = await response.json();
      return {
        success: data.success,
        message: data.message,
        issues: data.issues || [],
        fixed_code: data.fixed_code,
        error: data.error
      };
    } else {
      return {
        success: false,
        message: "No file path or code provided",
        issues: ["No file path or code provided"]
      };
    }
  } catch (error) {
    console.error("Error fixing code:", error);
    return {
      success: false,
      message: `Error: ${error.message || "Unknown error"}`,
      issues: [error.message || "Unknown error"]
    };
  }
};
