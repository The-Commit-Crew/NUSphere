# Real-Time WebSockets API (NUSphere)

This document outlines the Socket.IO contract for the frontend to connect to the backend and receive real-time events.

## 1. Connection Details

- **Local URL:** `http://localhost:3000`
- **Production URL:** `https://nusphere-api.azurewebsites.net`
- **Transport:** Socket.IO

## 2. Authentication (Required)

The WebSocket connection is secured using the exact same JWT as the REST API. You must pass the user's JWT token in the `auth` payload during the initial connection handshake.

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI...", // The user's JWT token
  },
});
```

## 3. Rooms & Security

**Do not emit a `joinRoom` event.** For security purposes, the backend automatically extracts the `userId` from the provided JWT and forces the socket into a private room. Users cannot listen to other users' notifications.

## 4. Listening for Events

Currently, the backend pushes one major event to the client.

### Event: `newNotification`

Fired the exact millisecond a user receives a new alert (e.g., someone replies to their comment, upvotes their post, or applies to their project).

**How to listen on the frontend:**

```javascript
socket.on("newNotification", (notification) => {
  console.log("New alert received:", notification);
  // Example: update unread badge counter or trigger a UI Toast pop-up
});
```

**Payload Schema:**

```json
{
  "id": 142,
  "userId": 5,
  "type": "REPLY", // Enum: "REPLY", "UPVOTE", "PROJECT_APPLICATION", etc.
  "message": "Someone replied to your post!",
  "isRead": false,
  "postId": 12, // (Optional) ID of the related post
  "commentId": null, // (Optional) ID of the related comment
  "createdAt": "2026-06-21T10:30:00.000Z"
}
```
