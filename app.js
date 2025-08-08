import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// DEV-ONLY: This allows any origin by reflecting the request origin.
// For production, you should configure a strict whitelist of allowed origins.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

export { app };
