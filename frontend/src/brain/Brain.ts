import {
  AppApisApiConsistencyFixAllRequest,
  AppApisApiFixerFixAllRequest,
  AppApisDeepseekClientTextGenerationRequest,
  AppApisDeepseekWrapperTextGenerationRequest,
  AppApisPropertySearchPropertySearchRequest,
  AppApisSharedPropertySearchRequest,
  BatchGenerateImagesData,
  BatchGenerateImagesError,
  BatchImageRequest,
  BodyFixStringLiterals3,
  BodyUploadMedia,
  BodyUploadPropertyImageFallback,
  BodyUploadPropertyImages,
  BodyUploadScript,
  CheckAllModules2Data,
  CheckAllModulesData,
  CheckAllModulesEndpointData,
  CheckAllModulesEndpointError,
  CheckAllRequest,
  CheckApiConsistency2Data,
  CheckApiConsistency2Error,
  CheckApiConsistencyData,
  CheckHealthData,
  CheckHealthResult,
  CheckModule2Data,
  CheckModule2Error,
  CheckModuleData,
  CheckModuleEndpointData,
  CheckModuleEndpointError,
  CheckModuleError,
  CheckModuleParams,
  CheckRequest,
  CodeReviewRequest,
  CreateProperty2Data,
  CreateProperty2Error,
  CreatePropertyFallback2Data,
  CreatePropertyFallback2Error,
  CreatePropertyFallback2Payload,
  CreatePropertyFallbackData,
  CreatePropertyFallbackError,
  CreatePropertyFallbackPayload,
  DeepseekClientTextGenerationData,
  DeepseekClientTextGenerationError,
  DeleteMediaData,
  DeleteMediaError,
  DeleteMediaParams,
  DeletePropertyData,
  DeletePropertyError,
  DeletePropertyFallback2Data,
  DeletePropertyFallback2Error,
  DeletePropertyFallback2Params,
  DeletePropertyFallbackData,
  DeletePropertyFallbackError,
  DeletePropertyFallbackParams,
  DeletePropertyParams,
  FilterPropertiesData,
  FilterPropertiesError,
  FilterPropertiesPayload,
  FixAllModuleRoutersData,
  FixAllModuleRoutersError,
  FixAllModules2Data,
  FixAllModules2Result,
  FixAllModules3Data,
  FixAllModules3Result,
  FixAllModulesData,
  FixAllModulesSyntaxData,
  FixAllModulesSyntaxEndpointData,
  FixAllModulesSyntaxEndpointError,
  FixAllModulesSyntaxError,
  FixAllStringLiteralsData,
  FixAllStringLiteralsError,
  FixModule2Data,
  FixModule2Error,
  FixModuleData,
  FixModuleError,
  FixModuleParams,
  FixModuleRequest,
  FixModuleRouterData,
  FixModuleRouterError,
  FixModuleSyntaxData,
  FixModuleSyntaxEndpointData,
  FixModuleSyntaxEndpointError,
  FixModuleSyntaxError,
  FixOperationIdsData,
  FixPropertyDatabaseEndpointData,
  FixPropertyDatabaseEndpointError,
  FixPropertyDatabaseSchemaEndpointData,
  FixPropertyDatabaseSchemaEndpointError,
  FixPropertyDatabaseSchemaRequest,
  FixPropertyImagesRequest,
  FixPropertyTypesData,
  FixRequest,
  FixStringLiterals2Data,
  FixStringLiterals2Error,
  FixStringLiterals2Payload,
  FixStringLiterals3Data,
  FixStringLiterals3Error,
  FixStringLiterals3Fail,
  FixStringLiterals3Payload,
  FixStringLiterals3Result,
  FixStringLiteralsData,
  FixStringLiteralsError,
  GenerateDescriptionData,
  GenerateDescriptionError,
  GenerateDescriptionRequest,
  GenerateImagesData,
  GenerateImagesError,
  GeneratePromptEndpointData,
  GeneratePromptEndpointError,
  GeneratePromptEndpointParams,
  GenerateProperties2Data,
  GenerateProperties2Error,
  GeneratePropertiesData,
  GeneratePropertiesError,
  GeneratePropertiesRequest,
  GeneratePropertyEndpoint2Data,
  GeneratePropertyEndpoint2Error,
  GeneratePropertyEndpointData,
  GeneratePropertyEndpointError,
  GeneratePropertyFacadeData,
  GeneratePropertyFacadeError,
  GenerateSinglePropertyData,
  GenerateSinglePropertyError,
  GenerateSinglePropertyParams,
  GenerateTextRequest,
  GetAppInfoData,
  GetMigrationProgressData,
  GetMigrationProgressError,
  GetMigrationProgressParams,
  GetProperties2Data,
  GetProperties2Error,
  GetProperties2Params,
  GetPropertiesEndpointData,
  GetPropertiesEndpointError,
  GetPropertiesEndpointParams,
  GetPropertiesFallback2Data,
  GetPropertiesFallback2Error,
  GetPropertiesFallback2Params,
  GetPropertiesFallbackData,
  GetPropertiesFallbackError,
  GetPropertiesFallbackParams,
  GetPropertyByIdData,
  GetPropertyByIdError,
  GetPropertyByIdParams,
  GetPropertyEndpointData,
  GetPropertyEndpointError,
  GetPropertyEndpointParams,
  GetPropertyFacadeData,
  GetPropertyFacadeError,
  GetPropertyFacadeParams,
  GetPropertyFallback2Data,
  GetPropertyFallback2Error,
  GetPropertyFallback2Params,
  GetPropertyFallbackData,
  GetPropertyFallbackError,
  GetPropertyFallbackParams,
  GetPropertyImagesStatusData,
  GetPropertyImagesStatusError,
  GetPropertyImagesStatusParams,
  GetPropertyImagesTableSqlData,
  GetPropertyTypesData,
  GetSettingsData,
  InitializeCmsSchemaData,
  ListMediaData,
  MigrateFromStrapiData,
  MigratePropertyImagesBackgroundData,
  MigratePropertyImagesBackgroundError,
  MigratePropertyImagesData,
  MigratePropertyImagesError,
  ModuleFixRequest,
  NormalizeFieldNamesData,
  OperationIdFixerScanData,
  OperationIdFixerScanError,
  PropertyCreate,
  PropertyGenerationRequest,
  PropertyImageMigrationRequest,
  PropertyImageRequest,
  PropertySearch,
  PropertyUpdate,
  PropertyUpdateRequest,
  RegenerateAllProperties2Data,
  RegenerateAllProperties2Error,
  RegenerateAllPropertiesData,
  RegenerateAllPropertiesError,
  RegeneratePropertiesRequest,
  ReviewCode2Data,
  ReviewCode2Error,
  ReviewCode2Fail,
  ReviewCode2Result,
  ReviewCodeData,
  ReviewCodeError,
  ReviewCodeRequest,
  RouterTextGenerationData,
  RouterTextGenerationError,
  ScanRequest,
  SearchProperties2Data,
  SearchProperties2Error,
  SearchPropertiesData,
  SearchPropertiesError,
  SearchPropertiesFacadeData,
  SearchPropertiesFacadeError,
  SeoTitleRequest,
  SeoTitleSubtitle2Data,
  SeoTitleSubtitle2Error,
  SeoTitleSubtitleData,
  SeoTitleSubtitleError,
  SeoTitleSubtitleRequest,
  SetupTestDatabaseData,
  TestDatabaseConnectionData,
  TextGenerationData,
  TextGenerationError,
  TranslateData,
  TranslateError,
  TranslateRequest,
  UpdateAllPropertyImagesData,
  UpdateAllPropertyImagesError,
  UpdateAllPropertyImagesParams,
  UpdatePropertyData,
  UpdatePropertyError,
  UpdatePropertyFallback2Data,
  UpdatePropertyFallback2Error,
  UpdatePropertyFallback2Params,
  UpdatePropertyFallbackData,
  UpdatePropertyFallbackError,
  UpdatePropertyFallbackParams,
  UpdatePropertyFallbackPayload,
  UpdatePropertyImagesFormatData,
  UpdatePropertyImagesWithDalleData,
  UpdatePropertyParams,
  UploadMediaData,
  UploadMediaError,
  UploadPropertyImageFallback2Data,
  UploadPropertyImageFallback2Error,
  UploadPropertyImageFallback2Params,
  UploadPropertyImageFallbackData,
  UploadPropertyImageFallbackError,
  UploadPropertyImageFallbackParams,
  UploadPropertyImagesData,
  UploadPropertyImagesError,
  UploadScriptData,
  UploadScriptError,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Upload media files
   *
   * @tags dbtn/module:media
   * @name upload_media
   * @summary Upload Media
   * @request POST:/routes/upload
   */
  upload_media = (data: BodyUploadMedia, params: RequestParams = {}) =>
    this.request<UploadMediaData, UploadMediaError>({
      path: `/routes/upload`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description List all media files
   *
   * @tags dbtn/module:media
   * @name list_media
   * @summary List Media
   * @request GET:/routes/list
   */
  list_media = (params: RequestParams = {}) =>
    this.request<ListMediaData, any>({
      path: `/routes/list`,
      method: "GET",
      ...params,
    });

  /**
   * @description Delete a media file
   *
   * @tags dbtn/module:media
   * @name delete_media
   * @summary Delete Media
   * @request DELETE:/routes/{filename}
   */
  delete_media = ({ filename, ...query }: DeleteMediaParams, params: RequestParams = {}) =>
    this.request<DeleteMediaData, DeleteMediaError>({
      path: `/routes/${filename}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get application information.
   *
   * @tags dbtn/module:apps
   * @name get_app_info
   * @summary Get App Info
   * @request GET:/routes/apps/info
   */
  get_app_info = (params: RequestParams = {}) =>
    this.request<GetAppInfoData, any>({
      path: `/routes/apps/info`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get application settings.
   *
   * @tags dbtn/module:settings
   * @name get_settings
   * @summary Get Settings
   * @request GET:/routes/settings
   */
  get_settings = (params: RequestParams = {}) =>
    this.request<GetSettingsData, any>({
      path: `/routes/settings`,
      method: "GET",
      ...params,
    });

  /**
   * @description Search properties using natural language query
   *
   * @tags dbtn/module:property_search
   * @name search_properties2
   * @summary Search Properties2
   * @request POST:/routes/property-search
   */
  search_properties2 = (data: AppApisPropertySearchPropertySearchRequest, params: RequestParams = {}) =>
    this.request<SearchProperties2Data, SearchProperties2Error>({
      path: `/routes/property-search`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix inconsistent property types in the database
   *
   * @tags dbtn/module:database_repair
   * @name fix_property_types
   * @summary Fix Property Types
   * @request POST:/routes/database-repair/fix-property-types
   */
  fix_property_types = (params: RequestParams = {}) =>
    this.request<FixPropertyTypesData, any>({
      path: `/routes/database-repair/fix-property-types`,
      method: "POST",
      ...params,
    });

  /**
   * @description Upload images for a specific property
   *
   * @tags dbtn/module:database_repair
   * @name upload_property_images
   * @summary Upload Property Images
   * @request POST:/routes/database-repair/upload-property-images
   */
  upload_property_images = (data: BodyUploadPropertyImages, params: RequestParams = {}) =>
    this.request<UploadPropertyImagesData, UploadPropertyImagesError>({
      path: `/routes/database-repair/upload-property-images`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Fix inconsistent field naming (snake_case vs camelCase)
   *
   * @tags dbtn/module:database_repair
   * @name normalize_field_names
   * @summary Normalize Field Names
   * @request POST:/routes/database-repair/normalize-field-names
   */
  normalize_field_names = (params: RequestParams = {}) =>
    this.request<NormalizeFieldNamesData, any>({
      path: `/routes/database-repair/normalize-field-names`,
      method: "POST",
      ...params,
    });

  /**
   * @description Upload and execute a script file (Python, JavaScript, TypeScript, or TSX)
   *
   * @tags dbtn/module:script_uploader
   * @name upload_script
   * @summary Upload Script
   * @request POST:/routes/script-uploader/upload-script
   */
  upload_script = (data: BodyUploadScript, params: RequestParams = {}) =>
    this.request<UploadScriptData, UploadScriptError>({
      path: `/routes/script-uploader/upload-script`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Test the PostgreSQL database connection
   *
   * @tags diagnostics, dbtn/module:database_test
   * @name test_database_connection
   * @summary Test Database Connection
   * @request GET:/routes/database-test/connection
   */
  test_database_connection = (params: RequestParams = {}) =>
    this.request<TestDatabaseConnectionData, any>({
      path: `/routes/database-test/connection`,
      method: "GET",
      ...params,
    });

  /**
   * @description Set up test tables in the PostgreSQL database
   *
   * @tags diagnostics, dbtn/module:database_test
   * @name setup_test_database
   * @summary Setup Test Database
   * @request POST:/routes/database-test/setup
   */
  setup_test_database = (params: RequestParams = {}) =>
    this.request<SetupTestDatabaseData, any>({
      path: `/routes/database-test/setup`,
      method: "POST",
      ...params,
    });

  /**
   * @description Initialize the CMS database schema
   *
   * @tags diagnostics, dbtn/module:database_test
   * @name initialize_cms_schema
   * @summary Initialize Cms Schema
   * @request POST:/routes/database-test/init-cms-schema
   */
  initialize_cms_schema = (params: RequestParams = {}) =>
    this.request<InitializeCmsSchemaData, any>({
      path: `/routes/database-test/init-cms-schema`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get all property types from the CMS. Args: cms_client: Supabase client or None if CMS is unavailable Returns: List of property types
   *
   * @tags cms, dbtn/module:wagtail_cms
   * @name get_property_types
   * @summary Get Property Types
   * @request GET:/routes/wagtail/property-types
   */
  get_property_types = (params: RequestParams = {}) =>
    this.request<GetPropertyTypesData, any>({
      path: `/routes/wagtail/property-types`,
      method: "GET",
      ...params,
    });

  /**
   * @description Translate text from one language to another using OpenAI's GPT model. Includes retry logic with exponential backoff.
   *
   * @tags translation, dbtn/module:translation
   * @name translate
   * @summary Translate
   * @request POST:/routes/translate
   */
  translate = (data: TranslateRequest, params: RequestParams = {}) =>
    this.request<TranslateData, TranslateError>({
      path: `/routes/translate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate a detailed luxury property description
   *
   * @tags properties, dbtn/module:description_generator
   * @name generate_description
   * @summary Generate Description
   * @request POST:/routes/descriptions/generate
   */
  generate_description = (data: GenerateDescriptionRequest, params: RequestParams = {}) =>
    this.request<GenerateDescriptionData, GenerateDescriptionError>({
      path: `/routes/descriptions/generate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate text using DeepSeek AI or OpenAI as fallback
   *
   * @tags ai, dbtn/module:router
   * @name router_text_generation
   * @summary Router Text Generation
   * @request POST:/routes/router-deepseek/generate
   */
  router_text_generation = (data: GenerateTextRequest, params: RequestParams = {}) =>
    this.request<RouterTextGenerationData, RouterTextGenerationError>({
      path: `/routes/router-deepseek/generate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate text using DeepSeek AI with OpenAI fallback
   *
   * @tags ai, dbtn/module:deepseek_client
   * @name deepseek_client_text_generation
   * @summary Deepseek Client Text Generation
   * @request POST:/routes/deepseek-client/generate
   */
  deepseek_client_text_generation = (data: AppApisDeepseekClientTextGenerationRequest, params: RequestParams = {}) =>
    this.request<DeepseekClientTextGenerationData, DeepseekClientTextGenerationError>({
      path: `/routes/deepseek-client/generate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Scan specified directory for duplicate operation IDs
   *
   * @tags utilities, dbtn/module:operation_id_fixer
   * @name operation_id_fixer_scan
   * @summary Scan For Conflicts
   * @request POST:/routes/operation-id-fixer/scan
   */
  operation_id_fixer_scan = (data: ScanRequest, params: RequestParams = {}) =>
    this.request<OperationIdFixerScanData, OperationIdFixerScanError>({
      path: `/routes/operation-id-fixer/scan`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Migrate data from Strapi to the Wagtail-like CMS
   *
   * @tags dbtn/module:data_migration
   * @name migrate_from_strapi
   * @summary Migrate From Strapi
   * @request POST:/routes/migration/strapi-to-cms
   */
  migrate_from_strapi = (params: RequestParams = {}) =>
    this.request<MigrateFromStrapiData, any>({
      path: `/routes/migration/strapi-to-cms`,
      method: "POST",
      ...params,
    });

  /**
   * @description Endpoint to fix property database schema.
   *
   * @tags dbtn/module:db_fix
   * @name fix_property_database_schema_endpoint
   * @summary Fix Property Database Schema Endpoint
   * @request POST:/routes/fix-property-database-schema
   */
  fix_property_database_schema_endpoint = (data: FixPropertyDatabaseSchemaRequest, params: RequestParams = {}) =>
    this.request<FixPropertyDatabaseSchemaEndpointData, FixPropertyDatabaseSchemaEndpointError>({
      path: `/routes/fix-property-database-schema`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate a single property with AI content (typed response)
   *
   * @tags dbtn/module:property_manager
   * @name generate_single_property
   * @summary Generate Single Property
   * @request POST:/routes/generate
   */
  generate_single_property = (query: GenerateSinglePropertyParams, params: RequestParams = {}) =>
    this.request<GenerateSinglePropertyData, GenerateSinglePropertyError>({
      path: `/routes/generate`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Migrate images from Supabase storage to the property_images database table. This endpoint will: 1. Scan all Supabase storage buckets for image files 2. Extract property IDs from filenames 3. Create entries in the property_images table for each image 4. Link each image to its corresponding property
   *
   * @tags property-images, dbtn/module:property_image_migrator
   * @name migrate_property_images
   * @summary Migrate Property Images
   * @request POST:/routes/property-image-migrator/migrate-images
   */
  migrate_property_images = (data: PropertyImageMigrationRequest, params: RequestParams = {}) =>
    this.request<MigratePropertyImagesData, MigratePropertyImagesError>({
      path: `/routes/property-image-migrator/migrate-images`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Start a background task to migrate images from Supabase storage to the property_images database table.
   *
   * @tags property-images, dbtn/module:property_image_migrator
   * @name migrate_property_images_background
   * @summary Migrate Property Images Background
   * @request POST:/routes/property-image-migrator/migrate-images-background
   */
  migrate_property_images_background = (data: PropertyImageMigrationRequest, params: RequestParams = {}) =>
    this.request<MigratePropertyImagesBackgroundData, MigratePropertyImagesBackgroundError>({
      path: `/routes/property-image-migrator/migrate-images-background`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the SQL needed to create the property_images table in Supabase.
   *
   * @tags property-images, dbtn/module:property_image_migrator
   * @name get_property_images_table_sql
   * @summary Get Property Images Table Sql
   * @request GET:/routes/property-image-migrator/property-images-table-sql
   */
  get_property_images_table_sql = (params: RequestParams = {}) =>
    this.request<GetPropertyImagesTableSqlData, any>({
      path: `/routes/property-image-migrator/property-images-table-sql`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get the progress of an ongoing or completed migration.
   *
   * @tags property-images, dbtn/module:property_image_migrator
   * @name get_migration_progress
   * @summary Get Migration Progress
   * @request GET:/routes/property-image-migrator/migration-progress/{progress_key}
   */
  get_migration_progress = ({ progressKey, ...query }: GetMigrationProgressParams, params: RequestParams = {}) =>
    this.request<GetMigrationProgressData, GetMigrationProgressError>({
      path: `/routes/property-image-migrator/migration-progress/${progressKey}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get properties with optional filtering
   *
   * @tags dbtn/module:property_manager
   * @name get_properties_endpoint
   * @summary Get Properties Endpoint
   * @request GET:/routes/properties
   */
  get_properties_endpoint = (query: GetPropertiesEndpointParams, params: RequestParams = {}) =>
    this.request<GetPropertiesEndpointData, GetPropertiesEndpointError>({
      path: `/routes/properties`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new property.
   *
   * @tags dbtn/module:properties
   * @name create_property2
   * @summary Create Property
   * @request POST:/routes/properties
   */
  create_property2 = (data: PropertyCreate, params: RequestParams = {}) =>
    this.request<CreateProperty2Data, CreateProperty2Error>({
      path: `/routes/properties`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a property by ID
   *
   * @tags dbtn/module:property_manager
   * @name get_property_endpoint
   * @summary Get Property Endpoint
   * @request GET:/routes/properties/{property_id}
   */
  get_property_endpoint = ({ propertyId, ...query }: GetPropertyEndpointParams, params: RequestParams = {}) =>
    this.request<GetPropertyEndpointData, GetPropertyEndpointError>({
      path: `/routes/properties/${propertyId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a property.
   *
   * @tags dbtn/module:properties
   * @name update_property
   * @summary Update Property
   * @request PUT:/routes/properties/{property_id}
   */
  update_property = (
    { propertyId, ...query }: UpdatePropertyParams,
    data: PropertyUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdatePropertyData, UpdatePropertyError>({
      path: `/routes/properties/${propertyId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a property.
   *
   * @tags dbtn/module:properties
   * @name delete_property
   * @summary Delete Property
   * @request DELETE:/routes/properties/{property_id}
   */
  delete_property = ({ propertyId, ...query }: DeletePropertyParams, params: RequestParams = {}) =>
    this.request<DeletePropertyData, DeletePropertyError>({
      path: `/routes/properties/${propertyId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Search properties.
   *
   * @tags dbtn/module:properties
   * @name search_properties
   * @summary Search Properties
   * @request POST:/routes/properties/search
   */
  search_properties = (data: PropertySearch, params: RequestParams = {}) =>
    this.request<SearchPropertiesData, SearchPropertiesError>({
      path: `/routes/properties/search`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update all property images with DALL-E, respecting rate limits. Args: image_count: Number of images to generate per property (1-5) force_regenerate: Force regeneration of images even if they already exist
   *
   * @tags dbtn/module:properties
   * @name update_all_property_images
   * @summary Update All Property Images
   * @request POST:/routes/properties/update-all-images
   */
  update_all_property_images = (query: UpdateAllPropertyImagesParams, params: RequestParams = {}) =>
    this.request<UpdateAllPropertyImagesData, UpdateAllPropertyImagesError>({
      path: `/routes/properties/update-all-images`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Generate SEO-optimized title and subtitle suggestions for luxury properties based on social media research. This endpoint analyzes trends from Instagram, Reddit, and Pinterest to suggest the most effective title and subtitle combinations for property listings in Brasilia. Args: request: Configuration for SEO suggestions including property details and location
   *
   * @tags seo, dbtn/module:seo
   * @name seo_title_subtitle
   * @summary Seo Title Subtitle
   * @request POST:/routes/seo/title-subtitle
   */
  seo_title_subtitle = (data: SeoTitleSubtitleRequest, params: RequestParams = {}) =>
    this.request<SeoTitleSubtitleData, SeoTitleSubtitleError>({
      path: `/routes/seo/title-subtitle`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate SEO-optimized title and subtitle suggestions for luxury properties. This endpoint produces high-quality title and subtitle combinations optimized for SEO performance in the luxury real estate market, with special focus on properties in Brasília. Args: request: Configuration for SEO suggestions
   *
   * @tags seo, dbtn/module:seo_enhancer
   * @name seo_title_subtitle2
   * @summary Seo Title Subtitle
   * @request POST:/routes/seo-enhancer/title-subtitle
   */
  seo_title_subtitle2 = (data: SeoTitleRequest, params: RequestParams = {}) =>
    this.request<SeoTitleSubtitle2Data, SeoTitleSubtitle2Error>({
      path: `/routes/seo-enhancer/title-subtitle`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Legacy endpoint for regenerating all properties. This endpoint forwards requests to the new property_generator module. It maintains backward compatibility with older code that uses this endpoint. Args: request: Legacy regeneration request background_tasks: For background processing
   *
   * @tags properties, dbtn/module:property_regenerator
   * @name regenerate_all_properties
   * @summary Regenerate All Properties
   * @request POST:/routes/property-regenerator/regenerate-all-properties
   */
  regenerate_all_properties = (data: RegeneratePropertiesRequest, params: RequestParams = {}) =>
    this.request<RegenerateAllPropertiesData, RegenerateAllPropertiesError>({
      path: `/routes/property-regenerator/regenerate-all-properties`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a property using the storage fallback system
   *
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name create_property_fallback
   * @summary Create Property Fallback
   * @request POST:/routes/property-storage-fallback/properties
   */
  create_property_fallback = (data: CreatePropertyFallbackPayload, params: RequestParams = {}) =>
    this.request<CreatePropertyFallbackData, CreatePropertyFallbackError>({
      path: `/routes/property-storage-fallback/properties`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get properties using the storage fallback system
   *
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name get_properties_fallback
   * @summary Get Properties Fallback
   * @request GET:/routes/property-storage-fallback/properties
   */
  get_properties_fallback = (query: GetPropertiesFallbackParams, params: RequestParams = {}) =>
    this.request<GetPropertiesFallbackData, GetPropertiesFallbackError>({
      path: `/routes/property-storage-fallback/properties`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a property by ID using the storage fallback system
   *
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name get_property_fallback
   * @summary Get Property Fallback
   * @request GET:/routes/property-storage-fallback/properties/{property_id}
   */
  get_property_fallback = ({ propertyId, ...query }: GetPropertyFallbackParams, params: RequestParams = {}) =>
    this.request<GetPropertyFallbackData, GetPropertyFallbackError>({
      path: `/routes/property-storage-fallback/properties/${propertyId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a property using the storage fallback system
   *
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name update_property_fallback
   * @summary Update Property Fallback
   * @request PUT:/routes/property-storage-fallback/properties/{property_id}
   */
  update_property_fallback = (
    { propertyId, ...query }: UpdatePropertyFallbackParams,
    data: UpdatePropertyFallbackPayload,
    params: RequestParams = {},
  ) =>
    this.request<UpdatePropertyFallbackData, UpdatePropertyFallbackError>({
      path: `/routes/property-storage-fallback/properties/${propertyId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a property using the storage fallback system
   *
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name delete_property_fallback
   * @summary Delete Property Fallback
   * @request DELETE:/routes/property-storage-fallback/properties/{property_id}
   */
  delete_property_fallback = ({ propertyId, ...query }: DeletePropertyFallbackParams, params: RequestParams = {}) =>
    this.request<DeletePropertyFallbackData, DeletePropertyFallbackError>({
      path: `/routes/property-storage-fallback/properties/${propertyId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Upload an image for a property using the storage fallback system
   *
   * @tags property-storage-fallback, dbtn/module:property_storage_fallback
   * @name upload_property_image_fallback
   * @summary Upload Property Image Fallback
   * @request POST:/routes/property-storage-fallback/properties/{property_id}/images
   */
  upload_property_image_fallback = (
    { propertyId, ...query }: UploadPropertyImageFallbackParams,
    params: RequestParams = {},
  ) =>
    this.request<UploadPropertyImageFallbackData, UploadPropertyImageFallbackError>({
      path: `/routes/property-storage-fallback/properties/${propertyId}/images`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Generate properties using the facade pattern to avoid circular dependencies. This endpoint will delegate to the appropriate property generator implementation. Args: request: Configuration for property generation background_tasks: Background tasks runner for async operations Returns: Response containing generated properties
   *
   * @tags properties, dbtn/module:facade, dbtn/module:property_facade
   * @name generate_property_facade
   * @summary Generate Properties
   * @request POST:/routes/property-manager/generate-facade
   */
  generate_property_facade = (data: GeneratePropertiesRequest, params: RequestParams = {}) =>
    this.request<GeneratePropertyFacadeData, GeneratePropertyFacadeError>({
      path: `/routes/property-manager/generate-facade`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a list of properties using the facade pattern to avoid circular dependencies. Args: page: Page number (starts at 1) size: Number of items per page Returns: Response containing the list of properties
   *
   * @tags properties, dbtn/module:facade, properties, dbtn/module:property_facade
   * @name get_properties2
   * @summary Get Properties
   * @request GET:/routes/property-manager/properties-facade
   */
  get_properties2 = (query: GetProperties2Params, params: RequestParams = {}) =>
    this.request<GetProperties2Data, GetProperties2Error>({
      path: `/routes/property-manager/properties-facade`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a single property by ID using the facade pattern. Args: property_id: ID of the property to retrieve Returns: Response containing the property data
   *
   * @tags properties, dbtn/module:facade, dbtn/module:property_facade
   * @name get_property_facade
   * @summary Get Property
   * @request GET:/routes/property-manager/property-facade/{property_id}
   */
  get_property_facade = ({ propertyId, ...query }: GetPropertyFacadeParams, params: RequestParams = {}) =>
    this.request<GetPropertyFacadeData, GetPropertyFacadeError>({
      path: `/routes/property-manager/property-facade/${propertyId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Generate one or more properties using AI
   *
   * @tags dbtn/module:property_manager
   * @name generate_property_endpoint
   * @summary Generate Property Endpoint
   * @request POST:/routes/generate-property
   */
  generate_property_endpoint = (data: GeneratePropertiesRequest, params: RequestParams = {}) =>
    this.request<GeneratePropertyEndpointData, GeneratePropertyEndpointError>({
      path: `/routes/generate-property`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all properties with filtering via POST request (typed response)
   *
   * @tags dbtn/module:property_manager
   * @name filter_properties
   * @summary Filter Properties
   * @request POST:/routes/properties/filter
   */
  filter_properties = (data: FilterPropertiesPayload, params: RequestParams = {}) =>
    this.request<FilterPropertiesData, FilterPropertiesError>({
      path: `/routes/properties/filter`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a property by ID with typed response
   *
   * @tags dbtn/module:property_manager
   * @name get_property_by_id
   * @summary Get Property By Id
   * @request GET:/routes/property/{property_id}
   */
  get_property_by_id = ({ propertyId, ...query }: GetPropertyByIdParams, params: RequestParams = {}) =>
    this.request<GetPropertyByIdData, GetPropertyByIdError>({
      path: `/routes/property/${propertyId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new property with fallback storage
   *
   * @tags dbtn/module:property_fallback
   * @name create_property_fallback2
   * @summary Create Property Fallback
   * @request POST:/routes/property-fallback/create
   * @originalName create_property_fallback
   * @duplicate
   */
  create_property_fallback2 = (data: CreatePropertyFallback2Payload, params: RequestParams = {}) =>
    this.request<CreatePropertyFallback2Data, CreatePropertyFallback2Error>({
      path: `/routes/property-fallback/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get properties with optional filtering
   *
   * @tags dbtn/module:property_fallback
   * @name get_properties_fallback2
   * @summary Get Properties Fallback
   * @request GET:/routes/property-fallback/properties
   * @originalName get_properties_fallback
   * @duplicate
   */
  get_properties_fallback2 = (query: GetPropertiesFallback2Params, params: RequestParams = {}) =>
    this.request<GetPropertiesFallback2Data, GetPropertiesFallback2Error>({
      path: `/routes/property-fallback/properties`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a property by ID
   *
   * @tags dbtn/module:property_fallback
   * @name get_property_fallback2
   * @summary Get Property Fallback
   * @request GET:/routes/property-fallback/property/{property_id}
   * @originalName get_property_fallback
   * @duplicate
   */
  get_property_fallback2 = ({ propertyId, ...query }: GetPropertyFallback2Params, params: RequestParams = {}) =>
    this.request<GetPropertyFallback2Data, GetPropertyFallback2Error>({
      path: `/routes/property-fallback/property/${propertyId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a property
   *
   * @tags dbtn/module:property_fallback
   * @name update_property_fallback2
   * @summary Update Property Fallback
   * @request PUT:/routes/property-fallback/property/{property_id}
   * @originalName update_property_fallback
   * @duplicate
   */
  update_property_fallback2 = (
    { propertyId, ...query }: UpdatePropertyFallback2Params,
    data: PropertyUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdatePropertyFallback2Data, UpdatePropertyFallback2Error>({
      path: `/routes/property-fallback/property/${propertyId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a property
   *
   * @tags dbtn/module:property_fallback
   * @name delete_property_fallback2
   * @summary Delete Property Fallback
   * @request DELETE:/routes/property-fallback/property/{property_id}
   * @originalName delete_property_fallback
   * @duplicate
   */
  delete_property_fallback2 = ({ propertyId, ...query }: DeletePropertyFallback2Params, params: RequestParams = {}) =>
    this.request<DeletePropertyFallback2Data, DeletePropertyFallback2Error>({
      path: `/routes/property-fallback/property/${propertyId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Upload an image for a property
   *
   * @tags dbtn/module:property_fallback
   * @name upload_property_image_fallback2
   * @summary Upload Property Image Fallback
   * @request POST:/routes/property-fallback/property/{property_id}/upload-image
   * @originalName upload_property_image_fallback
   * @duplicate
   */
  upload_property_image_fallback2 = (
    { propertyId, ...query }: UploadPropertyImageFallback2Params,
    data: BodyUploadPropertyImageFallback,
    params: RequestParams = {},
  ) =>
    this.request<UploadPropertyImageFallback2Data, UploadPropertyImageFallback2Error>({
      path: `/routes/property-fallback/property/${propertyId}/upload-image`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Generate properties with AI content
   *
   * @tags dbtn/module:property_fallback
   * @name generate_properties
   * @summary Generate Properties
   * @request POST:/routes/property-fallback/generate
   */
  generate_properties = (data: GeneratePropertiesRequest, params: RequestParams = {}) =>
    this.request<GeneratePropertiesData, GeneratePropertiesError>({
      path: `/routes/property-fallback/generate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Review code using OpenAI's GPT model with retry logic
   *
   * @tags code_review, dbtn/module:code_review
   * @name review_code
   * @summary Review Code
   * @request POST:/routes/review_code
   */
  review_code = (data: CodeReviewRequest, params: RequestParams = {}) =>
    this.request<ReviewCodeData, ReviewCodeError>({
      path: `/routes/review_code`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate luxury properties in Brasília. This endpoint will generate new luxury properties with detailed descriptions, investment metrics, and features. Each property includes placeholders for images. Args: request: Configuration for property generation
   *
   * @tags properties, dbtn/module:property_generator
   * @name generate_properties2
   * @summary Generate Properties
   * @request POST:/routes/property-generator/generate-properties
   * @originalName generate_properties
   * @duplicate
   */
  generate_properties2 = (data: GeneratePropertiesRequest, params: RequestParams = {}) =>
    this.request<GenerateProperties2Data, GenerateProperties2Error>({
      path: `/routes/property-generator/generate-properties`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update all properties to ensure they have proper images and storage format.
   *
   * @tags properties, dbtn/module:property_updater
   * @name update_property_images_format
   * @summary Update Property Images Format
   * @request POST:/routes/property-updater/update-all-property-images
   */
  update_property_images_format = (params: RequestParams = {}) =>
    this.request<UpdatePropertyImagesFormatData, any>({
      path: `/routes/property-updater/update-all-property-images`,
      method: "POST",
      ...params,
    });

  /**
   * @description Update all property images using DALL-E 3 to generate images specific to Brasília luxury real estate. This endpoint will generate new high-quality images for all properties in the database, using DALL-E 3 or DeepSeek to create photorealistic renders of Brasília luxury properties.
   *
   * @tags properties, dbtn/module:property_updater
   * @name update_property_images_with_dalle
   * @summary Update Property Images With Dalle
   * @request POST:/routes/property-updater/update-all-property-images2
   */
  update_property_images_with_dalle = (params: RequestParams = {}) =>
    this.request<UpdatePropertyImagesWithDalleData, any>({
      path: `/routes/property-updater/update-all-property-images2`,
      method: "POST",
      ...params,
    });

  /**
   * @description Fix the property database structure by migrating images from properties.images JSON to property_images table. This endpoint will: 1. Migrate all images from properties.images JSON to the property_images table 2. Resolve any circular dependencies in the module structure 3. Standardize the image data model 4. Implement better error handling
   *
   * @tags properties, dbtn/module:property_updater
   * @name fix_property_database_endpoint
   * @summary Fix Property Database Endpoint
   * @request POST:/routes/property-updater/fix-property-database
   */
  fix_property_database_endpoint = (data: FixPropertyImagesRequest, params: RequestParams = {}) =>
    this.request<FixPropertyDatabaseEndpointData, FixPropertyDatabaseEndpointError>({
      path: `/routes/property-updater/fix-property-database`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Regenerate luxury properties with enhanced data and images. This endpoint will completely refresh the property database with new luxury properties, each with detailed descriptions, features, and high-quality images. Args: request: Optional configuration for property regeneration background_tasks: Background tasks runner
   *
   * @tags properties, dbtn/module:property_updater
   * @name regenerate_all_properties2
   * @summary Regenerate All Properties
   * @request POST:/routes/property-updater/regenerate-all-properties
   */
  regenerate_all_properties2 = (data: RegeneratePropertiesRequest, params: RequestParams = {}) =>
    this.request<RegenerateAllProperties2Data, RegenerateAllProperties2Error>({
      path: `/routes/property-updater/regenerate-all-properties`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate images for a property using DALL-E
   *
   * @tags dbtn/module:property_images
   * @name generate_images
   * @summary Generate Images
   * @request POST:/routes/property-images/generate
   */
  generate_images = (data: PropertyImageRequest, params: RequestParams = {}) =>
    this.request<GenerateImagesData, GenerateImagesError>({
      path: `/routes/property-images/generate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Schedule batch image generation for multiple properties
   *
   * @tags dbtn/module:property_images
   * @name batch_generate_images
   * @summary Batch Generate Images
   * @request POST:/routes/property-images/batch-generate
   */
  batch_generate_images = (data: BatchImageRequest, params: RequestParams = {}) =>
    this.request<BatchGenerateImagesData, BatchGenerateImagesError>({
      path: `/routes/property-images/batch-generate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get status of property images
   *
   * @tags dbtn/module:property_images
   * @name get_property_images_status
   * @summary Get Property Images Status
   * @request GET:/routes/property-images/status/{property_id}
   */
  get_property_images_status = ({ propertyId, ...query }: GetPropertyImagesStatusParams, params: RequestParams = {}) =>
    this.request<GetPropertyImagesStatusData, GetPropertyImagesStatusError>({
      path: `/routes/property-images/status/${propertyId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Generate text using DeepSeek AI
   *
   * @tags deepseek, dbtn/module:deepseek_wrapper
   * @name text_generation
   * @summary Text Generation
   * @request POST:/routes/deepseek/text-generation
   */
  text_generation = (data: AppApisDeepseekWrapperTextGenerationRequest, params: RequestParams = {}) =>
    this.request<TextGenerationData, TextGenerationError>({
      path: `/routes/deepseek/text-generation`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate properties using DeepSeek or OpenAI
   *
   * @tags deepseek, dbtn/module:deepseek_wrapper
   * @name generate_property_endpoint2
   * @summary Generate Property Endpoint
   * @request POST:/routes/deepseek/generate-property
   * @originalName generate_property_endpoint
   * @duplicate
   */
  generate_property_endpoint2 = (data: PropertyGenerationRequest, params: RequestParams = {}) =>
    this.request<GeneratePropertyEndpoint2Data, GeneratePropertyEndpoint2Error>({
      path: `/routes/deepseek/generate-property`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate an optimized prompt for AI text generation
   *
   * @tags deepseek, dbtn/module:deepseek_wrapper
   * @name generate_prompt_endpoint
   * @summary Generate Prompt Endpoint
   * @request POST:/routes/deepseek/generate-prompt
   */
  generate_prompt_endpoint = (query: GeneratePromptEndpointParams, params: RequestParams = {}) =>
    this.request<GeneratePromptEndpointData, GeneratePromptEndpointError>({
      path: `/routes/deepseek/generate-prompt`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Review code for issues and optionally fix them. This endpoint uses OpenAI to analyze code for issues and optionally suggest fixes. Args: request: Review request with code and options
   *
   * @tags utils, dbtn/module:review_code
   * @name review_code2
   * @summary Review Code
   * @request POST:/routes/review-code/review
   * @originalName review_code
   * @duplicate
   */
  review_code2 = (data: ReviewCodeRequest, params: RequestParams = {}) =>
    this.request<ReviewCode2Data, ReviewCode2Error>({
      path: `/routes/review-code/review`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Alternative code review endpoint for compatibility. This endpoint is the same as /review but with a different URL for backward compatibility. Args: request: Review request with code and options
   *
   * @tags utils, dbtn/module:review_code
   * @name review_code2
   * @summary Review Code2
   * @request POST:/routes/review-code/review2
   */
  review_code2 = (data: ReviewCodeRequest, params: RequestParams = {}) =>
    this.request<ReviewCode2Result, ReviewCode2Fail>({
      path: `/routes/review-code/review2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Search for properties using various criteria. Args: request: Search criteria Returns: Response containing matching properties
   *
   * @tags properties, dbtn/module:facade, dbtn/module:property_facade
   * @name search_properties_facade
   * @summary Search Properties
   * @request POST:/routes/property-manager/search-facade
   */
  search_properties_facade = (data: AppApisSharedPropertySearchRequest, params: RequestParams = {}) =>
    this.request<SearchPropertiesFacadeData, SearchPropertiesFacadeError>({
      path: `/routes/property-manager/search-facade`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix unterminated string literals in a specific module
   *
   * @tags dbtn/module:api_fixer
   * @name fix_string_literals
   * @summary Fix String Literals
   * @request POST:/routes/fix-strings
   */
  fix_string_literals = (data: FixModuleRequest, params: RequestParams = {}) =>
    this.request<FixStringLiteralsData, FixStringLiteralsError>({
      path: `/routes/fix-strings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix unterminated string literals in all modules
   *
   * @tags dbtn/module:api_fixer
   * @name fix_all_string_literals
   * @summary Fix All String Literals
   * @request POST:/routes/fix-all-strings
   */
  fix_all_string_literals = (data: AppApisApiFixerFixAllRequest, params: RequestParams = {}) =>
    this.request<FixAllStringLiteralsData, FixAllStringLiteralsError>({
      path: `/routes/fix-all-strings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix router issues in a specific API module
   *
   * @tags dbtn/module:api_fixer
   * @name fix_module_router
   * @summary Fix Module Router
   * @request POST:/routes/fix-router
   */
  fix_module_router = (data: FixModuleRequest, params: RequestParams = {}) =>
    this.request<FixModuleRouterData, FixModuleRouterError>({
      path: `/routes/fix-router`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix router issues in all API modules
   *
   * @tags dbtn/module:api_fixer
   * @name fix_all_module_routers
   * @summary Fix All Module Routers
   * @request POST:/routes/fix-all-routers
   */
  fix_all_module_routers = (data: AppApisApiFixerFixAllRequest, params: RequestParams = {}) =>
    this.request<FixAllModuleRoutersData, FixAllModuleRoutersError>({
      path: `/routes/fix-all-routers`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Check API module consistency across the app
   *
   * @tags dbtn/module:api_fixer
   * @name check_api_consistency
   * @summary Check Api Consistency
   * @request POST:/routes/consistency-check
   */
  check_api_consistency = (params: RequestParams = {}) =>
    this.request<CheckApiConsistencyData, any>({
      path: `/routes/consistency-check`,
      method: "POST",
      ...params,
    });

  /**
   * @description Fix syntax issues in a specific API module
   *
   * @tags dbtn/module:api_fixer
   * @name fix_module_syntax
   * @summary Fix Module Syntax
   * @request POST:/routes/fix-module
   */
  fix_module_syntax = (data: FixModuleRequest, params: RequestParams = {}) =>
    this.request<FixModuleSyntaxData, FixModuleSyntaxError>({
      path: `/routes/fix-module`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix syntax issues in all API modules
   *
   * @tags dbtn/module:api_fixer
   * @name fix_all_modules_syntax
   * @summary Fix All Modules Syntax
   * @request POST:/routes/fix-all-modules
   */
  fix_all_modules_syntax = (data: AppApisApiFixerFixAllRequest, params: RequestParams = {}) =>
    this.request<FixAllModulesSyntaxData, FixAllModulesSyntaxError>({
      path: `/routes/fix-all-modules`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix missing operation_ids in router decorators
   *
   * @tags dbtn/module:api_fixer
   * @name fix_operation_ids
   * @summary Fix Operation Ids
   * @request POST:/routes/operation-id-fixer-scan
   */
  fix_operation_ids = (params: RequestParams = {}) =>
    this.request<FixOperationIdsData, any>({
      path: `/routes/operation-id-fixer-scan`,
      method: "POST",
      ...params,
    });

  /**
   * @description Check a specific API module for consistency issues.
   *
   * @tags dbtn/module:api_consistency
   * @name check_api_consistency2
   * @summary Check Api Consistency
   * @request POST:/routes/api-consistency/check-module
   * @originalName check_api_consistency
   * @duplicate
   */
  check_api_consistency2 = (data: CheckRequest, params: RequestParams = {}) =>
    this.request<CheckApiConsistency2Data, CheckApiConsistency2Error>({
      path: `/routes/api-consistency/check-module`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix syntax issues in a specific module.
   *
   * @tags dbtn/module:api_consistency
   * @name fix_module_syntax_endpoint
   * @summary Fix Module Syntax Endpoint
   * @request POST:/routes/api-consistency/fix-module-syntax
   */
  fix_module_syntax_endpoint = (data: FixRequest, params: RequestParams = {}) =>
    this.request<FixModuleSyntaxEndpointData, FixModuleSyntaxEndpointError>({
      path: `/routes/api-consistency/fix-module-syntax`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix syntax issues in all modules.
   *
   * @tags dbtn/module:api_consistency
   * @name fix_all_modules_syntax_endpoint
   * @summary Fix All Modules Syntax Endpoint
   * @request POST:/routes/api-consistency/fix-all-modules-syntax
   */
  fix_all_modules_syntax_endpoint = (data: AppApisApiConsistencyFixAllRequest, params: RequestParams = {}) =>
    this.request<FixAllModulesSyntaxEndpointData, FixAllModulesSyntaxEndpointError>({
      path: `/routes/api-consistency/fix-all-modules-syntax`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Check if a specific module can be imported and has a router.
   *
   * @tags dbtn/module:module_checker
   * @name check_module_endpoint
   * @summary Check Module Endpoint
   * @request POST:/routes/module-checker/check-module
   */
  check_module_endpoint = (data: CheckRequest, params: RequestParams = {}) =>
    this.request<CheckModuleEndpointData, CheckModuleEndpointError>({
      path: `/routes/module-checker/check-module`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Check all modules for import errors and router existence.
   *
   * @tags dbtn/module:module_checker
   * @name check_all_modules_endpoint
   * @summary Check All Modules Endpoint
   * @request POST:/routes/module-checker/check-all-modules
   */
  check_all_modules_endpoint = (data: CheckAllRequest, params: RequestParams = {}) =>
    this.request<CheckAllModulesEndpointData, CheckAllModulesEndpointError>({
      path: `/routes/module-checker/check-all-modules`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix unterminated string literals in a Python module. Args: module_path: The path to the Python module to fix Returns: dict: Results of the fix operation
   *
   * @tags string-fixer, dbtn/module:string_fixer2
   * @name fix_string_literals2
   * @summary Fix String Literals
   * @request POST:/routes/string-fixer2/fix-string-literals
   * @originalName fix_string_literals
   * @duplicate
   */
  fix_string_literals2 = (data: FixStringLiterals2Payload, params: RequestParams = {}) =>
    this.request<FixStringLiterals2Data, FixStringLiterals2Error>({
      path: `/routes/string-fixer2/fix-string-literals`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix unterminated string literals in all modules with such errors. Returns: dict: Results of the fix operations
   *
   * @tags string-fixer, dbtn/module:string_fixer2
   * @name fix_all_modules
   * @summary Fix All Modules
   * @request POST:/routes/string-fixer2/fix-all-modules
   */
  fix_all_modules = (params: RequestParams = {}) =>
    this.request<FixAllModulesData, void>({
      path: `/routes/string-fixer2/fix-all-modules`,
      method: "POST",
      ...params,
    });

  /**
   * @description Check if a module has syntax errors. Args: module: The name of the module to check Returns: dict: Results of the check
   *
   * @tags string-fixer, dbtn/module:string_fixer2
   * @name check_module
   * @summary Check Module
   * @request GET:/routes/string-fixer2/check-module
   */
  check_module = (query: CheckModuleParams, params: RequestParams = {}) =>
    this.request<CheckModuleData, CheckModuleError>({
      path: `/routes/string-fixer2/check-module`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Check all modules for syntax errors. Returns: dict: Results of the checks
   *
   * @tags string-fixer, dbtn/module:string_fixer2
   * @name check_all_modules
   * @summary Check All Modules
   * @request GET:/routes/string-fixer2/check-all-modules
   */
  check_all_modules = (params: RequestParams = {}) =>
    this.request<CheckAllModulesData, void>({
      path: `/routes/string-fixer2/check-all-modules`,
      method: "GET",
      ...params,
    });

  /**
   * @description Fix unterminated string literals in a Python module. Args: module_name: The name of the module to fix (e.g., "settings") Returns: dict: Results of the fix operation
   *
   * @tags code-fixer, dbtn/module:fix_module
   * @name fix_string_literals3
   * @summary Fix String Literals
   * @request POST:/routes/fix-module/fix-string-literals
   * @originalName fix_string_literals
   * @duplicate
   */
  fix_string_literals3 = (data: FixStringLiterals3Payload, params: RequestParams = {}) =>
    this.request<FixStringLiterals3Data, FixStringLiterals3Error>({
      path: `/routes/fix-module/fix-string-literals`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix unterminated string literals in all API modules. Returns: dict: Results of fix operations
   *
   * @tags code-fixer, dbtn/module:fix_module
   * @name fix_all_modules2
   * @summary Fix All Modules
   * @request POST:/routes/fix-module/fix-all-modules
   * @originalName fix_all_modules
   * @duplicate
   */
  fix_all_modules2 = (params: RequestParams = {}) =>
    this.request<FixAllModules2Data, void>({
      path: `/routes/fix-module/fix-all-modules`,
      method: "POST",
      ...params,
    });

  /**
   * @description Fix unterminated string literals in a Python module by directly adding the missing quote Args: module_name: Name of the module to fix Returns: dict: Status of the operation
   *
   * @tags string-fixer, dbtn/module:string_fixer3
   * @name fix_string_literals3
   * @summary Fix String Literals3
   * @request POST:/routes/string-fixer3/fix-string-literals3
   */
  fix_string_literals3 = (data: BodyFixStringLiterals3, params: RequestParams = {}) =>
    this.request<FixStringLiterals3Result, FixStringLiterals3Fail>({
      path: `/routes/string-fixer3/fix-string-literals3`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix unterminated string literals in all API modules Returns: dict: Status of operations
   *
   * @tags string-fixer, dbtn/module:string_fixer3
   * @name fix_all_modules3
   * @summary Fix All Modules3
   * @request POST:/routes/string-fixer3/fix-all-modules3
   */
  fix_all_modules3 = (params: RequestParams = {}) =>
    this.request<FixAllModules3Data, void>({
      path: `/routes/string-fixer3/fix-all-modules3`,
      method: "POST",
      ...params,
    });

  /**
   * @description Fix string literals in a specific module.
   *
   * @tags fix-modules, dbtn/module:fix_all_modules
   * @name fix_module
   * @summary Fix Module
   * @request GET:/routes/fix-all-modules/fix_module/{module_name}
   */
  fix_module = ({ moduleName, ...query }: FixModuleParams, params: RequestParams = {}) =>
    this.request<FixModuleData, FixModuleError>({
      path: `/routes/fix-all-modules/fix_module/${moduleName}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Fix string literals in all modules.
   *
   * @tags fix-modules, dbtn/module:fix_all_modules
   * @name fix_all_modules2
   * @summary Fix All Modules2
   * @request GET:/routes/fix-all-modules/fix_all
   */
  fix_all_modules2 = (params: RequestParams = {}) =>
    this.request<FixAllModules2Result, any>({
      path: `/routes/fix-all-modules/fix_all`,
      method: "GET",
      ...params,
    });

  /**
   * @description Check module for common issues.
   *
   * @tags utils, dbtn/module:module_fixer
   * @name check_module2
   * @summary Check Module
   * @request POST:/routes/module-fixer/review
   * @originalName check_module
   * @duplicate
   */
  check_module2 = (data: ModuleFixRequest, params: RequestParams = {}) =>
    this.request<CheckModule2Data, CheckModule2Error>({
      path: `/routes/module-fixer/review`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Fix issues in a module.
   *
   * @tags utils, dbtn/module:module_fixer
   * @name fix_module2
   * @summary Fix Module
   * @request POST:/routes/module-fixer/fix
   * @originalName fix_module
   * @duplicate
   */
  fix_module2 = (data: ModuleFixRequest, params: RequestParams = {}) =>
    this.request<FixModule2Data, FixModule2Error>({
      path: `/routes/module-fixer/fix`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Check all modules for issues.
   *
   * @tags utils, dbtn/module:module_fixer
   * @name check_all_modules2
   * @summary Check All Modules
   * @request POST:/routes/module-fixer/check-all
   * @originalName check_all_modules
   * @duplicate
   */
  check_all_modules2 = (params: RequestParams = {}) =>
    this.request<CheckAllModules2Data, any>({
      path: `/routes/module-fixer/check-all`,
      method: "POST",
      ...params,
    });

  /**
   * @description Fix issues in all modules.
   *
   * @tags utils, dbtn/module:module_fixer
   * @name fix_all_modules3
   * @summary Fix All Modules
   * @request POST:/routes/module-fixer/fix-all
   * @originalName fix_all_modules
   * @duplicate
   */
  fix_all_modules3 = (params: RequestParams = {}) =>
    this.request<FixAllModules3Result, any>({
      path: `/routes/module-fixer/fix-all`,
      method: "POST",
      ...params,
    });

  /**
   * @description Check the health of all API modules.
   *
   * @tags utils, dbtn/module:health_check
   * @name check_health
   * @summary Check Health
   * @request GET:/routes/health-check/
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthResult, any>({
      path: `/routes/health-check/`,
      method: "GET",
      ...params,
    });
}
