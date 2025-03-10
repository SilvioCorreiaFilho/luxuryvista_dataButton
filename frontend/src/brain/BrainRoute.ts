import {
  AppApisApiConsistencyFixAllRequest,
  AppApisApiFixerFixAllRequest,
  AppApisDeepseekClientTextGenerationRequest,
  AppApisDeepseekWrapperTextGenerationRequest,
  AppApisPropertySearchPropertySearchRequest,
  AppApisSharedPropertySearchRequest,
  BatchGenerateImagesData,
  BatchImageRequest,
  BodyFixStringLiterals3,
  BodyUploadMedia,
  BodyUploadPropertyImageFallback,
  BodyUploadPropertyImages,
  BodyUploadScript,
  CheckAllModules2Data,
  CheckAllModulesData,
  CheckAllModulesEndpointData,
  CheckAllRequest,
  CheckApiConsistency2Data,
  CheckApiConsistencyData,
  CheckHealthData,
  CheckHealthResult,
  CheckModule2Data,
  CheckModuleData,
  CheckModuleEndpointData,
  CheckRequest,
  CodeReviewRequest,
  CreateProperty2Data,
  CreatePropertyFallback2Data,
  CreatePropertyFallback2Payload,
  CreatePropertyFallbackData,
  CreatePropertyFallbackPayload,
  DeepseekClientTextGenerationData,
  DeleteMediaData,
  DeletePropertyData,
  DeletePropertyFallback2Data,
  DeletePropertyFallbackData,
  FilterPropertiesData,
  FilterPropertiesPayload,
  FixAllModuleRoutersData,
  FixAllModules2Data,
  FixAllModules2Result,
  FixAllModules3Data,
  FixAllModules3Result,
  FixAllModulesData,
  FixAllModulesSyntaxData,
  FixAllModulesSyntaxEndpointData,
  FixAllStringLiteralsData,
  FixModule2Data,
  FixModuleData,
  FixModuleRequest,
  FixModuleRouterData,
  FixModuleSyntaxData,
  FixModuleSyntaxEndpointData,
  FixOperationIdsData,
  FixPropertyDatabaseEndpointData,
  FixPropertyDatabaseSchemaEndpointData,
  FixPropertyDatabaseSchemaRequest,
  FixPropertyImagesRequest,
  FixPropertyTypesData,
  FixRequest,
  FixStringLiterals2Data,
  FixStringLiterals2Payload,
  FixStringLiterals3Data,
  FixStringLiterals3Payload,
  FixStringLiterals3Result,
  FixStringLiteralsData,
  GenerateDescriptionData,
  GenerateDescriptionRequest,
  GenerateImagesData,
  GeneratePromptEndpointData,
  GenerateProperties2Data,
  GeneratePropertiesData,
  GeneratePropertiesRequest,
  GeneratePropertyEndpoint2Data,
  GeneratePropertyEndpointData,
  GeneratePropertyFacadeData,
  GenerateSinglePropertyData,
  GenerateTextRequest,
  GetAppInfoData,
  GetMigrationProgressData,
  GetProperties2Data,
  GetPropertiesEndpointData,
  GetPropertiesFallback2Data,
  GetPropertiesFallbackData,
  GetPropertyByIdData,
  GetPropertyEndpointData,
  GetPropertyFacadeData,
  GetPropertyFallback2Data,
  GetPropertyFallbackData,
  GetPropertyImagesStatusData,
  GetPropertyImagesTableSqlData,
  GetPropertyTypesData,
  GetSettingsData,
  InitializeCmsSchemaData,
  ListMediaData,
  MigrateFromStrapiData,
  MigratePropertyImagesBackgroundData,
  MigratePropertyImagesData,
  ModuleFixRequest,
  NormalizeFieldNamesData,
  OperationIdFixerScanData,
  PropertyCreate,
  PropertyGenerationRequest,
  PropertyImageMigrationRequest,
  PropertyImageRequest,
  PropertySearch,
  PropertyUpdate,
  PropertyUpdateRequest,
  RegenerateAllProperties2Data,
  RegenerateAllPropertiesData,
  RegeneratePropertiesRequest,
  ReviewCode2Data,
  ReviewCode2Result,
  ReviewCodeData,
  ReviewCodeRequest,
  RouterTextGenerationData,
  ScanRequest,
  SearchProperties2Data,
  SearchPropertiesData,
  SearchPropertiesFacadeData,
  SeoTitleRequest,
  SeoTitleSubtitle2Data,
  SeoTitleSubtitleData,
  SeoTitleSubtitleRequest,
  SetupTestDatabaseData,
  TestDatabaseConnectionData,
  TextGenerationData,
  TranslateData,
  TranslateRequest,
  UpdateAllPropertyImagesData,
  UpdatePropertyData,
  UpdatePropertyFallback2Data,
  UpdatePropertyFallbackData,
  UpdatePropertyFallbackPayload,
  UpdatePropertyImagesFormatData,
  UpdatePropertyImagesWithDalleData,
  UploadMediaData,
  UploadPropertyImageFallback2Data,
  UploadPropertyImageFallbackData,
  UploadPropertyImagesData,
  UploadScriptData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Upload media files
   * @tags dbtn/module:media
   * @name upload_media
   * @summary Upload Media
   * @request POST:/routes/upload
   */
  export namespace upload_media {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadMedia;
    export type RequestHeaders = {};
    export type ResponseBody = UploadMediaData;
  }

  /**
   * @description List all media files
   * @tags dbtn/module:media
   * @name list_media
   * @summary List Media
   * @request GET:/routes/list
   */
  export namespace list_media {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListMediaData;
  }

  /**
   * @description Delete a media file
   * @tags dbtn/module:media
   * @name delete_media
   * @summary Delete Media
   * @request DELETE:/routes/{filename}
   */
  export namespace delete_media {
    export type RequestParams = {
      /** Filename */
      filename: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteMediaData;
  }

  /**
   * @description Get application information.
   * @tags dbtn/module:apps
   * @name get_app_info
   * @summary Get App Info
   * @request GET:/routes/apps/info
   */
  export namespace get_app_info {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAppInfoData;
  }

  /**
   * @description Get application settings.
   * @tags dbtn/module:settings
   * @name get_settings
   * @summary Get Settings
   * @request GET:/routes/settings
   */
  export namespace get_settings {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSettingsData;
  }

  /**
   * @description Search properties using natural language query
   * @tags dbtn/module:property_search
   * @name search_properties2
   * @summary Search Properties2
   * @request POST:/routes/property-search
   */
  export namespace search_properties2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisPropertySearchPropertySearchRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SearchProperties2Data;
  }

  /**
   * @description Fix inconsistent property types in the database
   * @tags dbtn/module:database_repair
   * @name fix_property_types
   * @summary Fix Property Types
   * @request POST:/routes/database-repair/fix-property-types
   */
  export namespace fix_property_types {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FixPropertyTypesData;
  }

  /**
   * @description Upload images for a specific property
   * @tags dbtn/module:database_repair
   * @name upload_property_images
   * @summary Upload Property Images
   * @request POST:/routes/database-repair/upload-property-images
   */
  export namespace upload_property_images {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadPropertyImages;
    export type RequestHeaders = {};
    export type ResponseBody = UploadPropertyImagesData;
  }

  /**
   * @description Fix inconsistent field naming (snake_case vs camelCase)
   * @tags dbtn/module:database_repair
   * @name normalize_field_names
   * @summary Normalize Field Names
   * @request POST:/routes/database-repair/normalize-field-names
   */
  export namespace normalize_field_names {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = NormalizeFieldNamesData;
  }

  /**
   * @description Upload and execute a script file (Python, JavaScript, TypeScript, or TSX)
   * @tags dbtn/module:script_uploader
   * @name upload_script
   * @summary Upload Script
   * @request POST:/routes/script-uploader/upload-script
   */
  export namespace upload_script {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadScript;
    export type RequestHeaders = {};
    export type ResponseBody = UploadScriptData;
  }

  /**
   * @description Test the PostgreSQL database connection
   * @tags diagnostics, dbtn/module:database_test
   * @name test_database_connection
   * @summary Test Database Connection
   * @request GET:/routes/database-test/connection
   */
  export namespace test_database_connection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestDatabaseConnectionData;
  }

  /**
   * @description Set up test tables in the PostgreSQL database
   * @tags diagnostics, dbtn/module:database_test
   * @name setup_test_database
   * @summary Setup Test Database
   * @request POST:/routes/database-test/setup
   */
  export namespace setup_test_database {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SetupTestDatabaseData;
  }

  /**
   * @description Initialize the CMS database schema
   * @tags diagnostics, dbtn/module:database_test
   * @name initialize_cms_schema
   * @summary Initialize Cms Schema
   * @request POST:/routes/database-test/init-cms-schema
   */
  export namespace initialize_cms_schema {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InitializeCmsSchemaData;
  }

  /**
   * @description Get all property types from the CMS. Args: cms_client: Supabase client or None if CMS is unavailable Returns: List of property types
   * @tags cms, dbtn/module:wagtail_cms
   * @name get_property_types
   * @summary Get Property Types
   * @request GET:/routes/wagtail/property-types
   */
  export namespace get_property_types {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertyTypesData;
  }

  /**
   * @description Translate text from one language to another using OpenAI's GPT model. Includes retry logic with exponential backoff.
   * @tags translation, dbtn/module:translation
   * @name translate
   * @summary Translate
   * @request POST:/routes/translate
   */
  export namespace translate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TranslateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TranslateData;
  }

  /**
   * @description Generate a detailed luxury property description
   * @tags properties, dbtn/module:description_generator
   * @name generate_description
   * @summary Generate Description
   * @request POST:/routes/descriptions/generate
   */
  export namespace generate_description {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GenerateDescriptionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateDescriptionData;
  }

  /**
   * @description Generate text using DeepSeek AI or OpenAI as fallback
   * @tags ai, dbtn/module:router
   * @name router_text_generation
   * @summary Router Text Generation
   * @request POST:/routes/router-deepseek/generate
   */
  export namespace router_text_generation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GenerateTextRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RouterTextGenerationData;
  }

  /**
   * @description Generate text using DeepSeek AI with OpenAI fallback
   * @tags ai, dbtn/module:deepseek_client
   * @name deepseek_client_text_generation
   * @summary Deepseek Client Text Generation
   * @request POST:/routes/deepseek-client/generate
   */
  export namespace deepseek_client_text_generation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisDeepseekClientTextGenerationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = DeepseekClientTextGenerationData;
  }

  /**
   * @description Scan specified directory for duplicate operation IDs
   * @tags utilities, dbtn/module:operation_id_fixer
   * @name operation_id_fixer_scan
   * @summary Scan For Conflicts
   * @request POST:/routes/operation-id-fixer/scan
   */
  export namespace operation_id_fixer_scan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ScanRequest;
    export type RequestHeaders = {};
    export type ResponseBody = OperationIdFixerScanData;
  }

  /**
   * @description Migrate data from Strapi to the Wagtail-like CMS
   * @tags dbtn/module:data_migration
   * @name migrate_from_strapi
   * @summary Migrate From Strapi
   * @request POST:/routes/migration/strapi-to-cms
   */
  export namespace migrate_from_strapi {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = MigrateFromStrapiData;
  }

  /**
   * @description Endpoint to fix property database schema.
   * @tags dbtn/module:db_fix
   * @name fix_property_database_schema_endpoint
   * @summary Fix Property Database Schema Endpoint
   * @request POST:/routes/fix-property-database-schema
   */
  export namespace fix_property_database_schema_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FixPropertyDatabaseSchemaRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixPropertyDatabaseSchemaEndpointData;
  }

  /**
   * @description Generate a single property with AI content (typed response)
   * @tags dbtn/module:property_manager
   * @name generate_single_property
   * @summary Generate Single Property
   * @request POST:/routes/generate
   */
  export namespace generate_single_property {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateSinglePropertyData;
  }

  /**
   * @description Migrate images from Supabase storage to the property_images database table. This endpoint will: 1. Scan all Supabase storage buckets for image files 2. Extract property IDs from filenames 3. Create entries in the property_images table for each image 4. Link each image to its corresponding property
   * @tags property-images, dbtn/module:property_image_migrator
   * @name migrate_property_images
   * @summary Migrate Property Images
   * @request POST:/routes/property-image-migrator/migrate-images
   */
  export namespace migrate_property_images {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PropertyImageMigrationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = MigratePropertyImagesData;
  }

  /**
   * @description Start a background task to migrate images from Supabase storage to the property_images database table.
   * @tags property-images, dbtn/module:property_image_migrator
   * @name migrate_property_images_background
   * @summary Migrate Property Images Background
   * @request POST:/routes/property-image-migrator/migrate-images-background
   */
  export namespace migrate_property_images_background {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PropertyImageMigrationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = MigratePropertyImagesBackgroundData;
  }

  /**
   * @description Get the SQL needed to create the property_images table in Supabase.
   * @tags property-images, dbtn/module:property_image_migrator
   * @name get_property_images_table_sql
   * @summary Get Property Images Table Sql
   * @request GET:/routes/property-image-migrator/property-images-table-sql
   */
  export namespace get_property_images_table_sql {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertyImagesTableSqlData;
  }

  /**
   * @description Get the progress of an ongoing or completed migration.
   * @tags property-images, dbtn/module:property_image_migrator
   * @name get_migration_progress
   * @summary Get Migration Progress
   * @request GET:/routes/property-image-migrator/migration-progress/{progress_key}
   */
  export namespace get_migration_progress {
    export type RequestParams = {
      /** Progress Key */
      progressKey: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMigrationProgressData;
  }

  /**
   * @description Get properties with optional filtering
   * @tags dbtn/module:property_manager
   * @name get_properties_endpoint
   * @summary Get Properties Endpoint
   * @request GET:/routes/properties
   */
  export namespace get_properties_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Neighborhood */
      neighborhood?: string | null;
      /** Property Type */
      property_type?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertiesEndpointData;
  }

  /**
   * @description Create a new property.
   * @tags dbtn/module:properties
   * @name create_property2
   * @summary Create Property
   * @request POST:/routes/properties
   */
  export namespace create_property2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PropertyCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateProperty2Data;
  }

  /**
   * @description Get a property by ID
   * @tags dbtn/module:property_manager
   * @name get_property_endpoint
   * @summary Get Property Endpoint
   * @request GET:/routes/properties/{property_id}
   */
  export namespace get_property_endpoint {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertyEndpointData;
  }

  /**
   * @description Update a property.
   * @tags dbtn/module:properties
   * @name update_property
   * @summary Update Property
   * @request PUT:/routes/properties/{property_id}
   */
  export namespace update_property {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = PropertyUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdatePropertyData;
  }

  /**
   * @description Delete a property.
   * @tags dbtn/module:properties
   * @name delete_property
   * @summary Delete Property
   * @request DELETE:/routes/properties/{property_id}
   */
  export namespace delete_property {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeletePropertyData;
  }

  /**
   * @description Search properties.
   * @tags dbtn/module:properties
   * @name search_properties
   * @summary Search Properties
   * @request POST:/routes/properties/search
   */
  export namespace search_properties {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PropertySearch;
    export type RequestHeaders = {};
    export type ResponseBody = SearchPropertiesData;
  }

  /**
   * @description Update all property images with DALL-E, respecting rate limits. Args: image_count: Number of images to generate per property (1-5) force_regenerate: Force regeneration of images even if they already exist
   * @tags dbtn/module:properties
   * @name update_all_property_images
   * @summary Update All Property Images
   * @request POST:/routes/properties/update-all-images
   */
  export namespace update_all_property_images {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateAllPropertyImagesData;
  }

  /**
   * @description Generate SEO-optimized title and subtitle suggestions for luxury properties based on social media research. This endpoint analyzes trends from Instagram, Reddit, and Pinterest to suggest the most effective title and subtitle combinations for property listings in Brasilia. Args: request: Configuration for SEO suggestions including property details and location
   * @tags seo, dbtn/module:seo
   * @name seo_title_subtitle
   * @summary Seo Title Subtitle
   * @request POST:/routes/seo/title-subtitle
   */
  export namespace seo_title_subtitle {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SeoTitleSubtitleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SeoTitleSubtitleData;
  }

  /**
   * @description Generate SEO-optimized title and subtitle suggestions for luxury properties. This endpoint produces high-quality title and subtitle combinations optimized for SEO performance in the luxury real estate market, with special focus on properties in Brasília. Args: request: Configuration for SEO suggestions
   * @tags seo, dbtn/module:seo_enhancer
   * @name seo_title_subtitle2
   * @summary Seo Title Subtitle
   * @request POST:/routes/seo-enhancer/title-subtitle
   */
  export namespace seo_title_subtitle2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SeoTitleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SeoTitleSubtitle2Data;
  }

  /**
   * @description Legacy endpoint for regenerating all properties. This endpoint forwards requests to the new property_generator module. It maintains backward compatibility with older code that uses this endpoint. Args: request: Legacy regeneration request background_tasks: For background processing
   * @tags properties, dbtn/module:property_regenerator
   * @name regenerate_all_properties
   * @summary Regenerate All Properties
   * @request POST:/routes/property-regenerator/regenerate-all-properties
   */
  export namespace regenerate_all_properties {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RegeneratePropertiesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RegenerateAllPropertiesData;
  }

  /**
   * @description Create a property using the storage fallback system
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name create_property_fallback
   * @summary Create Property Fallback
   * @request POST:/routes/property-storage-fallback/properties
   */
  export namespace create_property_fallback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreatePropertyFallbackPayload;
    export type RequestHeaders = {};
    export type ResponseBody = CreatePropertyFallbackData;
  }

  /**
   * @description Get properties using the storage fallback system
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name get_properties_fallback
   * @summary Get Properties Fallback
   * @request GET:/routes/property-storage-fallback/properties
   */
  export namespace get_properties_fallback {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Property Type */
      property_type?: string | null;
      /** Location */
      location?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertiesFallbackData;
  }

  /**
   * @description Get a property by ID using the storage fallback system
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name get_property_fallback
   * @summary Get Property Fallback
   * @request GET:/routes/property-storage-fallback/properties/{property_id}
   */
  export namespace get_property_fallback {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertyFallbackData;
  }

  /**
   * @description Update a property using the storage fallback system
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name update_property_fallback
   * @summary Update Property Fallback
   * @request PUT:/routes/property-storage-fallback/properties/{property_id}
   */
  export namespace update_property_fallback {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdatePropertyFallbackPayload;
    export type RequestHeaders = {};
    export type ResponseBody = UpdatePropertyFallbackData;
  }

  /**
   * @description Delete a property using the storage fallback system
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name delete_property_fallback
   * @summary Delete Property Fallback
   * @request DELETE:/routes/property-storage-fallback/properties/{property_id}
   */
  export namespace delete_property_fallback {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeletePropertyFallbackData;
  }

  /**
   * @description Upload an image for a property using the storage fallback system
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name upload_property_image_fallback
   * @summary Upload Property Image Fallback
   * @request POST:/routes/property-storage-fallback/properties/{property_id}/images
   */
  export namespace upload_property_image_fallback {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UploadPropertyImageFallbackData;
  }

  /**
   * @description Generate properties using the facade pattern to avoid circular dependencies. This endpoint will delegate to the appropriate property generator implementation. Args: request: Configuration for property generation background_tasks: Background tasks runner for async operations Returns: Response containing generated properties
   * @tags properties, dbtn/module:facade, dbtn/module:property_facade
   * @name generate_property_facade
   * @summary Generate Properties
   * @request POST:/routes/property-manager/generate-facade
   */
  export namespace generate_property_facade {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GeneratePropertiesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GeneratePropertyFacadeData;
  }

  /**
   * @description Get a list of properties using the facade pattern to avoid circular dependencies. Args: page: Page number (starts at 1) size: Number of items per page Returns: Response containing the list of properties
   * @tags properties, dbtn/module:facade, properties, dbtn/module:property_facade
   * @name get_properties2
   * @summary Get Properties
   * @request GET:/routes/property-manager/properties-facade
   */
  export namespace get_properties2 {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProperties2Data;
  }

  /**
   * @description Get a single property by ID using the facade pattern. Args: property_id: ID of the property to retrieve Returns: Response containing the property data
   * @tags properties, dbtn/module:facade, dbtn/module:property_facade
   * @name get_property_facade
   * @summary Get Property
   * @request GET:/routes/property-manager/property-facade/{property_id}
   */
  export namespace get_property_facade {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertyFacadeData;
  }

  /**
   * @description Generate one or more properties using AI
   * @tags dbtn/module:property_manager
   * @name generate_property_endpoint
   * @summary Generate Property Endpoint
   * @request POST:/routes/generate-property
   */
  export namespace generate_property_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GeneratePropertiesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GeneratePropertyEndpointData;
  }

  /**
   * @description Get all properties with filtering via POST request (typed response)
   * @tags dbtn/module:property_manager
   * @name filter_properties
   * @summary Filter Properties
   * @request POST:/routes/properties/filter
   */
  export namespace filter_properties {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FilterPropertiesPayload;
    export type RequestHeaders = {};
    export type ResponseBody = FilterPropertiesData;
  }

  /**
   * @description Get a property by ID with typed response
   * @tags dbtn/module:property_manager
   * @name get_property_by_id
   * @summary Get Property By Id
   * @request GET:/routes/property/{property_id}
   */
  export namespace get_property_by_id {
    export type RequestParams = {
      /**
       * Property Id
       * ID of the property to get
       */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertyByIdData;
  }

  /**
   * @description Create a new property with fallback storage
   * @tags dbtn/module:property_fallback
   * @name create_property_fallback2
   * @summary Create Property Fallback
   * @request POST:/routes/property-fallback/create
   * @originalName create_property_fallback
   * @duplicate
   */
  export namespace create_property_fallback2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreatePropertyFallback2Payload;
    export type RequestHeaders = {};
    export type ResponseBody = CreatePropertyFallback2Data;
  }

  /**
   * @description Get properties with optional filtering
   * @tags dbtn/module:property_fallback
   * @name get_properties_fallback2
   * @summary Get Properties Fallback
   * @request GET:/routes/property-fallback/properties
   * @originalName get_properties_fallback
   * @duplicate
   */
  export namespace get_properties_fallback2 {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertiesFallback2Data;
  }

  /**
   * @description Get a property by ID
   * @tags dbtn/module:property_fallback
   * @name get_property_fallback2
   * @summary Get Property Fallback
   * @request GET:/routes/property-fallback/property/{property_id}
   * @originalName get_property_fallback
   * @duplicate
   */
  export namespace get_property_fallback2 {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertyFallback2Data;
  }

  /**
   * @description Update a property
   * @tags dbtn/module:property_fallback
   * @name update_property_fallback2
   * @summary Update Property Fallback
   * @request PUT:/routes/property-fallback/property/{property_id}
   * @originalName update_property_fallback
   * @duplicate
   */
  export namespace update_property_fallback2 {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = PropertyUpdateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdatePropertyFallback2Data;
  }

  /**
   * @description Delete a property
   * @tags dbtn/module:property_fallback
   * @name delete_property_fallback2
   * @summary Delete Property Fallback
   * @request DELETE:/routes/property-fallback/property/{property_id}
   * @originalName delete_property_fallback
   * @duplicate
   */
  export namespace delete_property_fallback2 {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeletePropertyFallback2Data;
  }

  /**
   * @description Upload an image for a property
   * @tags dbtn/module:property_fallback
   * @name upload_property_image_fallback2
   * @summary Upload Property Image Fallback
   * @request POST:/routes/property-fallback/property/{property_id}/upload-image
   * @originalName upload_property_image_fallback
   * @duplicate
   */
  export namespace upload_property_image_fallback2 {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = BodyUploadPropertyImageFallback;
    export type RequestHeaders = {};
    export type ResponseBody = UploadPropertyImageFallback2Data;
  }

  /**
   * @description Generate properties with AI content
   * @tags dbtn/module:property_fallback
   * @name generate_properties
   * @summary Generate Properties
   * @request POST:/routes/property-fallback/generate
   */
  export namespace generate_properties {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GeneratePropertiesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GeneratePropertiesData;
  }

  /**
   * @description Review code using OpenAI's GPT model with retry logic
   * @tags code_review, dbtn/module:code_review
   * @name review_code
   * @summary Review Code
   * @request POST:/routes/review_code
   */
  export namespace review_code {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CodeReviewRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ReviewCodeData;
  }

  /**
   * @description Generate luxury properties in Brasília. This endpoint will generate new luxury properties with detailed descriptions, investment metrics, and features. Each property includes placeholders for images. Args: request: Configuration for property generation
   * @tags properties, dbtn/module:property_generator
   * @name generate_properties2
   * @summary Generate Properties
   * @request POST:/routes/property-generator/generate-properties
   * @originalName generate_properties
   * @duplicate
   */
  export namespace generate_properties2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GeneratePropertiesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateProperties2Data;
  }

  /**
   * @description Update all properties to ensure they have proper images and storage format.
   * @tags properties, dbtn/module:property_updater
   * @name update_property_images_format
   * @summary Update Property Images Format
   * @request POST:/routes/property-updater/update-all-property-images
   */
  export namespace update_property_images_format {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UpdatePropertyImagesFormatData;
  }

  /**
   * @description Update all property images using DALL-E 3 to generate images specific to Brasília luxury real estate. This endpoint will generate new high-quality images for all properties in the database, using DALL-E 3 or DeepSeek to create photorealistic renders of Brasília luxury properties.
   * @tags properties, dbtn/module:property_updater
   * @name update_property_images_with_dalle
   * @summary Update Property Images With Dalle
   * @request POST:/routes/property-updater/update-all-property-images2
   */
  export namespace update_property_images_with_dalle {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UpdatePropertyImagesWithDalleData;
  }

  /**
   * @description Fix the property database structure by migrating images from properties.images JSON to property_images table. This endpoint will: 1. Migrate all images from properties.images JSON to the property_images table 2. Resolve any circular dependencies in the module structure 3. Standardize the image data model 4. Implement better error handling
   * @tags properties, dbtn/module:property_updater
   * @name fix_property_database_endpoint
   * @summary Fix Property Database Endpoint
   * @request POST:/routes/property-updater/fix-property-database
   */
  export namespace fix_property_database_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FixPropertyImagesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixPropertyDatabaseEndpointData;
  }

  /**
   * @description Regenerate luxury properties with enhanced data and images. This endpoint will completely refresh the property database with new luxury properties, each with detailed descriptions, features, and high-quality images. Args: request: Optional configuration for property regeneration background_tasks: Background tasks runner
   * @tags properties, dbtn/module:property_updater
   * @name regenerate_all_properties2
   * @summary Regenerate All Properties
   * @request POST:/routes/property-updater/regenerate-all-properties
   */
  export namespace regenerate_all_properties2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RegeneratePropertiesRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RegenerateAllProperties2Data;
  }

  /**
   * @description Generate images for a property using DALL-E
   * @tags dbtn/module:property_images
   * @name generate_images
   * @summary Generate Images
   * @request POST:/routes/property-images/generate
   */
  export namespace generate_images {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PropertyImageRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateImagesData;
  }

  /**
   * @description Schedule batch image generation for multiple properties
   * @tags dbtn/module:property_images
   * @name batch_generate_images
   * @summary Batch Generate Images
   * @request POST:/routes/property-images/batch-generate
   */
  export namespace batch_generate_images {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BatchImageRequest;
    export type RequestHeaders = {};
    export type ResponseBody = BatchGenerateImagesData;
  }

  /**
   * @description Get status of property images
   * @tags dbtn/module:property_images
   * @name get_property_images_status
   * @summary Get Property Images Status
   * @request GET:/routes/property-images/status/{property_id}
   */
  export namespace get_property_images_status {
    export type RequestParams = {
      /** Property Id */
      propertyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPropertyImagesStatusData;
  }

  /**
   * @description Generate text using DeepSeek AI
   * @tags deepseek, dbtn/module:deepseek_wrapper
   * @name text_generation
   * @summary Text Generation
   * @request POST:/routes/deepseek/text-generation
   */
  export namespace text_generation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisDeepseekWrapperTextGenerationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TextGenerationData;
  }

  /**
   * @description Generate properties using DeepSeek or OpenAI
   * @tags deepseek, dbtn/module:deepseek_wrapper
   * @name generate_property_endpoint2
   * @summary Generate Property Endpoint
   * @request POST:/routes/deepseek/generate-property
   * @originalName generate_property_endpoint
   * @duplicate
   */
  export namespace generate_property_endpoint2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PropertyGenerationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GeneratePropertyEndpoint2Data;
  }

  /**
   * @description Generate an optimized prompt for AI text generation
   * @tags deepseek, dbtn/module:deepseek_wrapper
   * @name generate_prompt_endpoint
   * @summary Generate Prompt Endpoint
   * @request POST:/routes/deepseek/generate-prompt
   */
  export namespace generate_prompt_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Topic */
      topic: string;
      /** Context */
      context?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GeneratePromptEndpointData;
  }

  /**
   * @description Review code for issues and optionally fix them. This endpoint uses OpenAI to analyze code for issues and optionally suggest fixes. Args: request: Review request with code and options
   * @tags utils, dbtn/module:review_code
   * @name review_code2
   * @summary Review Code
   * @request POST:/routes/review-code/review
   * @originalName review_code
   * @duplicate
   */
  export namespace review_code2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ReviewCodeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ReviewCode2Data;
  }

  /**
   * @description Alternative code review endpoint for compatibility. This endpoint is the same as /review but with a different URL for backward compatibility. Args: request: Review request with code and options
   * @tags utils, dbtn/module:review_code
   * @name review_code2
   * @summary Review Code2
   * @request POST:/routes/review-code/review2
   */
  export namespace review_code2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ReviewCodeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ReviewCode2Result;
  }

  /**
   * @description Search for properties using various criteria. Args: request: Search criteria Returns: Response containing matching properties
   * @tags properties, dbtn/module:facade, dbtn/module:property_facade
   * @name search_properties_facade
   * @summary Search Properties
   * @request POST:/routes/property-manager/search-facade
   */
  export namespace search_properties_facade {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisSharedPropertySearchRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SearchPropertiesFacadeData;
  }

  /**
   * @description Fix unterminated string literals in a specific module
   * @tags dbtn/module:api_fixer
   * @name fix_string_literals
   * @summary Fix String Literals
   * @request POST:/routes/fix-strings
   */
  export namespace fix_string_literals {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FixModuleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixStringLiteralsData;
  }

  /**
   * @description Fix unterminated string literals in all modules
   * @tags dbtn/module:api_fixer
   * @name fix_all_string_literals
   * @summary Fix All String Literals
   * @request POST:/routes/fix-all-strings
   */
  export namespace fix_all_string_literals {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisApiFixerFixAllRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllStringLiteralsData;
  }

  /**
   * @description Fix router issues in a specific API module
   * @tags dbtn/module:api_fixer
   * @name fix_module_router
   * @summary Fix Module Router
   * @request POST:/routes/fix-router
   */
  export namespace fix_module_router {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FixModuleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixModuleRouterData;
  }

  /**
   * @description Fix router issues in all API modules
   * @tags dbtn/module:api_fixer
   * @name fix_all_module_routers
   * @summary Fix All Module Routers
   * @request POST:/routes/fix-all-routers
   */
  export namespace fix_all_module_routers {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisApiFixerFixAllRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllModuleRoutersData;
  }

  /**
   * @description Check API module consistency across the app
   * @tags dbtn/module:api_fixer
   * @name check_api_consistency
   * @summary Check Api Consistency
   * @request POST:/routes/consistency-check
   */
  export namespace check_api_consistency {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckApiConsistencyData;
  }

  /**
   * @description Fix syntax issues in a specific API module
   * @tags dbtn/module:api_fixer
   * @name fix_module_syntax
   * @summary Fix Module Syntax
   * @request POST:/routes/fix-module
   */
  export namespace fix_module_syntax {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FixModuleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixModuleSyntaxData;
  }

  /**
   * @description Fix syntax issues in all API modules
   * @tags dbtn/module:api_fixer
   * @name fix_all_modules_syntax
   * @summary Fix All Modules Syntax
   * @request POST:/routes/fix-all-modules
   */
  export namespace fix_all_modules_syntax {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisApiFixerFixAllRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllModulesSyntaxData;
  }

  /**
   * @description Fix missing operation_ids in router decorators
   * @tags dbtn/module:api_fixer
   * @name fix_operation_ids
   * @summary Fix Operation Ids
   * @request POST:/routes/operation-id-fixer-scan
   */
  export namespace fix_operation_ids {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FixOperationIdsData;
  }

  /**
   * @description Check a specific API module for consistency issues.
   * @tags dbtn/module:api_consistency
   * @name check_api_consistency2
   * @summary Check Api Consistency
   * @request POST:/routes/api-consistency/check-module
   * @originalName check_api_consistency
   * @duplicate
   */
  export namespace check_api_consistency2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CheckRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CheckApiConsistency2Data;
  }

  /**
   * @description Fix syntax issues in a specific module.
   * @tags dbtn/module:api_consistency
   * @name fix_module_syntax_endpoint
   * @summary Fix Module Syntax Endpoint
   * @request POST:/routes/api-consistency/fix-module-syntax
   */
  export namespace fix_module_syntax_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FixRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixModuleSyntaxEndpointData;
  }

  /**
   * @description Fix syntax issues in all modules.
   * @tags dbtn/module:api_consistency
   * @name fix_all_modules_syntax_endpoint
   * @summary Fix All Modules Syntax Endpoint
   * @request POST:/routes/api-consistency/fix-all-modules-syntax
   */
  export namespace fix_all_modules_syntax_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AppApisApiConsistencyFixAllRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllModulesSyntaxEndpointData;
  }

  /**
   * @description Check if a specific module can be imported and has a router.
   * @tags dbtn/module:module_checker
   * @name check_module_endpoint
   * @summary Check Module Endpoint
   * @request POST:/routes/module-checker/check-module
   */
  export namespace check_module_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CheckRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CheckModuleEndpointData;
  }

  /**
   * @description Check all modules for import errors and router existence.
   * @tags dbtn/module:module_checker
   * @name check_all_modules_endpoint
   * @summary Check All Modules Endpoint
   * @request POST:/routes/module-checker/check-all-modules
   */
  export namespace check_all_modules_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CheckAllRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CheckAllModulesEndpointData;
  }

  /**
   * @description Fix unterminated string literals in a Python module. Args: module_path: The path to the Python module to fix Returns: dict: Results of the fix operation
   * @tags string-fixer, dbtn/module:string_fixer2
   * @name fix_string_literals2
   * @summary Fix String Literals
   * @request POST:/routes/string-fixer2/fix-string-literals
   * @originalName fix_string_literals
   * @duplicate
   */
  export namespace fix_string_literals2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FixStringLiterals2Payload;
    export type RequestHeaders = {};
    export type ResponseBody = FixStringLiterals2Data;
  }

  /**
   * @description Fix unterminated string literals in all modules with such errors. Returns: dict: Results of the fix operations
   * @tags string-fixer, dbtn/module:string_fixer2
   * @name fix_all_modules
   * @summary Fix All Modules
   * @request POST:/routes/string-fixer2/fix-all-modules
   */
  export namespace fix_all_modules {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllModulesData;
  }

  /**
   * @description Check if a module has syntax errors. Args: module: The name of the module to check Returns: dict: Results of the check
   * @tags string-fixer, dbtn/module:string_fixer2
   * @name check_module
   * @summary Check Module
   * @request GET:/routes/string-fixer2/check-module
   */
  export namespace check_module {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Module */
      module: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckModuleData;
  }

  /**
   * @description Check all modules for syntax errors. Returns: dict: Results of the checks
   * @tags string-fixer, dbtn/module:string_fixer2
   * @name check_all_modules
   * @summary Check All Modules
   * @request GET:/routes/string-fixer2/check-all-modules
   */
  export namespace check_all_modules {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckAllModulesData;
  }

  /**
   * @description Fix unterminated string literals in a Python module. Args: module_name: The name of the module to fix (e.g., "settings") Returns: dict: Results of the fix operation
   * @tags code-fixer, dbtn/module:fix_module
   * @name fix_string_literals3
   * @summary Fix String Literals
   * @request POST:/routes/fix-module/fix-string-literals
   * @originalName fix_string_literals
   * @duplicate
   */
  export namespace fix_string_literals3 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FixStringLiterals3Payload;
    export type RequestHeaders = {};
    export type ResponseBody = FixStringLiterals3Data;
  }

  /**
   * @description Fix unterminated string literals in all API modules. Returns: dict: Results of fix operations
   * @tags code-fixer, dbtn/module:fix_module
   * @name fix_all_modules2
   * @summary Fix All Modules
   * @request POST:/routes/fix-module/fix-all-modules
   * @originalName fix_all_modules
   * @duplicate
   */
  export namespace fix_all_modules2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllModules2Data;
  }

  /**
   * @description Fix unterminated string literals in a Python module by directly adding the missing quote Args: module_name: Name of the module to fix Returns: dict: Status of the operation
   * @tags string-fixer, dbtn/module:string_fixer3
   * @name fix_string_literals3
   * @summary Fix String Literals3
   * @request POST:/routes/string-fixer3/fix-string-literals3
   */
  export namespace fix_string_literals3 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyFixStringLiterals3;
    export type RequestHeaders = {};
    export type ResponseBody = FixStringLiterals3Result;
  }

  /**
   * @description Fix unterminated string literals in all API modules Returns: dict: Status of operations
   * @tags string-fixer, dbtn/module:string_fixer3
   * @name fix_all_modules3
   * @summary Fix All Modules3
   * @request POST:/routes/string-fixer3/fix-all-modules3
   */
  export namespace fix_all_modules3 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllModules3Data;
  }

  /**
   * @description Fix string literals in a specific module.
   * @tags fix-modules, dbtn/module:fix_all_modules
   * @name fix_module
   * @summary Fix Module
   * @request GET:/routes/fix-all-modules/fix_module/{module_name}
   */
  export namespace fix_module {
    export type RequestParams = {
      /** Module Name */
      moduleName: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FixModuleData;
  }

  /**
   * @description Fix string literals in all modules.
   * @tags fix-modules, dbtn/module:fix_all_modules
   * @name fix_all_modules2
   * @summary Fix All Modules2
   * @request GET:/routes/fix-all-modules/fix_all
   */
  export namespace fix_all_modules2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllModules2Result;
  }

  /**
   * @description Check module for common issues.
   * @tags utils, dbtn/module:module_fixer
   * @name check_module2
   * @summary Check Module
   * @request POST:/routes/module-fixer/review
   * @originalName check_module
   * @duplicate
   */
  export namespace check_module2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ModuleFixRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CheckModule2Data;
  }

  /**
   * @description Fix issues in a module.
   * @tags utils, dbtn/module:module_fixer
   * @name fix_module2
   * @summary Fix Module
   * @request POST:/routes/module-fixer/fix
   * @originalName fix_module
   * @duplicate
   */
  export namespace fix_module2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ModuleFixRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FixModule2Data;
  }

  /**
   * @description Check all modules for issues.
   * @tags utils, dbtn/module:module_fixer
   * @name check_all_modules2
   * @summary Check All Modules
   * @request POST:/routes/module-fixer/check-all
   * @originalName check_all_modules
   * @duplicate
   */
  export namespace check_all_modules2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckAllModules2Data;
  }

  /**
   * @description Fix issues in all modules.
   * @tags utils, dbtn/module:module_fixer
   * @name fix_all_modules3
   * @summary Fix All Modules
   * @request POST:/routes/module-fixer/fix-all
   * @originalName fix_all_modules
   * @duplicate
   */
  export namespace fix_all_modules3 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = FixAllModules3Result;
  }

  /**
   * @description Check the health of all API modules.
   * @tags utils, dbtn/module:health_check
   * @name check_health
   * @summary Check Health
   * @request GET:/routes/health-check/
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthResult;
  }
}
