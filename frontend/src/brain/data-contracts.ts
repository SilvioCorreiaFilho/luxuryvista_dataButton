/**
 * BaseResponse
 * Base API response model
 */
export interface BaseResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /**
   * Data
   * Response data payload
   */
  data?: object | null;
  /**
   * Error
   * Error message if request failed
   */
  error?: string | null;
}

/** BatchImageRequest */
export interface BatchImageRequest {
  /**
   * Property Ids
   * List of property IDs to generate images for
   */
  property_ids: string[];
  /**
   * Count Per Property
   * Number of images per property (1-5)
   * @default 5
   */
  count_per_property?: number;
  /**
   * Force Regenerate
   * Force regeneration of images
   * @default false
   */
  force_regenerate?: boolean;
}

/** Body_fix_string_literals3 */
export interface BodyFixStringLiterals3 {
  /** Module Name */
  module_name: string;
}

/** Body_upload_media */
export interface BodyUploadMedia {
  /** Files */
  files: File[];
}

/** Body_upload_property_image_fallback */
export interface BodyUploadPropertyImageFallback {
  /**
   * File
   * @format binary
   */
  file: File;
  /**
   * Caption
   * @default ""
   */
  caption?: string;
  /**
   * Is Main
   * @default false
   */
  is_main?: boolean;
}

/** Body_upload_property_images */
export interface BodyUploadPropertyImages {
  /** Property Id */
  property_id: string;
  /**
   * Files
   * @default []
   */
  files?: File[];
}

/** Body_upload_script */
export interface BodyUploadScript {
  /**
   * Script
   * @format binary
   */
  script: File;
}

/** CheckAllRequest */
export type CheckAllRequest = object;

/** CheckRequest */
export interface CheckRequest {
  /** Module */
  module: string;
}

/** CheckResponse */
export interface CheckResponse {
  /** Modules */
  modules: ModuleStatus[];
  /** Total */
  total: number;
  /** Valid */
  valid: number;
  /** Invalid */
  invalid: number;
}

/** CodeReviewRequest */
export interface CodeReviewRequest {
  /** Code */
  code: string;
  /** Context */
  context?: string | null;
}

/** CodeReviewResponse */
export interface CodeReviewResponse {
  /** Review */
  review: string;
  /** Suggestions */
  suggestions: string[];
}

/**
 * ConflictLocation
 * Information about a single operation ID conflict location
 */
export interface ConflictLocation {
  /** Filepath */
  filepath: string;
  /** Function Name */
  function_name: string;
  /** Line Number */
  line_number: number;
}

/** DalleRequest */
export interface DalleRequest {
  /** Prompt */
  prompt: string;
  /**
   * N
   * @default 1
   */
  n?: number;
  /**
   * Size
   * @default "1792x1024"
   */
  size?: string;
  /**
   * Quality
   * @default "hd"
   */
  quality?: string;
  /**
   * Style
   * @default "vivid"
   */
  style?: string;
}

/** DalleResponse */
export interface DalleResponse {
  /** Success */
  success: boolean;
  /** Images */
  images: string[];
  /** Message */
  message?: string | null;
}

/** DatabaseRepairResponse */
export interface DatabaseRepairResponse {
  /** Message */
  message: string;
  /**
   * Fixed Records
   * @default 0
   */
  fixed_records?: number;
  /** Errors */
  errors?: string[];
}

/** DatabaseTestResponse */
export interface DatabaseTestResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
  /** Details */
  details?: object | null;
  /** Error */
  error?: string | null;
}

/** DatabaseUploadResponse */
export interface DatabaseUploadResponse {
  /** Message */
  message: string;
  /**
   * Uploaded Files
   * @default 0
   */
  uploaded_files?: number;
  /**
   * Failed Files
   * @default 0
   */
  failed_files?: number;
  /** File Urls */
  file_urls?: string[];
}

/**
 * Feature
 * Feature model.
 */
export interface Feature {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Icon */
  icon?: string | null;
}

/**
 * FeatureData
 * Property feature details
 */
export interface FeatureData {
  /**
   * Name
   * Feature name
   */
  name: string;
  /**
   * Description
   * Feature description
   * @default ""
   */
  description?: string | null;
}

/** FixModuleRequest */
export interface FixModuleRequest {
  /** Module Name */
  module_name: string;
}

/** FixPropertyDatabaseSchemaRequest */
export interface FixPropertyDatabaseSchemaRequest {
  /**
   * Force Rebuild Table
   * Force rebuild of property_images table structure
   * @default false
   */
  force_rebuild_table?: boolean;
  /**
   * Recreate Images
   * Force recreation of image objects even if they exist
   * @default false
   */
  recreate_images?: boolean;
}

/**
 * FixPropertyImagesRequest
 * Request model for fixing property images
 */
export interface FixPropertyImagesRequest {
  /**
   * Force Rebuild Table
   * Force rebuild of property_images table structure
   * @default false
   */
  force_rebuild_table?: boolean;
  /**
   * Recreate Images
   * Force recreation of image objects even if they exist
   * @default false
   */
  recreate_images?: boolean;
}

/** FixRequest */
export interface FixRequest {
  /** Module */
  module: string;
  /**
   * Fix Type
   * @default "all"
   */
  fix_type?: string;
}

/** GenerateDescriptionRequest */
export interface GenerateDescriptionRequest {
  /**
   * Property Data
   * Property data for description generation
   */
  property_data: object;
  /**
   * Api Key
   * Optional API key for AI service
   */
  api_key?: string | null;
  /**
   * Model
   * AI model to use for generation
   * @default "deepseek-chat"
   */
  model?: string;
}

/** GenerateDescriptionResponse */
export interface GenerateDescriptionResponse {
  /** Description */
  description: string;
}

/**
 * GeneratePropertiesRequest
 * Request model for generating properties
 */
export interface GeneratePropertiesRequest {
  /**
   * Count
   * Number of properties to generate
   * @default 5
   */
  count?: number;
  /**
   * Force Regenerate
   * Force regeneration even if properties exist
   * @default false
   */
  force_regenerate?: boolean;
  /**
   * Language
   * Language for content generation (pt or en)
   * @default "pt"
   */
  language?: string;
}

/**
 * GenerateTextRequest
 * Request model for text generation
 */
export interface GenerateTextRequest {
  /**
   * Model
   * @default "deepseek-chat"
   */
  model?: string;
  /** Messages */
  messages: Record<string, string>[];
  /**
   * Temperature
   * @default 0.7
   */
  temperature?: number;
  /**
   * Max Tokens
   * @default 2000
   */
  max_tokens?: number;
}

/**
 * GenerateTextResponse
 * Response model for text generation
 */
export interface GenerateTextResponse {
  /** Content */
  content: string;
  /** Model */
  model: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthCheckResponse */
export interface HealthCheckResponse {
  /** Status */
  status: string;
  /** Total Modules */
  total_modules: number;
  /** Healthy Count */
  healthy_count: number;
  /** Unhealthy Count */
  unhealthy_count: number;
  /**
   * Healthy Modules
   * @default []
   */
  healthy_modules?: ModuleHealth[];
  /**
   * Unhealthy Modules
   * @default []
   */
  unhealthy_modules?: ModuleHealth[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/**
 * ImageData
 * Property image details
 */
export interface ImageData {
  /**
   * Id
   * Unique image ID
   */
  id: string;
  /**
   * Url
   * Image URL
   */
  url: string;
  /**
   * Caption
   * Image caption
   * @default ""
   */
  caption?: string | null;
  /**
   * Is Main
   * Whether this is the main property image
   * @default false
   */
  is_main?: boolean | null;
  /**
   * Order Index
   * Display order index
   * @default 0
   */
  order_index?: number | null;
}

/**
 * InvestmentMetric
 * Investment metric model.
 */
export interface InvestmentMetric {
  /** Id */
  id?: string | null;
  /** Property Id */
  property_id?: string | null;
  /** Type */
  type: string;
  /** Value */
  value: string;
  /** Percentage */
  percentage: string;
  /** Description */
  description?: string | null;
}

/**
 * Location
 * Location model.
 */
export interface Location {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Latitude */
  latitude?: number | null;
  /** Longitude */
  longitude?: number | null;
}

/**
 * LocationData
 * Location data for properties
 */
export interface LocationData {
  /**
   * Neighborhood
   * Neighborhood name
   */
  neighborhood: string;
  /**
   * City
   * City name
   * @default "Brasília"
   */
  city?: string;
  /**
   * State
   * State/province code
   * @default "DF"
   */
  state?: string;
  /**
   * Country
   * Country name
   * @default "Brasil"
   */
  country?: string;
  /**
   * Coordinates
   * Geo coordinates if available
   */
  coordinates?: Record<string, number> | null;
}

/** MigrationResponse */
export interface MigrationResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
  /** Details */
  details?: object | null;
}

/** ModuleFixRequest */
export interface ModuleFixRequest {
  /**
   * Module Path
   * @default ""
   */
  module_path?: string;
  /**
   * Check Type
   * @default "all"
   */
  check_type?: string;
}

/** ModuleFixResponse */
export interface ModuleFixResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /**
   * Issues
   * @default []
   */
  issues?: any[];
  /**
   * Fixed
   * @default []
   */
  fixed?: any[];
}

/** ModuleHealth */
export interface ModuleHealth {
  /** Module Name */
  module_name: string;
  /** Status */
  status: string;
  /** Error */
  error?: string | null;
}

/** ModuleStatus */
export interface ModuleStatus {
  /** Module */
  module: string;
  /** Status */
  status: string;
  /** Message */
  message: string;
  /**
   * Has Router
   * @default false
   */
  has_router?: boolean;
  /** Exception */
  exception?: string | null;
}

/**
 * PropertiesFallbackResponse
 * Response model for multiple properties
 */
export interface PropertiesFallbackResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /**
   * Data
   * Response data payload
   */
  data?: object | null;
  /**
   * Error
   * Error message if request failed
   */
  error?: string | null;
  /**
   * Properties
   * @default []
   */
  properties?: object[];
}

/**
 * PropertiesResponse
 * Response model for property list endpoints
 */
export interface PropertiesResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /**
   * Properties
   * List of properties
   */
  properties?: PropertyData[];
  /**
   * Count
   * Total count of properties
   * @default 0
   */
  count?: number;
  /**
   * Page
   * Current page number
   * @default 1
   */
  page?: number | null;
  /**
   * Total Pages
   * Total number of pages
   * @default 1
   */
  total_pages?: number | null;
}

/**
 * PropertyCreate
 * Property creation model.
 */
export interface PropertyCreate {
  /** Title */
  title: string;
  /** Slug */
  slug?: string | null;
  /** Description */
  description: string;
  /** Property Type */
  property_type: string | object | PropertyType;
  /** Location */
  location: string | object | Location;
  /** Neighborhood */
  neighborhood?: string | null;
  /** Address */
  address?: string | null;
  /** Price */
  price: number | string;
  /** Bedrooms */
  bedrooms: number;
  /** Bathrooms */
  bathrooms: number;
  /** Area */
  area: number;
  /**
   * Features
   * @default []
   */
  features?: (Feature | object | string)[] | null;
  /**
   * Images
   * @default []
   */
  images?: (PropertyImage | object | string)[] | null;
  /** Property Video Url */
  property_video_url?: string | null;
  /** Drone Video Url */
  drone_video_url?: string | null;
  /** Virtual Tour Url */
  virtual_tour_url?: string | null;
  /**
   * Status
   * @default "draft"
   */
  status?: string;
  /**
   * Investment Metrics
   * @default []
   */
  investment_metrics?: (InvestmentMetric | object)[] | null;
  /**
   * Tags
   * @default []
   */
  tags?: string[] | null;
  /** Market Analysis */
  market_analysis?: object | null;
}

/**
 * PropertyData
 * Full property data model
 */
export interface PropertyData {
  /**
   * Id
   * Unique property ID
   */
  id: string;
  /**
   * Title
   * Property title
   */
  title: string;
  /**
   * Description
   * Detailed property description
   */
  description: string;
  /**
   * Property Type
   * Type of property (e.g., Mansion, Villa)
   */
  property_type: string;
  /**
   * Price
   * Property price value
   */
  price: number;
  /**
   * Currency
   * Currency code for price
   * @default "BRL"
   */
  currency?: string;
  /**
   * Area
   * Property area value
   */
  area: number;
  /**
   * Area Unit
   * Unit for area measurement
   * @default "sqm"
   */
  area_unit?: string;
  /**
   * Bedrooms
   * Number of bedrooms
   */
  bedrooms: number;
  /**
   * Bathrooms
   * Number of bathrooms
   */
  bathrooms: number;
  /** Property location details */
  location: LocationData;
  /**
   * Features
   * Property features
   */
  features?: FeatureData[];
  /**
   * Status
   * Property status (for_sale, sold, etc.)
   * @default "for_sale"
   */
  status?: string;
  /**
   * Images
   * Property images
   */
  images?: ImageData[];
  /**
   * Created At
   * Creation timestamp
   */
  created_at: string;
  /**
   * Updated At
   * Last update timestamp
   */
  updated_at: string;
}

/**
 * PropertyFallbackResponse
 * Response model for property fallback operations
 */
export interface PropertyFallbackResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /**
   * Data
   * Response data payload
   */
  data?: object | null;
  /**
   * Error
   * Error message if request failed
   */
  error?: string | null;
  /** Property */
  property?: object | null;
}

/**
 * PropertyGenerationRequest
 * Request model for property generation
 */
export interface PropertyGenerationRequest {
  /**
   * Count
   * Number of properties to generate
   * @default 1
   */
  count?: number;
  /**
   * Property Type
   * Type of property to generate
   * @default "Mansion"
   */
  property_type?: string;
  /**
   * Location
   * Location for the property
   * @default "Brasília"
   */
  location?: string;
  /**
   * Language
   * Language for content generation (pt or en)
   * @default "pt"
   */
  language?: string;
}

/**
 * PropertyImage
 * Property image model.
 */
export interface PropertyImage {
  /** Id */
  id?: string | null;
  /** Property Id */
  property_id?: string | null;
  /** Url */
  url: string;
  /** Caption */
  caption?: string | null;
  /**
   * Is Main
   * @default false
   */
  is_main?: boolean | null;
}

/** PropertyImageMigrationRequest */
export interface PropertyImageMigrationRequest {
  /**
   * Property Id
   * Specific property ID to migrate images for
   */
  property_id?: string | null;
  /**
   * Force Update
   * Force update of existing images
   * @default false
   */
  force_update?: boolean;
  /**
   * Dry Run
   * Show what would be migrated without making changes
   * @default false
   */
  dry_run?: boolean;
}

/** PropertyImageRequest */
export interface PropertyImageRequest {
  /**
   * Property Id
   * ID of the property to generate images for
   */
  property_id: string;
  /**
   * Count
   * Number of images to generate (1-5)
   * @default 1
   */
  count?: number;
  /**
   * Force Regenerate
   * Force regeneration of images
   * @default false
   */
  force_regenerate?: boolean;
}

/**
 * PropertyList
 * Property list model.
 */
export interface PropertyList {
  /** Properties */
  properties: AppApisDefinitionsPropertyResponse[];
  /** Total */
  total: number;
  /** Page */
  page: number;
  /** Size */
  size: number;
}

/**
 * PropertySearch
 * Property search model.
 */
export interface PropertySearch {
  /**
   * Query
   * @default ""
   */
  query?: string;
  /** Property Type */
  property_type?: string | null;
  /** Location */
  location?: string | null;
  /** Min Price */
  min_price?: number | null;
  /** Max Price */
  max_price?: number | null;
  /** Min Bedrooms */
  min_bedrooms?: number | null;
  /** Min Bathrooms */
  min_bathrooms?: number | null;
  /** Min Area */
  min_area?: number | null;
  /** Features */
  features?: string[] | null;
  /** Sort */
  sort?: string | null;
  /**
   * Order
   * @default "desc"
   */
  order?: string | null;
  /**
   * Page
   * @default 1
   */
  page?: number;
  /**
   * Size
   * @default 10
   */
  size?: number;
}

/**
 * PropertyType
 * Property type model.
 */
export interface PropertyType {
  /** Id */
  id?: string | null;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
}

/**
 * PropertyUpdate
 * Property update model.
 */
export interface PropertyUpdate {
  /** Title */
  title?: string | null;
  /** Slug */
  slug?: string | null;
  /** Description */
  description?: string | null;
  /** Property Type */
  property_type?: string | object | PropertyType | null;
  /** Location */
  location?: string | object | Location | null;
  /** Neighborhood */
  neighborhood?: string | null;
  /** Address */
  address?: string | null;
  /** Price */
  price?: number | string | null;
  /** Bedrooms */
  bedrooms?: number | null;
  /** Bathrooms */
  bathrooms?: number | null;
  /** Area */
  area?: number | null;
  /** Features */
  features?: (Feature | object | string)[] | null;
  /** Images */
  images?: (PropertyImage | object | string)[] | null;
  /** Property Video Url */
  property_video_url?: string | null;
  /** Drone Video Url */
  drone_video_url?: string | null;
  /** Virtual Tour Url */
  virtual_tour_url?: string | null;
  /** Status */
  status?: string | null;
  /** Investment Metrics */
  investment_metrics?: (InvestmentMetric | object)[] | null;
  /** Tags */
  tags?: string[] | null;
  /** Market Analysis */
  market_analysis?: object | null;
}

/**
 * PropertyUpdateRequest
 * Request model for updating a property
 */
export interface PropertyUpdateRequest {
  /** Data */
  data: object;
}

/**
 * RegeneratePropertiesRequest
 * Request model for regenerating all properties
 */
export interface RegeneratePropertiesRequest {
  /**
   * Property Count
   * Number of properties to generate
   */
  property_count?: number | null;
  /**
   * Force Regenerate
   * Force regeneration of properties
   * @default false
   */
  force_regenerate?: boolean;
  /**
   * Force Regenerate Images
   * Force regeneration of images
   * @default false
   */
  force_regenerate_images?: boolean;
  /**
   * Property Types
   * Types of properties to generate
   */
  property_types?: string[] | null;
}

/**
 * ReviewCodeRequest
 * Request model for code review
 */
export interface ReviewCodeRequest {
  /**
   * Code
   * Code to review
   */
  code: string;
  /**
   * Language
   * Programming language of the code
   * @default "typescript"
   */
  language?: string;
  /**
   * Fix
   * Whether to return fixed code
   * @default false
   */
  fix?: boolean;
}

/**
 * ReviewCodeResponse
 * Response model for code review
 */
export interface ReviewCodeResponse {
  /**
   * Success
   * Whether the operation was successful
   */
  success: boolean;
  /**
   * Message
   * Status message
   */
  message: string;
  /**
   * Issues
   * List of issues found in the code
   */
  issues?: string[];
  /**
   * Fixed Code
   * Fixed code
   */
  fixed_code?: string | null;
  /**
   * Error
   * Error message if any
   */
  error?: string | null;
}

/** RouterFixResult */
export interface RouterFixResult {
  /** Module */
  module: string;
  /** Had Router Import */
  had_router_import: boolean;
  /** Had Router Definition */
  had_router_definition: boolean;
  /** Fixed */
  fixed: boolean;
  /** Message */
  message: string;
}

/**
 * ScanRequest
 * Request model for scanning directories for duplicate operation IDs
 */
export interface ScanRequest {
  /**
   * Directory
   * @default "src/app/apis"
   */
  directory?: string;
}

/**
 * ScanResponse
 * Response model for operation ID scan results
 */
export interface ScanResponse {
  /** Duplicate Count */
  duplicate_count: number;
  /** Conflicts */
  conflicts: Record<string, ConflictLocation[]>;
}

/** ScriptUploadResponse */
export interface ScriptUploadResponse {
  /** Message */
  message: string;
  /**
   * Output
   * @default ""
   */
  output?: string;
  /** Error */
  error?: string | null;
  /**
   * Success
   * @default true
   */
  success?: boolean;
}

/**
 * SeoResponse
 * Response model for SEO operations
 */
export interface SeoResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /**
   * Data
   * Response data payload
   */
  data?: object | null;
  /**
   * Error
   * Error message if request failed
   */
  error?: string | null;
  /** Suggestions */
  suggestions?: SeoSuggestion[] | null;
  /** Text */
  text?: string | null;
}

/**
 * SeoSuggestion
 * SEO title and subtitle suggestion
 */
export interface SeoSuggestion {
  /** Title */
  title: string;
  /** Subtitle */
  subtitle: string;
}

/**
 * SeoTitleRequest
 * Request model for SEO title generation
 */
export interface SeoTitleRequest {
  /**
   * Property Type
   * Type of property (e.g., mansion, villa, penthouse)
   */
  property_type: string;
  /**
   * Location
   * Location of the property
   */
  location: string;
  /**
   * Language
   * Language code (pt for Portuguese, en for English)
   * @default "pt"
   */
  language?: string;
  /**
   * Target Audience
   * Target audience description
   */
  target_audience?: string | null;
  /**
   * Keywords
   * Specific keywords to include
   */
  keywords?: string[] | null;
}

/**
 * SeoTitleSubtitleRequest
 * Request model for SEO title and subtitle generation
 */
export interface SeoTitleSubtitleRequest {
  /**
   * Property Type
   * Type of property (e.g., Mansion, Villa)
   * @default "luxury property"
   */
  property_type?: string;
  /**
   * Location
   * Location of the property
   * @default "Brasília"
   */
  location?: string;
  /**
   * Platforms
   * Social media platforms to research
   * @default ["instagram","reddit","pinterest"]
   */
  platforms?: string[];
  /**
   * Language
   * Language for the content (pt for Portuguese, en for English)
   * @default "pt"
   */
  language?: string;
}

/**
 * SeoTitleSubtitleResponse
 * Response model for SEO title/subtitle generation
 */
export interface SeoTitleSubtitleResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /**
   * Data
   * Response data payload
   */
  data?: object | null;
  /**
   * Error
   * Error message if request failed
   */
  error?: string | null;
  /**
   * Suggestions
   * @default []
   */
  suggestions?: SeoSuggestion[];
  /** Keywords */
  keywords?: object[] | null;
  /** Sources */
  sources?: object | null;
  /** Text */
  text?: string | null;
}

/**
 * TextGenerationResponse
 * Response model for text generation
 */
export interface TextGenerationResponse {
  /** Content */
  content: string;
  /** Model */
  model: string;
}

/** TranslateRequest */
export interface TranslateRequest {
  /**
   * Text
   * Text to translate
   */
  text: string;
  /**
   * From Lang
   * Source language code
   */
  from_lang: string;
  /**
   * To Lang
   * Target language code
   */
  to_lang: string;
}

/** TranslateResponse */
export interface TranslateResponse {
  /**
   * Translated Text
   * Translated text
   */
  translated_text: string;
  /**
   * Service Info
   * Information about the translation service status
   */
  service_info?: Record<string, string> | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** FixAllRequest */
export interface AppApisApiConsistencyFixAllRequest {
  /**
   * Fix Type
   * @default "all"
   */
  fix_type?: string;
}

/** FixResponse */
export interface AppApisApiConsistencyFixResponse {
  /** Results */
  results: AppApisApiConsistencyFixResult[];
  /** Total Modules */
  total_modules: number;
  /** Fixed Modules */
  fixed_modules: number;
  /** Modules Without Issues */
  modules_without_issues: number;
  /** Modules With Errors */
  modules_with_errors: number;
}

/** FixResult */
export interface AppApisApiConsistencyFixResult {
  /** Module */
  module: string;
  /** Status */
  status: string;
  /** Message */
  message: string;
  /**
   * Fixes
   * @default []
   */
  fixes?: string[];
}

/** FixAllRequest */
export type AppApisApiFixerFixAllRequest = object;

/** FixResponse */
export interface AppApisApiFixerFixResponse {
  /** Results */
  results: AppApisApiFixerFixResult[];
  /** Total Modules */
  total_modules: number;
  /** Fixed Modules */
  fixed_modules: number;
  /** Modules Without Issues */
  modules_without_issues: number;
  /** Modules With Errors */
  modules_with_errors: number;
}

/** FixResult */
export interface AppApisApiFixerFixResult {
  /** Module */
  module: string;
  /** Status */
  status: string;
  /**
   * Message
   * @default ""
   */
  message?: string;
  /**
   * Fixes
   * @default []
   */
  fixes?: string[];
}

/**
 * TextGenerationRequest
 * Request model for text generation
 */
export interface AppApisDeepseekClientTextGenerationRequest {
  /**
   * Model
   * @default "deepseek-chat"
   */
  model?: string;
  /**
   * Messages
   * List of messages in the conversation
   */
  messages: any[];
  /**
   * Temperature
   * @default 0.7
   */
  temperature?: number;
  /**
   * Max Tokens
   * @default 2000
   */
  max_tokens?: number;
}

/**
 * TextGenerationRequest
 * Request model for text generation
 */
export interface AppApisDeepseekWrapperTextGenerationRequest {
  /** Prompt */
  prompt: string;
  /**
   * Max Tokens
   * @default 1000
   */
  max_tokens?: number;
  /**
   * Temperature
   * @default 0.7
   */
  temperature?: number;
  /** System Prompt */
  system_prompt?: string | null;
  /** Model */
  model?: string | null;
}

/**
 * PropertyResponse
 * Property response model.
 */
export interface AppApisDefinitionsPropertyResponse {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Slug */
  slug?: string | null;
  /** Description */
  description: string;
  /** Property Type */
  property_type: PropertyType | string | object;
  /** Location */
  location: Location | string | object;
  /** Neighborhood */
  neighborhood?: string | null;
  /** Address */
  address?: string | object | null;
  /** Price */
  price: string;
  /** Bedrooms */
  bedrooms: number;
  /** Bathrooms */
  bathrooms: number;
  /** Area */
  area: number;
  /**
   * Features
   * @default []
   */
  features?: Feature[] | null;
  /**
   * Images
   * @default []
   */
  images?: PropertyImage[] | null;
  /** Property Video Url */
  property_video_url?: string | null;
  /** Drone Video Url */
  drone_video_url?: string | null;
  /** Virtual Tour Url */
  virtual_tour_url?: string | null;
  /**
   * Status
   * @default "draft"
   */
  status?: string;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /** Published At */
  published_at?: string | null;
  /**
   * Investment Metrics
   * @default []
   */
  investment_metrics?: InvestmentMetric[] | null;
  /**
   * Tags
   * @default []
   */
  tags?: string[] | null;
  /** Market Analysis */
  market_analysis?: object | null;
}

/**
 * PropertySearchResponse
 * Property search response model.
 */
export interface AppApisDefinitionsPropertySearchResponse {
  /** Properties */
  properties: AppApisDefinitionsPropertyResponse[];
  /** Total */
  total: number;
  /** Page */
  page: number;
  /** Size */
  size: number;
  /** Query */
  query: string;
}

/**
 * GeneratePropertiesResponse
 * Response model for property generation
 */
export interface AppApisPropertyFallbackGeneratePropertiesResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /**
   * Data
   * Response data payload
   */
  data?: object | null;
  /**
   * Error
   * Error message if request failed
   */
  error?: string | null;
  /**
   * Properties
   * @default []
   */
  properties?: object[];
}

/** PropertySearchRequest */
export interface AppApisPropertySearchPropertySearchRequest {
  /** Query */
  query: string;
}

/** PropertySearchResponse */
export interface AppApisPropertySearchPropertySearchResponse {
  /** Properties */
  properties: object[];
  /** Suggested Filters */
  suggested_filters: object;
}

/**
 * GeneratePropertiesResponse
 * Response model for property generation endpoints
 */
export interface AppApisSharedGeneratePropertiesResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /**
   * Data
   * Response data payload
   */
  data?: object | null;
  /**
   * Error
   * Error message if request failed
   */
  error?: string | null;
  /**
   * Properties
   * Generated properties
   */
  properties?: object[];
  /**
   * Task Id
   * Background task ID if applicable
   */
  task_id?: string | null;
}

/**
 * PropertyResponse
 * Response model for property endpoints
 */
export interface AppApisSharedPropertyResponse {
  /**
   * Success
   * Whether the request was successful
   */
  success: boolean;
  /**
   * Message
   * Response message
   */
  message: string;
  /** Property data */
  property?: PropertyData | null;
  /**
   * Properties
   * List of properties
   */
  properties?: object[] | null;
}

/**
 * PropertySearchRequest
 * Request model for property search
 */
export interface AppApisSharedPropertySearchRequest {
  /**
   * Query
   * Search query
   */
  query?: string | null;
  /**
   * Property Type
   * Filter by property type
   */
  property_type?: string | null;
  /**
   * Min Price
   * Minimum price
   */
  min_price?: number | null;
  /**
   * Max Price
   * Maximum price
   */
  max_price?: number | null;
  /**
   * Min Bedrooms
   * Minimum number of bedrooms
   */
  min_bedrooms?: number | null;
  /**
   * Max Bedrooms
   * Maximum number of bedrooms
   */
  max_bedrooms?: number | null;
  /**
   * Min Bathrooms
   * Minimum number of bathrooms
   */
  min_bathrooms?: number | null;
  /**
   * Max Bathrooms
   * Maximum number of bathrooms
   */
  max_bathrooms?: number | null;
  /**
   * Min Area
   * Minimum area in square meters
   */
  min_area?: number | null;
  /**
   * Max Area
   * Maximum area in square meters
   */
  max_area?: number | null;
  /**
   * Neighborhood
   * Filter by neighborhood
   */
  neighborhood?: string | null;
  /**
   * Features
   * Filter by features
   */
  features?: string[] | null;
  /**
   * Status
   * Filter by status
   */
  status?: string | null;
  /**
   * Limit
   * Number of results to return
   * @default 10
   */
  limit?: number;
  /**
   * Offset
   * Offset for pagination
   * @default 0
   */
  offset?: number;
}

export type CheckHealthData = HealthResponse;

export type UploadMediaData = any;

export type UploadMediaError = HTTPValidationError;

export type ListMediaData = any;

export interface DeleteMediaParams {
  /** Filename */
  filename: string;
}

export type DeleteMediaData = any;

export type DeleteMediaError = HTTPValidationError;

export type GetAppInfoData = any;

export type GetSettingsData = any;

export type SearchProperties2Data = AppApisPropertySearchPropertySearchResponse;

export type SearchProperties2Error = HTTPValidationError;

export type FixPropertyTypesData = DatabaseRepairResponse;

export type UploadPropertyImagesData = DatabaseUploadResponse;

export type UploadPropertyImagesError = HTTPValidationError;

export type NormalizeFieldNamesData = DatabaseRepairResponse;

export type UploadScriptData = ScriptUploadResponse;

export type UploadScriptError = HTTPValidationError;

export type TestDatabaseConnectionData = DatabaseTestResponse;

export type SetupTestDatabaseData = DatabaseTestResponse;

export type InitializeCmsSchemaData = DatabaseTestResponse;

/** Response Get Property Types */
export type GetPropertyTypesData = PropertyType[];

export type TranslateData = TranslateResponse;

export type TranslateError = HTTPValidationError;

export type GenerateDescriptionData = GenerateDescriptionResponse;

export type GenerateDescriptionError = HTTPValidationError;

export type RouterTextGenerationData = GenerateTextResponse;

export type RouterTextGenerationError = HTTPValidationError;

export type DeepseekClientTextGenerationData = TextGenerationResponse;

export type DeepseekClientTextGenerationError = HTTPValidationError;

export type OperationIdFixerScanData = ScanResponse;

export type OperationIdFixerScanError = HTTPValidationError;

export type MigrateFromStrapiData = MigrationResponse;

export type FixPropertyDatabaseSchemaEndpointData = any;

export type FixPropertyDatabaseSchemaEndpointError = HTTPValidationError;

export interface GenerateSinglePropertyParams {
  /**
   * Property Type
   * Type of property to generate
   * @default "Mansion"
   */
  property_type?: string;
  /**
   * Neighborhood
   * Neighborhood location
   * @default "Lago Sul"
   */
  neighborhood?: string;
  /**
   * Language
   * Language for content generation
   * @default "pt"
   */
  language?: string;
}

export type GenerateSinglePropertyData = AppApisSharedPropertyResponse;

export type GenerateSinglePropertyError = HTTPValidationError;

/** Response Migrate Property Images */
export type MigratePropertyImagesData = object;

export type MigratePropertyImagesError = HTTPValidationError;

/** Response Migrate Property Images Background */
export type MigratePropertyImagesBackgroundData = object;

export type MigratePropertyImagesBackgroundError = HTTPValidationError;

/** Response Get Property Images Table Sql */
export type GetPropertyImagesTableSqlData = object;

export interface GetMigrationProgressParams {
  /** Progress Key */
  progressKey: string;
}

/** Response Get Migration Progress */
export type GetMigrationProgressData = object;

export type GetMigrationProgressError = HTTPValidationError;

export interface GetPropertiesEndpointParams {
  /** Neighborhood */
  neighborhood?: string | null;
  /** Property Type */
  property_type?: string | null;
}

export type GetPropertiesEndpointData = any;

export type GetPropertiesEndpointError = HTTPValidationError;

export type CreateProperty2Data = AppApisDefinitionsPropertyResponse;

export type CreateProperty2Error = HTTPValidationError;

export interface GetPropertyEndpointParams {
  /** Property Id */
  propertyId: string;
}

export type GetPropertyEndpointData = any;

export type GetPropertyEndpointError = HTTPValidationError;

export interface UpdatePropertyParams {
  /** Property Id */
  propertyId: string;
}

export type UpdatePropertyData = AppApisDefinitionsPropertyResponse;

export type UpdatePropertyError = HTTPValidationError;

export interface DeletePropertyParams {
  /** Property Id */
  propertyId: string;
}

/** Response Delete Property */
export type DeletePropertyData = object;

export type DeletePropertyError = HTTPValidationError;

export type SearchPropertiesData = AppApisDefinitionsPropertySearchResponse;

export type SearchPropertiesError = HTTPValidationError;

export interface UpdateAllPropertyImagesParams {
  /**
   * Image Count
   * @default 5
   */
  image_count?: number;
  /**
   * Force Regenerate
   * @default true
   */
  force_regenerate?: boolean;
}

/** Response Update All Property Images */
export type UpdateAllPropertyImagesData = object;

export type UpdateAllPropertyImagesError = HTTPValidationError;

export type SeoTitleSubtitleData = SeoTitleSubtitleResponse;

export type SeoTitleSubtitleError = HTTPValidationError;

export type SeoTitleSubtitle2Data = SeoResponse;

export type SeoTitleSubtitle2Error = HTTPValidationError;

export type RegenerateAllPropertiesData = any;

export type RegenerateAllPropertiesError = HTTPValidationError;

/** Property Data */
export type CreatePropertyFallbackPayload = object;

export type CreatePropertyFallbackData = any;

export type CreatePropertyFallbackError = HTTPValidationError;

export interface GetPropertiesFallbackParams {
  /** Property Type */
  property_type?: string | null;
  /** Location */
  location?: string | null;
}

export type GetPropertiesFallbackData = any;

export type GetPropertiesFallbackError = HTTPValidationError;

export interface GetPropertyFallbackParams {
  /** Property Id */
  propertyId: string;
}

export type GetPropertyFallbackData = any;

export type GetPropertyFallbackError = HTTPValidationError;

/** Property Data */
export type UpdatePropertyFallbackPayload = object;

export interface UpdatePropertyFallbackParams {
  /** Property Id */
  propertyId: string;
}

export type UpdatePropertyFallbackData = any;

export type UpdatePropertyFallbackError = HTTPValidationError;

export interface DeletePropertyFallbackParams {
  /** Property Id */
  propertyId: string;
}

export type DeletePropertyFallbackData = any;

export type DeletePropertyFallbackError = HTTPValidationError;

export interface UploadPropertyImageFallbackParams {
  /** Image Url */
  image_url: string;
  /**
   * Caption
   * @default ""
   */
  caption?: string | null;
  /**
   * Is Main
   * @default false
   */
  is_main?: boolean | null;
  /** Property Id */
  propertyId: string;
}

export type UploadPropertyImageFallbackData = any;

export type UploadPropertyImageFallbackError = HTTPValidationError;

export type GeneratePropertyFacadeData = AppApisSharedGeneratePropertiesResponse;

export type GeneratePropertyFacadeError = HTTPValidationError;

export interface GetProperties2Params {
  /**
   * Page
   * @default 1
   */
  page?: number;
  /**
   * Size
   * @default 10
   */
  size?: number;
}

export type GetProperties2Data = PropertiesResponse;

export type GetProperties2Error = HTTPValidationError;

export interface GetPropertyFacadeParams {
  /** Property Id */
  propertyId: string;
}

export type GetPropertyFacadeData = AppApisSharedPropertyResponse;

export type GetPropertyFacadeError = HTTPValidationError;

export type GeneratePropertyEndpointData = any;

export type GeneratePropertyEndpointError = HTTPValidationError;

/** Filters */
export type FilterPropertiesPayload = object | null;

export type FilterPropertiesData = BaseResponse;

export type FilterPropertiesError = HTTPValidationError;

export interface GetPropertyByIdParams {
  /**
   * Property Id
   * ID of the property to get
   */
  propertyId: string;
}

export type GetPropertyByIdData = AppApisSharedPropertyResponse;

export type GetPropertyByIdError = HTTPValidationError;

/** Property Data */
export type CreatePropertyFallback2Payload = object;

export type CreatePropertyFallback2Data = PropertyFallbackResponse;

export type CreatePropertyFallback2Error = HTTPValidationError;

export interface GetPropertiesFallback2Params {
  /** Neighborhood */
  neighborhood?: string | null;
  /** Property Type */
  property_type?: string | null;
  /** Min Price */
  min_price?: number | null;
  /** Max Price */
  max_price?: number | null;
  /** Status */
  status?: string | null;
}

export type GetPropertiesFallback2Data = PropertiesFallbackResponse;

export type GetPropertiesFallback2Error = HTTPValidationError;

export interface GetPropertyFallback2Params {
  /** Property Id */
  propertyId: string;
}

export type GetPropertyFallback2Data = PropertyFallbackResponse;

export type GetPropertyFallback2Error = HTTPValidationError;

export interface UpdatePropertyFallback2Params {
  /** Property Id */
  propertyId: string;
}

export type UpdatePropertyFallback2Data = PropertyFallbackResponse;

export type UpdatePropertyFallback2Error = HTTPValidationError;

export interface DeletePropertyFallback2Params {
  /** Property Id */
  propertyId: string;
}

export type DeletePropertyFallback2Data = BaseResponse;

export type DeletePropertyFallback2Error = HTTPValidationError;

export interface UploadPropertyImageFallback2Params {
  /** Property Id */
  propertyId: string;
}

export type UploadPropertyImageFallback2Data = PropertyFallbackResponse;

export type UploadPropertyImageFallback2Error = HTTPValidationError;

export type GeneratePropertiesData = AppApisPropertyFallbackGeneratePropertiesResponse;

export type GeneratePropertiesError = HTTPValidationError;

export type ReviewCodeData = CodeReviewResponse;

export type ReviewCodeError = HTTPValidationError;

export type GenerateProperties2Data = any;

export type GenerateProperties2Error = HTTPValidationError;

/** Response Update Property Images Format */
export type UpdatePropertyImagesFormatData = object;

/** Response Update Property Images With Dalle */
export type UpdatePropertyImagesWithDalleData = object;

/** Response Fix Property Database Endpoint */
export type FixPropertyDatabaseEndpointData = object;

export type FixPropertyDatabaseEndpointError = HTTPValidationError;

/** Response Regenerate All Properties2 */
export type RegenerateAllProperties2Data = object;

export type RegenerateAllProperties2Error = HTTPValidationError;

export type GenerateImagesData = any;

export type GenerateImagesError = HTTPValidationError;

export type BatchGenerateImagesData = any;

export type BatchGenerateImagesError = HTTPValidationError;

export interface GetPropertyImagesStatusParams {
  /** Property Id */
  propertyId: string;
}

export type GetPropertyImagesStatusData = any;

export type GetPropertyImagesStatusError = HTTPValidationError;

export type TextGenerationData = any;

export type TextGenerationError = HTTPValidationError;

export type GeneratePropertyEndpoint2Data = any;

export type GeneratePropertyEndpoint2Error = HTTPValidationError;

export interface GeneratePromptEndpointParams {
  /** Topic */
  topic: string;
  /** Context */
  context?: string | null;
}

export type GeneratePromptEndpointData = any;

export type GeneratePromptEndpointError = HTTPValidationError;

export type ReviewCode2Data = ReviewCodeResponse;

export type ReviewCode2Error = HTTPValidationError;

export type ReviewCode2Result = ReviewCodeResponse;

export type ReviewCode2Fail = HTTPValidationError;

export type SearchPropertiesFacadeData = PropertiesResponse;

export type SearchPropertiesFacadeError = HTTPValidationError;

export type FixStringLiteralsData = AppApisApiFixerFixResult;

export type FixStringLiteralsError = HTTPValidationError;

export type FixAllStringLiteralsData = AppApisApiFixerFixResponse;

export type FixAllStringLiteralsError = HTTPValidationError;

export type FixModuleRouterData = RouterFixResult;

export type FixModuleRouterError = HTTPValidationError;

/** Response Fix All Module Routers */
export type FixAllModuleRoutersData = RouterFixResult[];

export type FixAllModuleRoutersError = HTTPValidationError;

/** Response Check Api Consistency */
export type CheckApiConsistencyData = object;

export type FixModuleSyntaxData = AppApisApiFixerFixResult;

export type FixModuleSyntaxError = HTTPValidationError;

export type FixAllModulesSyntaxData = AppApisApiFixerFixResponse;

export type FixAllModulesSyntaxError = HTTPValidationError;

/** Response Fix Operation Ids */
export type FixOperationIdsData = object;

/** Response Check Api Consistency */
export type CheckApiConsistency2Data = object;

export type CheckApiConsistency2Error = HTTPValidationError;

export type FixModuleSyntaxEndpointData = AppApisApiConsistencyFixResult;

export type FixModuleSyntaxEndpointError = HTTPValidationError;

export type FixAllModulesSyntaxEndpointData = AppApisApiConsistencyFixResponse;

export type FixAllModulesSyntaxEndpointError = HTTPValidationError;

export type CheckModuleEndpointData = ModuleStatus;

export type CheckModuleEndpointError = HTTPValidationError;

export type CheckAllModulesEndpointData = CheckResponse;

export type CheckAllModulesEndpointError = HTTPValidationError;

/** Module Path */
export type FixStringLiterals2Payload = string;

export type FixStringLiterals2Data = any;

export type FixStringLiterals2Error = HTTPValidationError;

export type FixAllModulesData = any;

export interface CheckModuleParams {
  /** Module */
  module: string;
}

export type CheckModuleData = any;

export type CheckModuleError = HTTPValidationError;

export type CheckAllModulesData = any;

/** Module Name */
export type FixStringLiterals3Payload = string;

export type FixStringLiterals3Data = any;

export type FixStringLiterals3Error = HTTPValidationError;

export type FixAllModules2Data = any;

export type FixStringLiterals3Result = any;

export type FixStringLiterals3Fail = HTTPValidationError;

export type FixAllModules3Data = any;

export interface FixModuleParams {
  /** Module Name */
  moduleName: string;
}

export type FixModuleData = any;

export type FixModuleError = HTTPValidationError;

export type FixAllModules2Result = any;

export type CheckModule2Data = ModuleFixResponse;

export type CheckModule2Error = HTTPValidationError;

export type FixModule2Data = ModuleFixResponse;

export type FixModule2Error = HTTPValidationError;

export type CheckAllModules2Data = ModuleFixResponse;

export type FixAllModules3Result = ModuleFixResponse;

export type CheckHealthResult = HealthCheckResponse;
