# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased] [2.0.0]

### Added

- Voting system backend
- Project collaboration backend
- User profile and dashboard backend
- Threaded comments backend

### Fixed

- Getting posts by ID
- Getting all posts endpoint

## [1.0.0] - 2026-05-23

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
