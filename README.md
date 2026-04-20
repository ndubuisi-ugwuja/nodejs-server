# nodejs-server

RESTful Node.js backend
---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Users](#users)
  - [Authentication](#authentication)
  - [Google OAuth](#google-oauth)
- [Testing](#testing)
  - [Unit Tests](#unit-tests)
  - [Staging Tests](#staging-tests)
- [Known Issues & Source Bugs](#known-issues--source-bugs)
- [Scripts](#scripts)

---

## Features

- Full CRUD API for user management
- Local authentication with Passport.js and bcrypt password hashing
- Google OAuth 2.0 authentication
- Session persistence backed by MongoDB via `connect-mongo`
- Input validation on all write endpoints using `express-validator`
- Case-insensitive, regex-based user filtering
- Comprehensive unit test suite (43 tests, zero DB dependencies)
- Comprehensive staging test suite (38 tests, real MongoDB)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Authentication | Passport.js (local + Google OAuth 2.0) |
| Sessions | express-session + connect-mongo |
| Validation | express-validator |
| Password Hashing | bcrypt |
| Testing | Jest + Supertest |
| Code Formatting | Prettier |
| Dev Server | Nodemon |

---

## Project Structure

```
nodejs-server/
├── src/
│   ├── index.mjs                      # App entry point, all route definitions
│   ├── mongoose/
│   │   └── schemas/
│   │       └── user.mjs               # Mongoose User schema
│   ├── strategies/
│   │   ├── local-strategy.mjs         # Passport local strategy
│   │   └── google-strategy.mjs        # Passport Google OAuth strategy
│   └── utils/
│       ├── helpers.mjs                # hashPassword utility
│       └── validationSchemas.mjs      # express-validator schemas
├── tests/
│   ├── unit_tests.test.js             # Unit tests (fully mocked)
│   └── staging_tests.test.js          # Integration tests (real MongoDB)
├── .env                               # Environment variables (not committed)
├── babel.config.js                    # Babel config for Jest ESM support
├── jest.config.js                     # Jest configuration
├── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or higher (ESM support required)
- **MongoDB** running locally on port `27017`, or a connection string to a remote instance
- A **Google Cloud Console** project with OAuth 2.0 credentials (for Google auth only)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/ndubuisi-ugwuja/nodejs-server.git
cd nodejs-server

# Install dependencies
npm install

# Install test dependencies (if not already included)
npm install --save-dev supertest
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost/express-backend

# Session
SESSION_SECRET=your_session_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/google/auth/redirect
```

> **Note:** Never commit `.env` to version control. Add it to `.gitignore`.

---

## Running the Server

```bash
# Production
npm start

# Development (with hot reload via nodemon)
npm run start:dev
```

Server starts on `http://localhost:3000` (or the port defined in `.env`).

---

## API Reference

All request bodies must be `application/json`. All responses are JSON.

---

### Health Check

#### `GET /`

Returns a root directory message and sets a session cookie.

**Response `200`**
```json
{ "msg": "Root directory" }
```

---

### Users

#### `GET /api/users`

Returns all users or filters by a field. The `filter` query parameter is **required** and must be between 3–10 characters.

**Query Parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `filter` | string | Yes | Field name to filter by (3–10 chars) |
| `value` | string | No | Value to match against (regex, case-insensitive) |

**Examples**

```
GET /api/users?filter=username
GET /api/users?filter=username&value=alice
```

**Responses**

| Status | Description |
|---|---|
| `200` | Array of user documents |
| `400` | Validation error — filter missing, too short, or too long |

---

#### `GET /api/users/:username`

Fetches a single user by username.

**Responses**

| Status | Description |
|---|---|
| `200` | User document, or empty body if not found |

---

#### `POST /api/users`

Creates a new user. Password is hashed with bcrypt before storage.

**Request Body**

```json
{
  "username": "alice",
  "password": "SecurePass123"
}
```

**Responses**

| Status | Description |
|---|---|
| `201` | Created user document (password is hashed) |
| `400` | Validation error or duplicate username |

---

#### `PUT /api/users/:username`

Fully replaces a user document. Password is re-hashed.

**Request Body**

```json
{
  "username": "alice",
  "password": "NewSecurePass456"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Updated user document |
| `400` | Validation error |
| `404` | User not found |
| `500` | Internal server error |

---

#### `PATCH /api/users/:username`

Partially updates a user document. Only provided fields are updated.

**Request Body** *(all fields optional)*

```json
{
  "password": "PatchedPass789"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Updated user document |
| `404` | User not found |

---

#### `DELETE /api/users/:username`

Deletes a user by username.

**Responses**

| Status | Description |
|---|---|
| `200` | `{ "message": "User deleted successfully" }` |
| `404` | User not found |

---

### Authentication

#### `POST /api/auth`

Authenticates a user with username and password (Passport local strategy). Creates a session on success.

**Request Body**

```json
{
  "username": "alice",
  "password": "SecurePass123"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | `{ "msg": "Logging success" }` |
| `401` | Invalid credentials |

> **Note:** In Express 5, unauthenticated requests may return `500` instead of `401` if a custom Passport callback is not configured. See [Known Issues](#known-issues--source-bugs).

---

#### `GET /api/auth/status`

Returns the authentication status of the current session.

**Responses**

| Status | Description |
|---|---|
| `200` | `{ "msg": "User is authenticated" }` |
| `401` | `{ "msg": "User not authenticated" }` |

---

#### `POST /api/auth/logout`

Destroys the current session and logs the user out.

**Responses**

| Status | Description |
|---|---|
| `200` | Session destroyed successfully |
| `400` | Logout error |
| `401` | User not authenticated |

---

### Google OAuth

#### `GET /api/google/auth`

Initiates the Google OAuth 2.0 flow. In production, this redirects the browser to Google's consent screen.

---

#### `GET /api/google/auth/redirect`

Google's OAuth callback URL. Passport exchanges the authorization code for a token and creates a session.

**Responses**

| Status | Description |
|---|---|
| `200` | `{ "msg": "Logged in successfully" }` |
| `401` | OAuth flow failed or was denied |

> Configure `GOOGLE_CALLBACK_URL` in `.env` to match the redirect URI registered in your Google Cloud Console project.

---

## Testing

The project has two separate test suites with different purposes and setups.

### Unit Tests

**File:** `tests/unit_tests.test.js`

Fully isolated — no real database, no real bcrypt, no network calls. Every external dependency (Mongoose, Passport, express-session, connect-mongo) is mocked. Tests run fast and can be executed without MongoDB running.

**Run:**

```bash
npm test unit_tests.test.js
```

**Coverage:** 43 tests across all routes and middleware behaviors.

**Key mocking patterns used:**

- **Passport** uses a closure-based `_setAuthHandler` / `_setSessionHandler` approach so per-test auth behavior works even after routes are registered at import time
- **express-session** is replaced with a lightweight in-memory shim that injects `req.session` directly
- **Mongoose** models are replaced with `jest.fn()` stubs that return configurable resolved/rejected values

---

### Staging Tests

**File:** `tests/staging_tests.test.js`

Full integration tests against a **real MongoDB instance**. No mocks. Tests the complete request lifecycle from HTTP through Passport through Mongoose to the database and back.

**Prerequisites:**

- MongoDB running locally: `mongod --dbpath /tmp/db`
- Or via Docker: `docker run -p 27017:27017 mongo`

**Run:**

```bash
npm test staging_tests.test.js
```

**Coverage:** 38 tests across:

- Health check and cookie verification
- Full user CRUD with real DB writes and uniqueness constraints
- bcrypt password hashing verification
- Filter validation with real query execution
- Full local auth session flow: register → login → status check → logout → status check
- Google OAuth route registration checks
- Data integrity assertions (passwords never stored in plain text, uniqueness enforced)

**Cleanup:** The suite deletes all documents it creates in `afterAll`. If a run crashes mid-way, clean up manually:

```js
// In a MongoDB shell or Compass:
db.users.deleteMany({ username: { $in: ["staging_alice", "staging_bob"] } })
```

---

## Known Issues & Source Bugs

### Express 5 + Passport: Wrong credentials return 500 instead of 401

In Express 5, `passport.authenticate("local")` without a custom callback does not automatically send `401` on failure — it forwards the error to Express's default error handler, which returns `500`.

**Fix** in `src/index.mjs`:

```js
// Replace:
app.post("/api/auth", passport.authenticate("local"), (request, response) => {
    response.status(200).send({ msg: "Logging success" })
})

// With:
app.post("/api/auth", (request, response, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) return next(err)
        if (!user) return response.status(401).send({ msg: "Invalid credentials" })
        request.login(user, (err) => {
            if (err) return next(err)
            response.status(200).send({ msg: "Logging success" })
        })
    })(request, response, next)
})
```

### `deserializeUser` references undefined `googleUser`

In `src/index.mjs`, the `deserializeUser` callback references `googleUser` which is never imported:

```js
// Bug:
const findUser = type === "google"
    ? await googleUser.findById(id)   // ← googleUser is not defined
    : await User.findById(id);

// Fix — import your GoogleUser model and use it here:
const findUser = type === "google"
    ? await GoogleUser.findById(id)
    : await User.findById(id);
```

---

## Scripts

| Script | Command | Description |
|---|---|---|
| `npm start` | `node ./src/index.mjs` | Start production server |
| `npm run start:dev` | `nodemon ./src/index.mjs` | Start dev server with hot reload |
| `npm test` | `jest` | Run unit and staging tests |
| `npm run format` | `prettier --write .` | Format all files with Prettier |