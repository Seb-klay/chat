// @vitest-environment node

import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { getPool } from "../../backend/database/utils/databaseUtils";
import { NextRequest } from "next/server";
import * as createConversation from "../../api/conversation/route";
import * as getUserConversations from "../../api/get-user-conversation/route";
import * as getSingleConversations from "../../api/get-single-conversation/[id]/route";
import * as updateTitleConversation from "../../api/update-title-conversation/route";
import * as deleteConversation from "../../api/delete-conversation/route";
import * as storeMessageRoute from "../../api/message/route";
import * as getHistoryRoute from "../../api/get-history/[id]/route";
import { IPayload } from "@/app/utils/chatUtils";
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
  email: "test@test.com",
  encrPassword: "",
};
const testModel = { id: 1, model_name: "llama3.2:3b" };

describe("Conversation Integration", () => {
  beforeAll(async () => {
    // wait for db to connect in github actions
    new Promise((resolve) => setTimeout(resolve, 5000));
    
    const seed = await pool.query(
      `
        SELECT userid, userPassword
        FROM users
        WHERE email = $1
        `,
      [testUser.email],
    );

    userID = seed.rows[0].userid;

    // mock decrypt function
    decryptMock.mockResolvedValue({
      userId: userID,
    });
  });

  afterEach(async () => {
    await pool.query("DELETE FROM messages");
    await pool.query("DELETE FROM conversations");
  });

  it("fetches all user conversations", async () => {
    await pool.query(
      "INSERT INTO conversations (title, userid, createdat, updatedat, defaultModel, isDeleted) VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12)",
      [
        "Test 1",
        userID,
        new Date(Date.now()),
        new Date(Date.now()),
        testModel,
        false,
        "Test 1",
        userID,
        new Date(Date.now()),
        new Date(Date.now()),
        testModel,
        false,
      ],
    );

    const req = new NextRequest(
      `${URL}/api/get-user-conversation`,
    );
    const response = await getUserConversations.GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.conversations.length).toBe(2);
  });

  it("creates a conversation without a running server", async () => {
    const testTitle = "test 2";

    const req = new NextRequest(`${URL}/api/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: testTitle, defaultModel: testModel }),
    });

    const response = await createConversation.POST(req);
    const data = await response.json();

    // Assert the database state
    const dbCheck = await pool.query(
      "SELECT * FROM conversations WHERE title = $1",
      [testTitle],
    );

    expect(data).toBeDefined();
    expect(dbCheck.rows.length).toBe(1);
    expect(dbCheck.rows[0].title).toBe(testTitle);
  });

  it("fetches a single conversation by ID", async () => {
    const seed = await pool.query(
      "INSERT INTO conversations (title, userid, createdat, updatedat, defaultModel, isDeleted) VALUES ($1, $2, $3, $4, $5, $6) RETURNING convid",
      [
        "Test 3",
        userID,
        new Date(Date.now()),
        new Date(Date.now()),
        testModel,
        false,
      ],
    );
    const targetId = seed.rows[0].convid;

    const req = new NextRequest(
      `${URL}/api/get-single-conversation/${targetId}`,
    );
    const response = await getSingleConversations.GET(req, {
      params: Promise.resolve({ id: targetId }),
    });

    const data = await response.json();
    expect(data[0].convid).toBe(targetId);
    expect(data[0].title).toBe("Test 3");
  });

  it("updates the title of an existing conversation", async () => {
    const seed = await pool.query(
      "INSERT INTO conversations (title, userid, createdat, updatedat, defaultModel, isDeleted) VALUES ($1, $2, $3, $4, $5, $6) RETURNING convid",
      [
        "Old Title",
        userID,
        new Date(Date.now()),
        new Date(Date.now()),
        testModel,
        false,
      ],
    );
    const targetId = seed.rows[0].convid;

    const req = new NextRequest(
      `${URL}/api/update-title-conversation`,
      {
        method: "PUT",
        body: JSON.stringify({ id: targetId, newTitle: "New Shiny Title" }),
      },
    );

    await updateTitleConversation.PUT(req);

    const dbCheck = await pool.query(
      "SELECT title FROM conversations WHERE convid = $1",
      [targetId],
    );
    expect(dbCheck.rows[0].title).toBe("New Shiny Title");
  });

  it("deletes a conversation", async () => {
    const seed = await pool.query(
      "INSERT INTO conversations (title, userid, createdat, updatedat, defaultModel, isDeleted) VALUES ($1, $2, $3, $4, $5, $6) RETURNING convid",
      [
        "To be deleted",
        userID,
        new Date(Date.now()),
        new Date(Date.now()),
        testModel,
        false,
      ],
    );
    const targetId = seed.rows[0].convid;

    const req = new NextRequest(
      `${URL}/api/delete-conversation`,
      {
        method: "DELETE",
        body: JSON.stringify({ id: targetId }),
      },
    );

    await deleteConversation.DELETE(req);

    const dbCheck = await pool.query(
      "SELECT * FROM conversations WHERE convid = $1 AND isdeleted = true",
      [targetId],
    );
    expect(dbCheck.rows.length).toBe(1);
  });

  it("stores a message and then retrieves the history", async () => {
    const seed = await pool.query(
      "INSERT INTO conversations (title, userid, createdat, updatedat, defaultModel, isDeleted) VALUES ($1, $2, $3, $4, $5, $6) RETURNING convid",
      [
        "Seed conversation",
        userID,
        new Date(Date.now()),
        new Date(Date.now()),
        testModel,
        false,
      ],
    );
    const newConvID = seed.rows[0].convid;
    const messagePayload: IPayload = {
      messages: [{ role: "user", content: "Test 6", model: { id: 1 } }],
      conversationID: newConvID,
      isStream: true,
    };

    const postReq = new NextRequest(`${URL}/api/message`, {
      method: "POST",
      body: JSON.stringify({
        message: messagePayload.messages,
        conversationId: messagePayload.conversationID,
      }),
    });

    const postRes = await storeMessageRoute.POST(postReq);
    expect(postRes.status).toBe(200);

    const getReq = new NextRequest(
      `${URL}/api/get-history/${newConvID}`,
    );
    const response = await getHistoryRoute.GET(getReq, {
      params: Promise.resolve({ id: newConvID }),
    });

    const history = await response.json();

    expect(response.status).toBe(200);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].content).toBe("Test 6");
  });
});
function sleep(arg0: number) {
  throw new Error("Function not implemented.");
}

