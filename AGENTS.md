# Project Architecture Guidelines

This project uses Hono with an architecture inspired by Laravel.

The purpose of this structure is to maintain clear separation of concerns, predictable file organization, and consistent development patterns across the entire codebase.

## Core Principles

### Routes

All application routes must be defined inside:

```text
src/routes
```

Route files are responsible only for:

* Defining endpoints
* Registering middleware
* Mapping requests to controllers
* Grouping related routes

Routes must not contain business logic or direct database operations.

### Controllers

Controllers are responsible for handling the HTTP layer of the application.

Controller responsibilities include:

* Receiving request data
* Calling the appropriate service
* Returning HTTP responses
* Selecting the correct response status code
* Handling validated input

Controllers must remain small and focused.

Business logic, complex calculations, and database queries must not be placed directly inside controllers.

### Services

All business logic must be placed inside service classes or service modules.

Services are responsible for:

* Executing application rules
* Coordinating multiple operations
* Calling repositories
* Managing workflows
* Performing calculations
* Handling reusable business processes

A service should not depend directly on the HTTP request or response context unless absolutely necessary.

### Repositories

Repositories are responsible for database access.

Repository responsibilities include:

* Creating records
* Reading records
* Updating records
* Deleting records
* Executing database queries
* Encapsulating Drizzle ORM operations

Database queries should normally be placed inside repositories.

For simple modules, direct Drizzle usage may be allowed when creating a repository would add unnecessary complexity.

However, database access patterns must remain consistent within the same module.

### Request Validation

All request validation must use dedicated request schemas.

Request schemas are responsible for:

* Validating request parameters
* Validating query strings
* Validating request bodies
* Transforming input when required
* Providing consistent validation errors

Validation logic must not be duplicated inside controllers or services.

Example location:

```text
src/app/Requests
```

### Database Access

Database access must use one of the following approaches:

```text
Controller → Service → Repository → Drizzle → Database
```

Or, for simple modules:

```text
Controller → Service → Drizzle → Database
```

Controllers must not access the database directly.

### Module Consistency

Always follow the structure and conventions already used by the existing module.

Before creating a new file or folder:

1. Review similar modules in the project.
2. Reuse the existing naming convention.
3. Follow the existing request flow.
4. Avoid introducing a new architectural pattern without a clear reason.

Do not create additional abstraction layers unless they solve a real problem.

### Structure Changes

Do not create a new folder structure, architectural pattern, or abstraction without a clear technical requirement.

Any structural change must:

* Solve an existing problem
* Improve maintainability
* Remain consistent with the project architecture
* Avoid unnecessary complexity
* Be documented when it affects multiple modules

### Preferred Request Flow

The preferred request flow is:

```text
Route
  ↓
Request Schema
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Drizzle ORM
  ↓
Database
```

For simple features, the following flow is acceptable:

```text
Route
  ↓
Request Schema
  ↓
Controller
  ↓
Service
  ↓
Drizzle ORM
  ↓
Database
```

### General Development Rules

* Keep controllers thin.
* Keep business logic inside services.
* Keep database queries inside repositories or approved Drizzle modules.
* Use request schemas for input validation.
* Reuse existing utilities and helpers.
* Avoid duplicate logic.
* Avoid unnecessary abstraction.
* Follow the existing module structure.
* Use clear and consistent file names.
* Keep each file focused on one responsibility.
* Do not introduce a new pattern when an existing pattern already solves the problem.

## Main Objective

The main objective of this architecture is to provide a Laravel-inspired development experience while preserving the lightweight, modular, and flexible nature of Hono.

The project should feel organized and predictable without attempting to replicate Laravel internally.
