// 1. Declare consts needed to authenticate and authorize users
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");
const User = require("../model/user.model");

// 2. Create a middleware for jwt validation (it should passed two arguments: 1. secret string and algorithm)
const validateJwt = expressJwt({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
});

// 3. Create a function to sign twt
const signToken = (_id) => jwt.sign({ _id }, process.env.SECRET);

// 4. Create a function to find and assign to user
const findAndAssignUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id);
    if (!user) {
      return res.status(401).end();
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// 5. Create middleware that will use validateJwt and findaAndAssignUser
const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser);

// 6. Endpoints below (login and register)
const Auth = {
  login: async (req, res) => {
    const { body } = req;
    // If a user is trying to login it's mandatory to check if its exists then compare password
    // and finally firm the sign with the Jwt
    try {
      const user = await User.findOne({ email: body.email });
      if (!user) {
        res.status(401).send("user or password incorrect");
      } else {
        const isMatch = await bcrypt.compare(body.password, user.password);
        if (isMatch) {
          const signed = signToken(user._id);
          res.status(200).send(signed);
        } else {
          res.status(401).send("user or password incorrect");
        }
      }
    } catch (error) {
      res.send(error.message);
    }
  },
  register: async (req, res) => {
    const { body } = req;
    try {
      const isUser = await User.findOne({ email: body.email });
      if (isUser) {
        res.send("User already exists");
      } else {
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(body.password, salt);
        const user = await User.create({
          email: body.email,
          password: hashed,
          salt,
        });
        const signed = signToken(user._id);
        res.send(signed);
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
};
module.exports = { Auth: Auth, isAuthenticated: isAuthenticated };
