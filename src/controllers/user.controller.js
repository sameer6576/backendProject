import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // take data from user
  // validate the data
  // check for duplicate data in db
  // check for images,avatar
  // upload them to cloudinary
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response else send error

  const { username, fullName, email, password } = req.body;
  console.log({ username, fullName, email, password });

  //   if(!fullName || !password || !email || !username){
  //     throw new ApiError(400,"Please enter all the fields")
  //   }

  if (
    [fullName, email, username, password].some(
      (field) => field?.trim() === ("" || undefined)
    )
  ) {
    throw new ApiError(400, "Please enter all the fields");
  }
  const existedUser = User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
