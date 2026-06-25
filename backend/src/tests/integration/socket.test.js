import {
  describe,
  it,
  beforeAll,
  afterAll,
  afterEach,
  expect,
} from "@jest/globals";
import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { initSocket, getIo } from "../../utils/socket.js";
import jwt from "jsonwebtoken";

describe("WebSocket Real-Time Notifications", () => {
  let httpServer;
  let clientSocket;
  let port;

  const TEST_USER_ID = 1001;
  const secret = process.env.ACCESS_TOKEN_SECRET || "test-secret-key";
  const validToken = jwt.sign({ userId: TEST_USER_ID }, secret);

  beforeAll((done) => {
    process.env.ACCESS_TOKEN_SECRET = secret;
    httpServer = createServer();
    initSocket(httpServer, ["http://localhost"]);
    httpServer.listen(() => {
      port = httpServer.address().port;
      done();
    });
  });

  afterAll((done) => {
    getIo().close();
    httpServer.close();
    done();
  });

  afterEach((done) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    done();
  });

  it("should reject connections without a token", (done) => {
    clientSocket = Client(`http://localhost:${port}`);

    clientSocket.on("connect_error", (err) => {
      expect(err.message).toBe("Access denied. No token provided");
      done();
    });
  });

  it("should reject connections with an invalid token", (done) => {
    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: "this.is.a.bad.token" },
    });

    clientSocket.on("connect_error", (err) => {
      expect(err.message).toBe("Invalid or expired token");
      done();
    });
  });

  it("should successfully connect with a valid token and receive notifications", (done) => {
    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: validToken },
    });

    clientSocket.on("connect", () => {
      expect(clientSocket.connected).toBe(true);

      const mockNotification = {
        id: 99,
        userId: TEST_USER_ID,
        type: "UPVOTE",
        message: "Someone upvoted your post!",
      };

      const serverIo = getIo();
      serverIo
        .to(TEST_USER_ID.toString())
        .emit("newNotification", mockNotification);
    });

    clientSocket.on("newNotification", (data) => {
      expect(data.id).toBe(99);
      expect(data.userId).toBe(TEST_USER_ID);
      expect(data.message).toBe("Someone upvoted your post!");
      done();
    });
  });
});
