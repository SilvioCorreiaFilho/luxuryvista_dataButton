import brain from 'brain';

/**
 * Module Fixer Utility
 * 
 * This utility provides functions to fix common syntax issues in backend modules
 * without spending credits.
 */

export interface ModuleFixOptions {
  modulePath: string;
  fixType?: 'all' | 'syntax' | 'router' | 'operation_id';
}

export interface ModuleFixResult {
  success: boolean;
  message: string;
  issues: string[];
  fixed: string[];
}

/**
 * Check a module for common issues
 */
export const checkModule = async (options: ModuleFixOptions): Promise<ModuleFixResult> => {
  try {
    const response = await brain.check_module({
      module_path: options.modulePath,
      check_type: options.fixType || "all"
    });
    return await response.json();
  } catch (error) {
    console.error("Error checking module:", error);
    return {
      success: false,
      message: `Error: ${error.message || "Unknown error"}`,
      issues: [error.message || "Unknown error"],
      fixed: []
    };
  }
};

/**
 * Fix common issues in a module
 */
export const fixModule = async (options: ModuleFixOptions): Promise<ModuleFixResult> => {
  try {
    const response = await brain.fix_module({
      module_path: options.modulePath,
      check_type: options.fixType || "all"
    });
    return await response.json();
  } catch (error) {
    console.error("Error fixing module:", error);
    return {
      success: false,
      message: `Error: ${error.message || "Unknown error"}`,
      issues: [error.message || "Unknown error"],
      fixed: []
    };
  }
};

/**
 * Check all modules for issues
 */
export const checkAllModules = async (): Promise<ModuleFixResult> => {
  try {
    const response = await brain.check_all_modules({});
    return await response.json();
  } catch (error) {
    console.error("Error checking all modules:", error);
    return {
      success: false,
      message: `Error: ${error.message || "Unknown error"}`,
      issues: [error.message || "Unknown error"],
      fixed: []
    };
  }
};

/**
 * Fix issues in all modules
 */
export const fixAllModules = async (): Promise<ModuleFixResult> => {
  try {
    const response = await brain.fix_all_modules({});
    return await response.json();
  } catch (error) {
    console.error("Error fixing all modules:", error);
    return {
      success: false,
      message: `Error: ${error.message || "Unknown error"}`,
      issues: [error.message || "Unknown error"],
      fixed: []
    };
  }
};
