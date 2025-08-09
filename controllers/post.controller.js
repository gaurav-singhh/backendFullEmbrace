import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

const createPost = asyncHandler(async (req, res) => {
  const { title, content, slug, status } = req.body;
  const authorId = req.user._id;

  if ([title, content, slug].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title, content, and slug are required");
  }

  const existingPost = await Post.findOne({ slug });
  if (existingPost) {
    throw new ApiError(409, "Post with this slug already exists");
  }

  const featuredImageFile = req.file;
  if (!featuredImageFile) {
    throw new ApiError(400, "Featured image is required");
  }

  const featuredImage = await uploadOnCloudinary(featuredImageFile);
  if (!featuredImage) {
    throw new ApiError(500, "Error uploading featured image");
  }

  const post = await Post.create({
    title,
    content,
    slug,
    featuredImage: featuredImage.url,
    status,
    author: authorId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully"));
});

const getPost = asyncHandler(async (req, res) => {
  const { id: slug } = req.params;
  const post = await Post.findOne({ slug }).populate("author", "fullName");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // To match frontend's expectation of an 'owner' field
  const postWithOwner = post.toObject();
  postWithOwner.owner = post.author;
  delete postWithOwner.author;

  return res
    .status(200)
    .json(new ApiResponse(200, postWithOwner, "Post fetched successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { id: slug } = req.params;
  const { title, content, status } = req.body;

  const post = await Post.findOne({ slug });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this post");
  }

  const featuredImageLocalPath = req.file?.path;
  let featuredImage;
  if (featuredImageLocalPath) {
    featuredImage = await uploadOnCloudinary(featuredImageLocalPath);
    if (!featuredImage) {
      throw new ApiError(500, "Error uploading new featured image");
    }
  }

  const updatedPost = await Post.findByIdAndUpdate(
    post._id,
    {
      $set: {
        title,
        content,
        status,
        featuredImage: featuredImage?.url || post.featuredImage,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { id: slug } = req.params;

  const post = await Post.findOne({ slug });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await Post.findByIdAndDelete(post._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: "active" });
  return res
    .status(200)
    .json(new ApiResponse(200, posts, "All active posts fetched successfully"));
});

export { createPost, getPost, updatePost, deletePost, getAllPosts };
