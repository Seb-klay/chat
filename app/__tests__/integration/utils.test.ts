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

// Mock headers to simulate an active session
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn().mockReturnValue({ value: "test-session-token" }),
  })),
}));

const pool = getPool();

let userID: string;
const testUser: IUser = {
  email: "integration-test@example.com",
  encrPassword: "Hashed_password_123",
};

describe("User Utility API Integration", () => {
  
  beforeEach(async () => {
    // Cleanup and Seed
    await pool.query("DELETE FROM users_analytics WHERE userid = $1", [userID]);
    await pool.query("DELETE FROM email_verification_codes WHERE email = $1", [testUser.email]);
    await pool.query(
      "DELETE FROM users_settings WHERE userid IN (SELECT userid FROM users WHERE email = $1)",
      [testUser.email],
    );
    await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);
    
    const seed = await pool.query(`
        WITH inserted_users AS (
            INSERT INTO users (email, userpassword) 
            VALUES ($1, $2) 
            RETURNING userid
        )
        INSERT INTO users_settings (userid, colortheme, defaultmodel)
        SELECT userid, 'dark', '{"id": "1", "model_name": "llama3.2:3b"}' 
        FROM inserted_users
        RETURNING userid;
        `, [testUser.email, testUser.encrPassword]);

        userID = seed.rows[0].userid;
  });

  afterEach(async () => {
    await pool.query("DELETE FROM users_analytics WHERE userid = $1", [userID]);
    await pool.query("DELETE FROM email_verification_codes WHERE email = $1", [testUser.email]);
    await pool.query(
      "DELETE FROM users_settings WHERE userid IN (SELECT userid FROM users WHERE email = $1)",
      [testUser.email],
    );
    await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);
  });

  it("validates a user registration/session via validate-user", async () => {
    const validation_object = { 
      email: testUser.email, 
      code: "123456", 
      expiresAt: new Date(Date.now() + 10000).toISOString() 
    };

    const req = new NextRequest("http://localhost:3000/api/validate-user", {
      method: "POST",
      body: JSON.stringify(validation_object),
    });

    const response = await validateUser.POST(req);
    expect(response.status).toBe(200);
  });

  it("checks if an account email is already in use", async () => {
    await pool.query(
      "INSERT INTO email_verification_codes (email, code, expires_at, verified) VALUES ($1, $2, $3, $4)",
      [testUser.email, "999999", new Date(Date.now() + 10000).toISOString(), true ]
    );

    const req = new NextRequest("http://localhost:3000/api/is-account-used", {
      method: "POST",
      body: JSON.stringify({ email: testUser.email }),
    });

    const response = await isAccountUsed.POST(req);
    const data = await response?.json();

    expect(response.status).toBe(200);
    expect(data[0].verified).toBe(true);
  });

  it("verifies the signup code", async () => {
    // Manually seed a code to verify
    await pool.query(
      "INSERT INTO email_verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [testUser.email, "999999", new Date(Date.now() + 10000).toISOString() ]
    );

    const req = new NextRequest("http://localhost:3000/api/verify-code", {
      method: "POST",
      body: JSON.stringify({ email: testUser.email, code: "999999" }),
    });

    const response = await verifyCode.POST(req);
    expect(response.status).toBe(200);
  });

  it("adds and then retrieves user analytics", async () => {
    const analytics = {
      model: { id: 1, model_name: "llama3.2:3b" },
      created_at: new Date(Date.now()),
      total_duration: 82617974642,
      load_duration: 69127099622,
      prompt_eval_count: 44,
      prompt_eval_duration: 6792859223,
      eval_count: 20,
      eval_duration: 6269251027
    };

    const addReq = new NextRequest("http://localhost:3000/api/user-analytics", {
      method: "POST",
      body: JSON.stringify(analytics),
    });

    const addRes = await userAnalytics.POST(addReq);
    expect(addRes.status).toBe(200);

    const getReq = new NextRequest("http://localhost:3000/api/get-user-analytics");

    const getRes = await getAnalytics.GET(getReq);
    const data = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});