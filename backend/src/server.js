import "dotenv/config";
import app, { allowedOrigins } from "./app.js";
import http from "http";
import { initSocket } from "./utils/socket.js";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server, allowedOrigins);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}...`);
});
