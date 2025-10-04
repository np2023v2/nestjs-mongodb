# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-04

### Added
- Initial release of NestJS MongoDB module
- MongooseModule wrapper with sync/async configuration
- BaseModel with automatic timestamps and JSON transformations
- BaseRepository with comprehensive CRUD operations
- Pagination support with customizable options
- Query utilities for building complex MongoDB queries
  - `buildTextSearchQuery` - Search across multiple text fields
  - `buildDateRangeQuery` - Filter by date ranges
  - `buildFilterQuery` - Build queries from filter objects
  - `mergeFilterQueries` - Combine multiple queries
  - `buildProjection` - Select specific fields
  - `buildSortObject` - Build sort objects from arrays
- Connection utilities
  - `isValidObjectId` - Validate ObjectId strings
  - `toObjectId` - Convert string to ObjectId
  - `generateObjectId` - Generate new ObjectIds
  - `isConnectionReady` - Check connection status
  - `waitForConnection` - Wait for connection to be ready
  - `closeConnection` - Safely close connections
- Custom decorators for dependency injection
  - `@InjectModel` - Inject Mongoose models
  - `@InjectRepository` - Inject repository instances
- Comprehensive TypeScript definitions
- Full test coverage
- Complete documentation with examples
- Example implementations showing real-world usage
