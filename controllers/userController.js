import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import roles from '../roles.js';

const hashFunction = async (password) => {
  return await bcrypt.hash(password, 10);
}

const validatePassword = async (plainPassword, hashPassword) => {
  return await bcrypt.compare(plainPassword, hashPassword);
}

const signup = async (req, res, next) => {
  try {
    const { email, password, role } = req.body
    const hashedPassword = await hashFunction(password);
    const newUser = new User({ email, password: hashedPassword, role: role || "basic" });
    const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    })

    newUser.accessToken = accessToken;
    await newUser.save();

    res.status(201).json({
      data: newUser,
      accessToken
    });

  } catch (error) {
    next(error);
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return next(new Error('Email does not exist'));

    const validatePassword = await validatePassword(password, user.password);

    if (!validPassword) return next(new Error('Password is not correct'));

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    await User.findByIdAndUpdate(user._id, { accessToken });
    res.status(200).json({
      data: { email: user.email, role: user.role },
      accessToken,
    })

  } catch (error) {
    next(error);
  }
}

const getUsers = async (req, res, next) => {
  const users = await User.find({});
  console.log(users)
  res.status(200).json({
    data: users
  });
}

const getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return next(new Error('User does not exist'));
    }

    res.status(200).json({
      data: user
    })
  }
  catch (error) {
    next(error);
  }
}

const updateUser = async (req, res, next) => {
  try {
    const update = req.body;
    const userId = req.params.userId;
    await User.findByIdAndUpdate(userId, update);

    const user = await User.findById(userId);
    res.status(200).json({
      data: user,
      message: 'User has been updated'
    })
  }
  catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      data: null,
      message: 'User has been deleted'
    })
  } catch (error) {
    next(error)
  }
}

const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      const permissions = roles.can(req.user.role)[action](resource);
      if (!permissions.granted) {
        return res.status(401).json({
          error: "You don't have enough permission to perform this action"
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}

const allowIfLoggedin = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser;

    if (!user)
      return res.status(401).json({
        error: "'You need to be logged in to access this route"
      });

    req.user = user;
    next();
  }
  catch (error) {
    next(error)
  }
}


export { signup, login, getUser, getUsers, updateUser, deleteUser, grantAccess, allowIfLoggedin };