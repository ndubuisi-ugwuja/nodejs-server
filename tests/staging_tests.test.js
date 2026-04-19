import request from "supertest";
import mongoose from "mongoose";
import app from "../src/index.mjs";

// Suppress expected console.error noise from duplicate key errors
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

// Config

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost/express-backend-staging";

// Credentials used throughout — kept in one place so they're easy to change
const TEST_USER = {
  username: "staging_alice",
  password: "StagingPass123!",
};

const SECOND_USER = {
  username: "staging_bob",
  password: "StagingPass456!",
};

// Setup / Teardown

/**
 * supertest agent — persists cookies across requests so session-based
 * authentication (login → status → logout) works correctly.
 */
const agent = request.agent(app);

beforeAll(async () => {
  // Give mongoose time to connect if index.mjs hasn't finished yet
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  // Clean up any leftover documents from a previous failed run
  await mongoose.connection.collection("users").deleteMany({
    username: { $in: [TEST_USER.username, SECOND_USER.username] },
  });
}, 15000);

afterAll(async () => {
  // Remove all documents created by this suite
  await mongoose.connection.collection("users").deleteMany({
    username: { $in: [TEST_USER.username, SECOND_USER.username] },
  });

  await mongoose.connection.close();
}, 15000);

// Health check

describe("GET /", () => {
  it("returns 200 with the root directory message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ msg: "Root directory" });
  });

  it("sets a session cookie on the response", async () => {
    const response = await request(app).get("/");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("sets a custom cookie with a Max-Age on the response", async () => {
    const response = await request(app).get("/");
    const cookies = response.headers["set-cookie"] ?? [];
    // Find any non-session cookie (session cookie is connect.sid)
    const customCookie = cookies.find((c) => !c.startsWith("connect.sid"));
    expect(customCookie).toBeDefined();
    expect(customCookie).toMatch(/Max-Age=/i);
  });
});

// POST /api/users — user registration

describe("POST /api/users", () => {
  it("creates a new user and returns 201 with the saved document", async () => {
    const response = await request(app)
      .post("/api/users")
      .send(TEST_USER);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ username: TEST_USER.username });
    // Password must be hashed — never stored in plain text
    expect(response.body.password).not.toBe(TEST_USER.password);
    expect(response.body.password).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix
  });

  it("creates a second user successfully", async () => {
    const response = await request(app)
      .post("/api/users")
      .send(SECOND_USER);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ username: SECOND_USER.username });
  });

  it("returns 400 when username is missing", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ password: "somepass" });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 400 when password is missing", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ username: "nobody" });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 400 when the body is empty", async () => {
    const response = await request(app).post("/api/users").send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 400 when username is a duplicate", async () => {
    // staging_alice was already created above
    const response = await request(app)
      .post("/api/users")
      .send(TEST_USER);
    expect(response.status).toBe(400);
  });
});

// GET /api/users — list & filter

describe("GET /api/users", () => {
  it("returns 400 when no filter param is provided", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 400 when filter is too short (< 3 chars)", async () => {
    const response = await request(app)
      .get("/api/users")
      .query({ filter: "ab" });
    expect(response.status).toBe(400);
    expect(response.body.error[0].msg).toBe("Must be 3 - 10 chars");
  });

  it("returns 400 when filter is too long (> 10 chars)", async () => {
    const response = await request(app)
      .get("/api/users")
      .query({ filter: "averylongstring" });
    expect(response.status).toBe(400);
    expect(response.body.error[0].msg).toBe("Must be 3 - 10 chars");
  });

  it("returns all users when a valid filter is given but no value", async () => {
    const response = await request(app)
      .get("/api/users")
      .query({ filter: "username" });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Both staging users should be present
    const usernames = response.body.map((u) => u.username);
    expect(usernames).toContain(TEST_USER.username);
    expect(usernames).toContain(SECOND_USER.username);
  });

  it("filters users by username using a partial value", async () => {
    const response = await request(app)
      .get("/api/users")
      .query({ filter: "username", value: "staging_ali" });
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].username).toBe(TEST_USER.username);
  });

  it("returns an empty array when filter value matches nothing", async () => {
    const response = await request(app)
      .get("/api/users")
      .query({ filter: "username", value: "zzz_no_match_zzz" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("filter is case-insensitive", async () => {
    const response = await request(app)
      .get("/api/users")
      .query({ filter: "username", value: "STAGING_ALICE" });
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });
});

// GET /api/users/:username

describe("GET /api/users/:username", () => {
  it("returns the user document when found", async () => {
    const response = await request(app).get(
      `/api/users/${TEST_USER.username}`
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: TEST_USER.username });
  });

  it("returns an empty body when user does not exist", async () => {
    const response = await request(app).get("/api/users/does_not_exist");
    expect(response.status).toBe(200);
    // Mongoose returns null; Express serialises it as an empty body
    expect(response.body).toEqual({});
  });
});

// PUT /api/users/:username — full replacement

describe("PUT /api/users/:username", () => {
  const updatedPayload = {
    username: TEST_USER.username,
    password: "UpdatedPass999!",
  };

  it("replaces the user document and returns 200", async () => {
    const response = await request(app)
      .put(`/api/users/${TEST_USER.username}`)
      .send(updatedPayload);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: TEST_USER.username });
    // Password should be re-hashed
    expect(response.body.password).not.toBe(updatedPayload.password);
  });

  it("returns 404 when the target user does not exist", async () => {
    const response = await request(app)
      .put("/api/users/ghost_user_xyz")
      .send(updatedPayload);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "User not found" });
  });

  it("returns 400 when the body fails validation", async () => {
    const response = await request(app)
      .put(`/api/users/${TEST_USER.username}`)
      .send({ username: TEST_USER.username }); // missing password
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});

// PATCH /api/users/:username — partial update

describe("PATCH /api/users/:username", () => {
  it("partially updates the user and returns 200", async () => {
    const response = await request(app)
      .patch(`/api/users/${TEST_USER.username}`)
      .send({ password: "PatchedPass789!" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: TEST_USER.username });
    expect(response.body.password).not.toBe("PatchedPass789!");
  });

  it("returns 404 when the target user does not exist", async () => {
    const response = await request(app)
      .patch("/api/users/ghost_user_xyz")
      .send({ password: "whatever" });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "User not found" });
  });
});

// Local authentication flow
//
// Uses `agent` (not `request`) so the session cookie is retained across
// the login → status → logout sequence.

describe("Local authentication flow", () => {
  // Re-create staging_alice with a known password before this suite runs,
  // because the PATCH above may have changed it
  beforeAll(async () => {
    await mongoose.connection.collection("users").deleteOne({
      username: TEST_USER.username,
    });
    await request(app).post("/api/users").send(TEST_USER);
  });

  it("POST /api/auth returns 401 or 500 with wrong credentials", async () => {
    const response = await agent.post("/api/auth").send({
      username: TEST_USER.username,
      password: "completelyWrongPassword",
    });
    expect([401, 500]).toContain(response.status);
  });

  it("POST /api/auth returns 200 with correct credentials", async () => {
    const response = await agent.post("/api/auth").send(TEST_USER);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ msg: "Logging success" });
  });

  it("GET /api/auth/status returns 200 while session is active", async () => {
    // agent carries the session cookie from the login above
    const response = await agent.get("/api/auth/status");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ msg: "User is authenticated" });
  });

  it("POST /api/auth/logout returns 200 and destroys the session", async () => {
    const response = await agent.post("/api/auth/logout");
    expect(response.status).toBe(200);
  });

  it("GET /api/auth/status returns 401 after logout", async () => {
    // Cookie is still sent but session has been destroyed server-side
    const response = await agent.get("/api/auth/status");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ msg: "User not authenticated" });
  });

  it("POST /api/auth/logout returns 401 when already logged out", async () => {
    const response = await agent.post("/api/auth/logout");
    expect(response.status).toBe(401);
  });

  it("GET /api/auth/status returns 401 for a fresh session with no login", async () => {
    // Use a brand-new agent with no session cookie at all
    const freshResponse = await request(app).get("/api/auth/status");
    expect(freshResponse.status).toBe(401);
  });
});

// DELETE /api/users/:username
//
// Placed last so staging_bob is available throughout all earlier suites.

describe("DELETE /api/users/:username", () => {
  it("deletes an existing user and returns 200", async () => {
    const response = await request(app).delete(
      `/api/users/${SECOND_USER.username}`
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "User deleted successfully" });
  });

  it("confirms the deleted user no longer appears in GET /api/users", async () => {
    const response = await request(app)
      .get("/api/users")
      .query({ filter: "username", value: SECOND_USER.username });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 404 when deleting a user that does not exist", async () => {
    const response = await request(app).delete("/api/users/ghost_user_xyz");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "User not found" });
  });
});

// ─── Google OAuth endpoints ───────────────────────────────────────────────────
//
// Full Google OAuth cannot be tested in a staging environment without
// real Google credentials and a live redirect URI. What we CAN verify is
// that the routes exist and respond correctly when Passport fails to initiate
// the flow (which it will, since no GOOGLE_CLIENT_ID/SECRET are configured).

describe("GET /api/google/auth", () => {
  it("responds (does not 404) — route is registered", async () => {
    const response = await request(app).get("/api/google/auth");
    // Passport will either redirect (302) or error — anything but 404
    expect(response.status).not.toBe(404);
  });
});

describe("GET /api/google/auth/redirect", () => {
  it("responds (does not 404) — route is registered", async () => {
    const response = await request(app).get("/api/google/auth/redirect");
    expect(response.status).not.toBe(404);
  });
});

// ─── Data integrity ───────────────────────────────────────────────────────────

describe("Data integrity", () => {
  it("passwords are never stored or returned in plain text", async () => {
    const response = await request(app)
      .get("/api/users")
      .query({ filter: "username", value: "staging" });
    expect(response.status).toBe(200);
    for (const user of response.body) {
      expect(user.password).not.toBe(TEST_USER.password);
      expect(user.password).not.toBe(SECOND_USER.password);
      // bcrypt hashes always start with $2a$ or $2b$
      if (user.password) {
        expect(user.password).toMatch(/^\$2[ab]\$/);
      }
    }
  });

  it("usernames are unique — duplicate registration returns 400", async () => {
    const firstResponse = await request(app)
      .post("/api/users")
      .send({ username: "unique_check_user", password: "pass123" });
    // Could be 201 (first time) or 400 (if leftover from prior run)
    expect([201, 400]).toContain(firstResponse.status);

    const secondResponse = await request(app)
      .post("/api/users")
      .send({ username: "unique_check_user", password: "pass123" });
    expect(secondResponse.status).toBe(400);

    // Cleanup
    await mongoose.connection
      .collection("users")
      .deleteOne({ username: "unique_check_user" });
  });

  it("GET /api/users/:username returns the correct user, not a different one", async () => {
    const response = await request(app).get(
      `/api/users/${TEST_USER.username}`
    );
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(TEST_USER.username);
    expect(response.body.username).not.toBe(SECOND_USER.username);
  });
});