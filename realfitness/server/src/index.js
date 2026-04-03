import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { bootstrapDemoData } from "./services/demoUserService.js";
import authRoutes from "./routes/auth.js";
import photoRoutes from "./routes/photos.js";
import profileRoutes from "./routes/profile.js";
import progressRoutes from "./routes/progress.js";
import workoutsRoutes from "./routes/workouts.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "25mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    app: "RealFitness API",
    message: "Node.js backend is ready for workout plans, daily logs, photos, and future auth."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/photos", photoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  await connectDatabase();
  await bootstrapDemoData();

  app.listen(env.port, env.host, () => {
    console.log(`RealFitness server running on http://${env.host}:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
