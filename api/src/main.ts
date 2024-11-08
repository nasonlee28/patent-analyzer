import app from "./api";
import { errorHandler } from "./error/exceptions";

const port = 8080;

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Received SIGINT. Shutting down gracefully...");
  server.close(() => {
    console.log("Closed out remaining connections.");
    process.exit(0);
  });
});
