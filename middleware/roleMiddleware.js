module.exports = (requiredRole) => {
  return (req, res, next) => {

    if (!req.user || !req.user.role) {
      return res.status(403).json({ msg: "Access denied (no user role)" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ msg: "Access denied (role mismatch)" });
    }

    next();
  };
};
