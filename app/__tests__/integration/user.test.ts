// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import { getPool } from "../../backend/database/utils/databaseUtils";
import { NextRequest } from "next/server";
import * as authUserRoute from "../../api/authuser/route";
import * as getEmailRoute from "../../api/get-email/route";
import * as deleteUserRoute from "../../api/delete-user/route";
import * as updatePasswordRoute from "../../api/update-password/route";
import * as updateSettingsRoute from "../../api/update-user-settings/route";
import * as getSettingsRoute from "../../api/get-user-settings/route";
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

const pool = getPool();

let userID: string;
const testUser: IUser = {
  email: "integration-test@example.com",
  encrPassword: "Hashed_password_123",
};

describe("User Integration Endpoints", () => {
  beforeEach(async () => {
    // Insert Parent
    const seed = await pool.query(
      "INSERT INTO users (email, userpassword) VALUES ($1, $2) RETURNING userid",
      [testUser.email, testUser.encrPassword],
    );
    userID = seed.rows[0].userid;

    // Insert Child
    await pool.query(
      "INSERT INTO users_settings (userid, colortheme, defaultmodel) VALUES ($1, $2, $3)",
      [userID, "dark", '{"id": "1", "model_name": "llama3.2:3b"}'],
    );

    // mock decrypt function
    decryptMock.mockResolvedValue({
      userId: userID,
    });
  });

  afterEach(async () => {
    await pool.query(
      "DELETE FROM users_settings WHERE userid IN (SELECT userid FROM users WHERE email = $1)",
      [testUser.email],
    );
    await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("verifies the seeded user exists via authuser endpoint", async () => {
    const req = new NextRequest(`${URL}/api/authuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const response = await authUserRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(userID);
  });

  it("authenticates/gets user with email", async () => {
    const req = new NextRequest(`${URL}/api/authuser`, {
      method: "POST",
      body: JSON.stringify({ email: testUser.email }),
    });

    const response = await authUserRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.email).toBe(testUser.email);
  });

  it("retrieves the current user's email", async () => {
    const req = new NextRequest(`${URL}/api/get-email`);
    const response = await getEmailRoute.GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].email).toBeDefined();
  });

  it("updates the user password", async () => {
    const newPassword = "new_secure_password_456";
    const req = new NextRequest(`${URL}/api/update-password`, {
      method: "PUT",
      body: JSON.stringify({ newPassword }),
    });

    const response = await updatePasswordRoute.PUT(req);
    expect(response.status).toBe(200);

    const dbCheck = await pool.query(
      "SELECT userpassword FROM users WHERE email = $1",
      [testUser.email],
    );

    expect(dbCheck.rows[0].password).not.toBe("hashed_password_123");
  });

  it("updates and retrieves user settings (theme and model)", async () => {
    const settings = {
      newTheme: "dark",
      newModel: { id: 2, model_name: "gemma3" },
    };

    const updateReq = new NextRequest(
      `${URL}/api/update-user-settings`,
      {
        method: "PUT",
        body: JSON.stringify(settings),
      },
    );

    const updateRes = await updateSettingsRoute.PUT(updateReq);
    expect(updateRes.status).toBe(200);

    const getReq = new NextRequest(
      `${URL}/api/get-user-settings`,
    );
    const getRes = await getSettingsRoute.GET(getReq);
    const data = await getRes.json();

    expect(data.colortheme).toBe("dark");

    const receivedModel =
      typeof data.defaultmodel === "string"
        ? JSON.parse(data.defaultmodel)
        : data.defaultmodel;
    expect(receivedModel).toEqual({ 
      id: 2, 
      model_name: "gemma3" 
    });
  });

  it("soft deletes a user account", async () => {
    const req = new NextRequest(`${URL}/api/delete-user`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const response = await deleteUserRoute.DELETE(req);
    expect(response.status).toBe(200);

    const dbCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      testUser.email,
    ]);

    expect(dbCheck.rows.length).toBe(1);
  });
});
