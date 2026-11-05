// Role gate used after "protect" — e.g. router.patch("/:id/status", protect,
// allow("staff", "admin"), handler). 403s anyone without one of the roles.
const allow = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "You don't have permission to do that." });
  }
  next();
};

export default allow;
