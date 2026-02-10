// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { getPool } from "../../backend/database/utils/databaseUtils";

// Import the Route Handlers (Adjust paths to your actual file structure)
import * as validateUser from "../../api/validate-user/route";
import * as isAccountUsed from "../../api/is-account-used/route";
import * as verifyCode from "../../api/verify-code/route";
import * as userAnalytics from "../../api/user-analytics/route";
import * as getAnalytics from "../../api/get-user-analytics/route";
import { IUser } from "@/app/utils/userUtils";
const URL: string = process.env.FULL_URL || "";

// Mock headers for cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    // Mock the .get("session") call to return an object with a .value
    get: vi.fn(() => ({ value: "mocked-jwt-string" })),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock decrypt function
const { decryptMock } = vi.hoisted(() => {
  return {
    decryptMock: vi.fn(),
  };
});
vi.mock("../../lib/session", () => {
  return {
    decrypt: decryptMock,
  };
});

describe("User Utility API Integration", () => {
  const pool = getPool();

  let userID: string;
  const testUser: IUser = {
    email: "integration-test@example.com",
    encrPassword: "Hashed_password_123",
  };

  beforeEach(async () => {
    // Seed
    const seed = await pool.query(
      `
        WITH inserted_users AS (
            INSERT INTO users (email, userpassword) 
            VALUES ($1, $2) 
            RETURNING userid
        )
        INSERT INTO users_settings (userid, colortheme, defaultmodel)
        SELECT userid, 'dark', '{"id": "1", "model_name": "llama3.2:3b"}' 
        FROM inserted_users
        RETURNING userid;
        `,
      [testUser.email, testUser.encrPassword],
    );

    userID = seed.rows[0].userid;

    // mock decrypt function
    decryptMock.mockResolvedValue({
      userId: userID,
    });
  });

  afterEach(async () => {
    await pool.query("DELETE FROM users_analytics WHERE userid = $1", [userID]);
    await pool.query("DELETE FROM email_verification_codes WHERE email = $1", [
      testUser.email,
    ]);
    await pool.query(
      "DELETE FROM users_settings WHERE userid IN (SELECT userid FROM users WHERE email = $1)",
      [testUser.email],
    );
    await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);
  });

  it("should insert a verification code into the database", async () => {
    // Create a mock NextRequest
    const payload = {
      email: "test@example.com",
      code: "123456",
      expiresAt: new Date(Date.now() + 10000).toISOString(),
    };

    const req = new NextRequest(`${URL}/api/validate-user`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Execute the actual POST function
    const response = await validateUser.POST(req);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.message).toContain("User validated successfully");
  });

  it("should return 500 if the database query fails", async () => {
    const req = new NextRequest(`${URL}/api/validate-user`, {
      method: "POST",
      body: JSON.stringify({ email: null }),
    });

    const response = await validateUser.POST(req);
    expect(response.status).toBe(500);
  });

  it("validates a user registration/session via validate-user", async () => {
    const validation_object = {
      email: testUser.email,
      code: "123456",
      expiresAt: new Date(Date.now() + 10000).toISOString(),
    };

    const req = new NextRequest(`${URL}/api/validate-user`, {
      method: "POST",
      body: JSON.stringify(validation_object),
    });

    const response = await validateUser.POST(req);
    expect(response.status).toBe(200);

    // Verify DB state
    const res = await pool.query(
      "SELECT * FROM email_verification_codes WHERE email = $1",
      [testUser.email],
    );
    expect(res.rows[0].code).toBe("123456");
  });

  it("checks if an account email is already in use", async () => {
    // Manually seed the "verified" state
    await pool.query(
      "INSERT INTO email_verification_codes (email, code, expires_at, verified) VALUES ($1, $2, $3, $4)",
      [
        testUser.email,
        "999999",
        new Date(Date.now() + 10000).toISOString(),
        true,
      ],
    );

    const req = new NextRequest(`${URL}/api/is-account-used`, {
      method: "POST",
      body: JSON.stringify({ email: testUser.email }),
    });

    const response = await isAccountUsed.POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    // Based on your original test: data[0] implies an array response
    expect(data[0].verified).toBe(true);
  });

  it("verifies the signup code", async () => {
    await pool.query(
      "INSERT INTO email_verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [testUser.email, "999999", new Date(Date.now() + 10000).toISOString()],
    );

    const req = new NextRequest(`${URL}/api/verify-code`, {
      method: "POST",
      body: JSON.stringify({ email: testUser.email, code: "999999" }),
    });

    const response = await verifyCode.POST(req);
    expect(response.status).toBe(200);
  });

  it("adds and then retrieves user analytics", async () => {
    const analytics = {
      model: { id: 1, model_name: "llama3.2:3b" },
      created_at: new Date().toISOString(), // Use ISO string for consistency
      total_duration: 82617974642,
      load_duration: 69127099622,
      prompt_eval_count: 44,
      prompt_eval_duration: 6792859223,
      eval_count: 20,
      eval_duration: 6269251027,
    };

    const addReq = new NextRequest(`${URL}/api/user-analytics`, {
      method: "POST",
      body: JSON.stringify(analytics),
    });

    const addRes = await userAnalytics.POST(addReq);
    expect(addRes.status).toBe(200);

    const getReq = new NextRequest(
      `${URL}/api/get-user-analytics`,
    );

    const getRes = await getAnalytics.GET(getReq);
    const data = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    // Since we just added one, data should have at least 1 entry
    expect(data.length).toBeGreaterThan(0);
  });
});
