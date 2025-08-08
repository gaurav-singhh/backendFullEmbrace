import { Router } from "express";
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  getAllPosts,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(getAllPosts)
  .post(upload.single("featuredImage"), createPost);

router
  .route("/:id")
  .get(getPost)
  .patch(upload.single("featuredImage"), updatePost)
  .delete(deletePost);

export default router;
