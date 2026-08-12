const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model");

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const isBlacklisted = await tokenBlackListModel.findOne({
    token,
  });

  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);

    req.user = user;

    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const isBlacklisted = await tokenBlackListModel.findOne({
    token,
  });

  if (isBlacklisted) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId).select("+systemUser");

    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    req.user = user;

    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware,
};
