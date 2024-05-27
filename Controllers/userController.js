const User = require("../Models/userModel");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//Register User
exports.registerUser = async (req, res, next) => {
  try {
    //Check if the Username and EmailAddress is Existing
    const findEmail = await User.find({ EmailAddress: req.body.EmailAddress });
    const findUsername = await User.find({ Username: req.body.Username });

    //Setup Validation
    const validationSchema = Joi.object({
      Username: Joi.string().min(5).required(),
      Firstname: Joi.string().min(3).required(),
      Lastname: Joi.string().required(),
      EmailAddress: Joi.string().min(8).required().email(),
      Password: Joi.string()
        .min(6)
        .required()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    });

    //Checking the validation if it has an error
    const { error } = validationSchema.validate(req.body);
    //If it has an error. send the error message
    if (error)
      return req.status(400).json({
        status: "error",
        message: error,
      });

    //Encrypting Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.Password, salt);

    //Validate the email and username if existing in the database
    if (findEmail.length >= 1 && findUsername.length >= 1) {
      return res
        .status(403)
        .send({ message: "Email and Username is already existing" });
    } else if (findEmail.length >= 1) {
      return res.status(403).send({ message: "Email is already existed" });
    } else if (findUsername.length >= 1) {
      return res.status(403).send({ message: "UserName is already existed" });
    } else {
      //Save New User
      const newUser = new User({
        Username: req.body.Username,
        Firstname: req.body.Firstname,
        Lastname: req.body.Lastname,
        EmailAddress: req.body.EmailAddress,
        Password: hashedPassword,
      });
      const saveUser = await newUser.save();
      //res.send({ newUser: newUser._id });
      return res.status(200).json({
        status: "success",
        message: "Registered Successfully!",
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
//Login User
exports.userLogin = async (req, res, next) => {
  try {
    //Setup Validation for Login
    const validationLogin = Joi.object({
      EmailAddress: Joi.string().min(6).required(),
      Password: Joi.string().min(6).required(),
    });

    //Request validations
    const { error } = validationLogin.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }

    //Check if username exists
    const user = await User.findOne({ EmailAddress: req.body.EmailAddress });
    if (!user) {
      return res.status(409).json({
        status: "error",
        message: "Username or Password is wrong",
      });
    }

    //Check the password is right for the username
    const validPass = await bcrypt.compare(req.body.Password, user.Password);
    if (!validPass) {
      return res.status(403).json({
        status: "error",
        message: "Invalid Email Address or Password",
      });
    }

    //If the Email Address and Password are right then make a payload for the token

    const payload = {
      //Pass the user id in the payload for future requests
      _id: user._id,
    };

    //Make a token with expiration and put the payload
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    //Set the token in the header then send a success message
    res.status(200).header("auth-token", token).json({
      token: token,
      _id: user._id,
      logged_in: "Yes",
      message: "User Verified",
      status: "success",
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

//Getting User Info
exports.userInfo = async (req, res, next) => {
  try {
    //Get the token in the headers
    const token = await req.header("auth-token");

    //Decode the token to get the Id
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //console.log(decodeToken._id)

    //Get Info of the user using the decoded id
    const getInfoUser = await User.findById(decodeToken._id);
    return res.status(200).json({
      status: "success",
      data: getInfoUser,
      message: "User Info Retrieved Successfully!",
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

//Update user using token
exports.userUpdate = async (req, res, next) => {
  try {
    // Get the token from the headers
    const token = req.header("auth-token");

    // Decode the token to get the Id
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user by id
    const findUser = await User.findById(decodedToken._id);
    if (!findUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Set the validation schema
    const validationSchema = Joi.object({
      Username: Joi.string().min(5).required(),
      Firstname: Joi.string().min(3).required(),
      Lastname: Joi.string().required(),
    });

    // Handle the error
    const { error } = validationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: "error", message: error.message });
    }

    // Check if the username already exists
    const findUsername = await User.findOne({ Username: req.body.Username });

    // If username exists and belongs to a different user
    if (findUsername && !findUsername._id.equals(findUser._id)) {
      return res.status(403).json({
        status: "error",
        message: "This Username is already taken",
      });
    }

    // Update the user
    const updateUser = await User.updateOne(
      { _id: findUser._id },
      {
        Username: req.body.Username,
        Firstname: req.body.Firstname,
        Lastname: req.body.Lastname,
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Updated Successfully!",
      data: updateUser,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

//Delete User by Id
exports.userDelete = async (req, res, next) => {
  try {
    const id = req.body.userId;
    User.findByIdAndDelete(id).then((data) => {
      if (!data) {
        res.status(404).json({
          status: "error",
          message: `Cannot delete with this id: ${id}. Maybe ID not Exist`,
        });
      } else {
        res.status(200).json({
          status: "success",
          message: "User was Deleted Successfully!",
        });
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
