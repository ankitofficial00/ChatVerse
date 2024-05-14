import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  // algorithm  for register a new user
  // get the all details from the frontend
  // validate all
  //  check the user is already registered or not
  // if it then return to login
  // otherwise
  // create a object in the database to store the data in the database
  // then display the information about the  new user

  // destructuring of data to get the data from the frontend
  const { userName, password, bio, name } = req.body;

  // validation the input data
  console.log(req.body);

  if (!userName || !password || !bio || !name) {
    throw new ApiError(404, "all input data is required");
  }

  if ([userName, bio, password, name].some((field) => field?.trim === "")) {
    throw new ApiError(400, "all fields are must be required");
  }

  // check avatar is uploaded or not

  // check the user its existing or new

  const existingUser = await User.findOne({ userName });

  if (existingUser) {
    throw new ApiError(404, "this user is already exist");
  }

  // create an object and save into the database

  const newUser = await User.create({
    name,
    userName,
    bio,
    password,
  });
  if (!newUser) {
    throw new ApiError(
      401,
      "something went wrong while registering the new user"
    );
  }
  // send back the response with status code
  console.log(newUser);
  return res
    .status(200)
    .json(new ApiResponse(202, newUser, "register a new user successfully"));
});

// login controller

const loggedInUser = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;

  console.log(req.body);

  // validation
  if (!userName || !password) {
    throw new ApiError(402, "all input fields are required");
  }

  // check the user existing or not
  const user = await User.findOne({ userName });

  if (!user) {
    throw new ApiError(404, "existing user not found so register the user");
  }

  // check the password correct or not

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log(isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "password is not correct");
  }

  // generate the token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  if (!token) {
    throw new ApiError(403, "token does not found");
  }

  const options = {
    // maxAge: 2 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
  };
  // store the token in cookies
  return res
    .status(200)
    .cookie("accessToken", token, options)
    .json(
      new ApiResponse(
        202,
        {
          user: user,
          token: token,
        },
        "logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  console.log(user);
  if (!user) {
    throw new ApiError(402, "logged in user does not found");
  }

  // clear the cookie data
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(202, {}, "logout successfully"));
});
export { registerUser, loggedInUser, logoutUser };
