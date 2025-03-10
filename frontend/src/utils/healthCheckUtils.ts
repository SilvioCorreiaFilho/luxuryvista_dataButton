import brain from 'brain';

export interface ModuleHealth {
  module_name: string;
  status: string;
  error?: string;
}

export interface HealthCheckResult {
  status: string;
  total_modules: number;
  healthy_count: number;
  unhealthy_count: number;
  healthy_modules: ModuleHealth[];
  unhealthy_modules: ModuleHealth[];
}

/**
 * Check the health of all modules
 */
export const checkHealth = async (): Promise<HealthCheckResult> => {
  try {
    const response = await brain.check_health({});
    const data = await response.json();
    
    // Default structure in case the API doesn't return the expected format
    const result: HealthCheckResult = {
      status: data.status || "unhealthy",
      total_modules: data.total_modules || 0,
      healthy_count: data.healthy_count || 0,
      unhealthy_count: data.unhealthy_count || 0,
      healthy_modules: data.healthy_modules || [],
      unhealthy_modules: data.unhealthy_modules || []
    };
    
    return result;
  } catch (error) {
    console.error("Error checking health:", error);
    
    // Return a minimal health check result on error
    return {
      status: "error",
      total_modules: 0,
      healthy_count: 0,
      unhealthy_count: 0,
      healthy_modules: [],
      unhealthy_modules: [{
        module_name: "health_check",
        status: "error",
        error: error.message || "Unknown error checking health"
      }]
    };
  }
};
