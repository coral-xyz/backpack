import type { Express } from "express-serve-static-core";
import request from "supertest";

import app from "../../../src";

// Test user mnemonic:
// isolate aerobic doctor size change item panther knife bulb monster evoke tree

export const validCreatePayload = {
  username: "test_user",
  inviteCode: "28faf67b-af3c-4f25-bf0c-5e89dfb6c30d",
  blockchainPublicKeys: [
    {
      blockchain: "solana",
      publicKey: "6TkBZ4F5mRNYrXDmoSofXE6yJLJHwCGpFupkTEQuEhqs",
      signature:
        "46fyw1m5J2s6nHxdaa1BWGDCeP88EmFgPgJfXYj3Vvqbnce92jtTCToL8JuDd1N1uoXixCnjgaQ7g1YsEbaHzzxB",
    },
  ],
};

export const createTestUser = () => {
  return request(app).post("/users").send(validCreatePayload);
};

describe("POST /users", () => {
  it("should create a user", async () => {
    const response = await createTestUser();
    expect(response.statusCode).toEqual(201);
    console.log(response.body);
  });
});
