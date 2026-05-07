# FlowDesk API

> **Created by:** Ahmad Khan
> **Framework:** NestJS | **Architecture:** Modular | **Auth:** JWT + RBAC

A role-based request approval system where employees submit requests, managers approve or reject them, and admins manage users and monitor system activity.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Roles & Permissions](#roles--permissions)
5. [Request Lifecycle](#request-lifecycle)
6. [System Flows](#system-flows)
7. [Database Design](#database-design)
8. [Security Model](#security-model)
9. [API Routes](#api-routes)
10. [Business Rules](#business-rules)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- [NestJS CLI](https://docs.nestjs.com/cli/overview) (optional but recommended)
- A running PostgreSQL (or your configured) database

### Installation

```bash
# Install NestJS CLI globally (if not already installed)
npm install -g @nestjs/cli

# Install project dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory and configure the following:

```env
DB_URI=here  (supabase PostGreSql use here)
JWT_ACCESS_SECRET=here
JWT_REFRESH_SECRET=here
PORT=here|optional default 3000
```

### Running the App

```bash
# Development
npm run start

# Watch mode (auto-reload)
npm run start:dev

# Production
npm run start:prod
```

### Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Project Structure

```
src/
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
│
├── common/
│   ├── jwt.module.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── user.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interfaces/
│   │   └── jwt-payload.interface.ts
│   ├── types/
│   │   └── request-with-user.type.ts
│   └── utils/
│       └── api-response.ts
│
├── config/
│   └── database.config.ts
│
├── database/
│   ├── database.module.ts
│   └── database.service.ts
│
└── modules/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   └── dto/
    │       ├── login-response.dto.ts
    │       ├── loginUser.dto.ts
    │       ├── register-response.dto.ts
    │       └── register.dto.ts
    │
    ├── requests/
    │   ├── requests.controller.ts
    │   ├── requests.module.ts
    │   ├── requests.service.ts
    │   ├── dto/
    │   │   ├── create-request.dto.ts
    │   │   ├── reject-request.dto.ts
    │   │   └── request-query.dto.ts
    │   ├── entities/
    │   │   └── request.entity.ts
    │   └── enums/
    │       └── req-status.enum.ts
    │
    └── users/
        ├── users.controller.ts
        ├── users.module.ts
        ├── users.service.ts
        ├── dto/
        │   └── update-user-role.dto.ts
        ├── entities/
        │   └── user.entity.ts
        └── enums/
            └── user-role.ts
```

---

## Architecture Overview

FlowDesk follows a **modular NestJS architecture** with clear separation of concerns:

| Layer | Purpose |
|---|---|
| **Modules** | Each feature (auth, users, requests) is self-contained |
| **Common** | Shared guards, decorators, interfaces, and utilities |
| **Database** | Isolated database logic using TypeORM |
| **Guards** | Enforce authentication and authorization on routes |
| **DTOs** | Validate incoming request data and shape responses |
| **Entities** | Define database schema via TypeORM decorators |
| **Config** | Centralized environment and database configuration |

---

## Roles & Permissions

### Employee
- Create new requests
- View own requests only
- Update or cancel own pending requests

### Manager
- View all requests (with optional status filter)
- Approve pending requests
- Reject pending requests with a reason

### Admin
- View and manage all users
- Assign and update user roles
- View system-wide analytics

---

## Request Lifecycle

```
PENDING ──► APPROVED
   │
   └────────► REJECTED  (with rejection reason)
   │
   └────────► CANCELLED (by employee)
```

### State Rules

- A request starts as **PENDING** upon creation
- Only **PENDING** requests can be modified or cancelled
- **APPROVED** and **REJECTED** are final states — no further changes allowed
- Only a **Manager** can approve or reject a request
- Only the **Employee** who created the request can cancel it

---

## System Flows

### 1. Authentication Flow

```
User Registers
     │
     ▼
User Logs In
     │
     ▼
JWT Token Issued (includes user role)
     │
     ▼
Token Used on All Protected Routes
```

### 2. Employee Flow

```
Login
  │
  ▼
Create Request  ──►  Saved as PENDING
  │
  ├──► View own requests
  ├──► Update pending request
  └──► Cancel pending request
```

### 3. Manager Flow

```
Login
  │
  ▼
View All Requests (filter by status)
  │
  ├──► Approve  ──►  Status: APPROVED
  └──► Reject   ──►  Status: REJECTED + Reason
```

### 4. Admin Flow

```
Login
  │
  ├──► Manage Users (view, update role, delete)
  └──► View System Analytics // to do
```

---

## Database Design

### Users Table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | string | Full name |
| `email` | string | Unique |
| `password` | string | Hashed |
| `role` | enum | `employee` \| `manager` \| `admin` |
| `createdAt` | timestamp | Auto-generated |

### Requests Table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | string | Request title |
| `description` | string | Request details |
| `status` | enum | `pending` \| `approved` \| `rejected` \| `cancelled` |
| `createdBy` | relation | FK → Users (Employee) |
| `reviewedBy` | relation | FK → Users (Manager), nullable |
| `rejectionReason` | string | Nullable, set on rejection |
| `createdAt` | timestamp | Auto-generated |
| `updatedAt` | timestamp | Auto-updated |

---

## Security Model

| Mechanism | Description |
|---|---|
| **JWT Authentication** | Stateless token-based auth issued on login |
| **RBAC** | Role-based access control enforced per route |
| **Guards** | `JwtAuthGuard` and `RolesGuard` protect endpoints |
| **Custom Decorators** | `@User()` extracts current user, `@Roles()` defines access |
| **DTO Validation** | Input is validated using class-validator before processing |

---

## API Routes

### Auth

| Method | Route | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | Public |
| `POST` | `/auth/login` | Login and receive JWT | Public |
| `GET` | `/auth/profile` | Get logged-in user profile | Authenticated |
| `POST` | `/auth/refresh` | Refresh access token | Authenticated |
| `POST` | `/auth/logout` | Logout user | Authenticated |

---

### Users

> **Admin only**

| Method | Route | Description |
|---|---|---|
| `GET` | `/users` | Get all users |
| `GET` | `/users/:id` | Get user by ID |
| `PATCH` | `/users/:id/role` | Update user role |
| `DELETE` | `/users/:id` | Delete user |

---

### Requests

#### Employee Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/requests` | Create a new request |
| `GET` | `/requests/my` | Get own requests |
| `PATCH` | `/requests/:id/cancel` | Cancel a pending request |

#### Manager Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/requests` | Get all requests (filter by `?status=`) |
| `PATCH` | `/requests/:id/approve` | Approve a pending request |
| `PATCH` | `/requests/:id/reject` | Reject a request with reason |

#### Mixed Access

| Method | Route | Description | Access |
|---|---|---|---|
| `GET` | `/requests/:id` | Get a single request | Employee (own) / Manager / Admin |

---

## Business Rules

1. **Employees** can only view, update, or cancel their own requests.
2. **Managers** handle all approval and rejection decisions.
3. **Admins** manage users and system health — they do not interact with requests directly.
4. A request becomes **immutable** once it reaches `APPROVED` or `REJECTED` state.
5. Only `PENDING` requests can be modified, cancelled, approved, or rejected.
6. A rejection must always include a `rejectionReason`.
7. Cancellation is exclusively an employee action on their own pending request.

---

*FlowDesk API — Built with NestJS, TypeORM, and JWT authentication.*
*Created by **Ahmad Khan**.*
