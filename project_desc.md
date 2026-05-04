A good practice project should be just complex enough to make you touch the important parts of NestJS without turning into a months-long monster.

A nice real-world idea: Task Approval System (like for a company/team).

Think: employees submit tasks/requests, managers review them, admins manage everything.

App idea: WorkFlow Hub / Request Manager

Users can:

sign up / log in
have roles: admin, manager, employee

Use Supabase for DB + auth support if you want, though implementing JWT auth yourself in Nest is also useful.

Features
1. Auth

Practice:

register
login
JWT access token
password hashing
guards

Routes:

POST /auth/register
POST /auth/login
GET /auth/profile

Concepts used:

AuthModule
JwtModule
Passport
bcrypt
guards
2. Role-based access

Roles:

employee
manager
admin

Example permissions:

Employee

Can:

create request/task
view own requests
update own pending request

Cannot:

approve requests
see others' data

Routes:

POST /requests
GET /requests/my
Manager

Can:

view team requests
approve/reject requests

Routes:

GET /requests/team
PATCH /requests/:id/approve
PATCH /requests/:id/reject

Business logic:

only pending requests can be approved
manager cannot approve already approved/rejected

Good practice for service logic.

Admin

Can:

manage users
assign roles
see analytics

Routes:

GET /users
PATCH /users/:id/role
GET /dashboard/stats

Stats:

total users
pending requests
approved today

This makes you write aggregate queries.

Database tables
users
id
email
password
role
created_at
requests
id
title
description
status (pending/approved/rejected)
created_by
approved_by
created_at

Optional:

department
Business logic examples

This is where NestJS shines.

Example rules:
employee can edit request only if status = pending
manager can approve only once
admin can change anyone role except another admin (optional)

This gives you:

validation
exceptions
guards
custom decorators

Example:

@Roles('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
NestJS concepts you'll practice

You’ll naturally use:

modules
controllers
services
DTOs
pipes (ValidationPipe)
guards
custom decorators
interceptors (optional logging)
exception filters
ORM/DB integration
environment config

Basically: all the important NestJS muscles get exercised.

Optional small advanced features

If you want a tiny challenge later:

email notification on approval
pagination
search requests by status
soft delete

Example:
GET /requests?status=pending&page=1

Folder structure:

src/
  auth/
  users/
  requests/
  common/
    guards/
    decorators/
    enums/

This project is realistic because many internal company tools are basically “submit something → approval flow”.

It’s simple, but not toy-level like todo app (todo apps are the “hello world” of backend projects 😄).

If you want, I can also give you the full database schema + API endpoints list so you can directly start building it.

Nice—before coding, having a blueprint saves a lot of “why did I structure this like spaghetti?” moments.

App: RequestFlow API

A backend app where employees submit work requests/tasks, managers review them, and admins manage users/system.

1. App flow (brief)
Users

There are 3 roles:

1. Employee

Can:

register/login
create request
see own requests
edit own pending request
cancel own pending request

Example:
Employee submits:

"Need leave for 2 days"

Status:
pending

2. Manager

Can:

view requests from employees
approve request
reject request
add rejection reason

Example:
Manager approves:

leave request approved

Status:
approved

3. Admin

Can:

manage all users
assign roles
see system stats

Example:
Admin changes user:
employee -> manager

2. Main business logic

Request lifecycle:

PENDING -> APPROVED
PENDING -> REJECTED
PENDING -> CANCELLED

Rules:

approved request cannot be edited
rejected request cannot be approved later
only creator can edit pending request
only manager can approve/reject
admin can view everything
3. Database schema
users table
users
-----
id
name
email
password
role
created_at
updated_at

Role enum:

employee
manager
admin
requests table
requests
--------
id
title
description
status
rejection_reason
created_by
reviewed_by
reviewed_at
created_at
updated_at

Status enum:

pending
approved
rejected
cancelled

Relations:

users (1) ------ (many) requests
4. Modules architecture
src
│
├── auth
├── users
├── requests
├── common
│   ├── guards
│   ├── decorators
│   ├── enums
│   └── filters
5. API routes diagram
AUTH
│
├── POST /auth/register
├── POST /auth/login
└── GET  /auth/profile
USERS
│
├── GET    /users               [admin]
├── GET    /users/:id           [admin]
├── PATCH  /users/:id/role      [admin]
└── DELETE /users/:id           [admin]
REQUESTS
│
├── POST   /requests                    [employee]
├── GET    /requests/my                 [employee]
├── GET    /requests/:id                [authenticated]
├── PATCH  /requests/:id                [employee]
├── PATCH  /requests/:id/cancel         [employee]
│
├── GET    /requests/team               [manager]
├── PATCH  /requests/:id/approve        [manager]
└── PATCH  /requests/:id/reject         [manager]
DASHBOARD
│
└── GET /dashboard/stats               [admin]

Returns:

{
  "totalUsers": 50,
  "pendingRequests": 12,
  "approvedRequests": 30,
  "rejectedRequests": 8
}
6. Request flow diagram
Employee
   │
   ├── Create Request
   │
   ▼
PENDING
   │
   ├── Approve (Manager) ───► APPROVED
   │
   ├── Reject (Manager) ───► REJECTED
   │
   └── Cancel (Employee) ──► CANCELLED
7. Security/guards flow
Request hits route
   │
   ▼
JWT Auth Guard
   │
   ▼
Roles Guard
   │
   ▼
Controller
   │
   ▼
Service business logic

Example:

PATCH /requests/1/approve

JWT check
→ valid token?

Role check
→ manager?

Business check
→ request pending?

Approve
8. Tech stack

Backend:

NestJS
TypeScript
JWT
bcrypt

Database:

Supabase PostgreSQL

Optional:

Swagger docs
9. Learning concepts covered

This project will force you to practice:

modules
controllers
services
DTOs
validation pipes
guards
JWT auth
role guards
enums
database relations
exception handling
query filters
10. Build order (important)

Don’t randomly code routes like a caffeinated squirrel.

Build in this order:

1. Project setup
2. Database schema
3. Auth
4. Users module
5. Roles guard
6. Requests CRUD
7. Approval logic
8. Dashboard stats
9. Testing with Postman
Final mental picture
Users login
   ↓
Employee creates request
   ↓
Manager reviews
   ↓
Approve/Reject
   ↓
Admin monitors system

That’s the whole app.

We’ll do:

project structure
database schema (users first)
auth module
register/login/profile
1. Recommended project structure
src
├── modules
│   ├── auth
│   │   ├── dto
│   │   ├── guards
│   │   ├── strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │
│   ├── users
│   │   ├── entities
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│
├── common
│   ├── decorators
│   ├── enums
│   ├── filters
│   ├── interfaces
│
├── config
│
├── app.module.ts
└── main.ts

Why?

feature-based modules
shared code separated
scalable
2. users table schema

In Supabase SQL:

create type user_role as enum (
  'employee',
  'manager',
  'admin'
);

create table users (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  email varchar(255) unique not null,
  password text not null,
  role user_role not null default 'employee',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

but i used typeorm