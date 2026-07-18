# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-07-27

### Added

- Advanced FTS Search, Gravity Sorting, and Pagination
- DELETE post endpoint
- Bookmarks/Save
- Anonymous posting/commenting
- Profile photo upload feature using Cloudinary
- DELETE endpoint for removing profile photos
- Signed Double Submit Cookie CSRF protection
- AI Moderation middleware
- Intelligent Duplicate Detection
- Create Topic endpoint

### Fixed

- Comment count while getting posts
- JWT refresh tokens
- Account Recovery (forgot password feature)
- Skills Case Normalization
- GET topic by ID endpoint

## [2.0.0] - 2026-06-29

### Added

- Voting system
- Project collaboration board
- User profiles and dashboards
- Threaded comments
- Notifications pipeline
- Real-time notifications using Socket.io

### Fixed

- Getting posts by ID
- Getting all posts endpoint

## [1.0.0] - 2026-06-01

### Added

- User registration and login
- OTP verification system
- JWT authentication
- Topic and post APIs
- Prisma ORM integration
- Supabase PostgreSQL setup
- Frontend/backend integration
- GitHub Actions CI pipelines
- Jest + Supertest test suites
- Swagger/OpenAPI Documentation
- Backend Deployment on Azure
- Frontend registration, login and OTP verification pages
- Auth context for global user state management
- Navbar with dynamic login/logout state
- Homepage layout with topic sidebar and post list
- Post cards with upvote count, tags, author and timestamp
- Create post page
- Protected routes redirecting unauthenticated users to login
- React Router navigation between pages
- Tailwind CSS styling with custom color scheme

### Fixed

- OTP race condition in CI tests
- Prisma connection issues in GitHub Actions
