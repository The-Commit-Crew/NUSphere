# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-07-27

### Added

- Added advanced full-text search (FTS), gravity sorting, and pagination.
- Added `DELETE` endpoint for removing posts.
- Added bookmarking functionality to save posts.
- Added support for anonymous posting and commenting.
- Added profile photo upload feature using Cloudinary.
- Added `DELETE` endpoint for removing profile photos.
- Added signed Double Submit Cookie CSRF protection.
- Added AI moderation middleware to filter inappropriate content.
- Added intelligent duplicate detection for topics.
- Added endpoint for creating topics.
- Added API rate limiting using Redis.
- Added project search (`GET /api/projects/search`) and skill filtering (`GET /api/projects/skills`) endpoints.

### Changed

- Changed Swagger API documentation to use centralized schemas, eliminating duplication across route files.
- Changed skill tags to be automatically normalized to uppercase during creation.

### Fixed

- Fixed inability for original authors to edit their anonymous comments.
- Fixed inaccurate comment counts when retrieving posts.
- Fixed JWT refresh token rotation and validation issues.
- Fixed account recovery and forgot password flow.
- Fixed `GET` topic by ID endpoint to return correct topic data.

## [2.0.0] - 2026-06-29

### Added

- Added voting system for posts and comments.
- Added project collaboration board.
- Added user profiles and dashboards.
- Added threaded (nested) comments functionality.
- Added notification pipeline for user activities.
- Added real-time notifications via Socket.io.

### Fixed

- Fixed issues with fetching posts by ID.
- Fixed issues with the fetch all posts endpoint.

## [1.0.0] - 2026-06-01

### Added

- Added user registration and login endpoints.
- Added OTP verification system.
- Added JWT authentication flow.
- Added initial Topic and Post APIs.
- Added Prisma ORM integration.
- Added Supabase PostgreSQL database setup.
- Added integration between frontend and backend.
- Added GitHub Actions CI pipelines for automated testing.
- Added Jest and Supertest for unit and integration testing.
- Added Swagger/OpenAPI documentation.
- Added backend deployment configuration for Azure.
- Added frontend pages for registration, login, and OTP verification.
- Added authentication context for global user state management.
- Added dynamic navigation bar reflecting login/logout state.
- Added homepage layout with topic sidebar and post list.
- Added post cards displaying upvote counts, tags, author, and timestamp.
- Added page for creating new posts.
- Added protected routes to redirect unauthenticated users to the login page.
- Added React Router for client-side navigation.
- Added Tailwind CSS styling and custom color schemes.

### Fixed

- Fixed OTP race conditions occurring in CI tests.
- Fixed Prisma database connection issues in GitHub Actions.
