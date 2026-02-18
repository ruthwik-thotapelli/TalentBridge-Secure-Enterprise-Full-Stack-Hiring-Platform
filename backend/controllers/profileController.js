export const me = async (req, res) => {
  res.json({ message: "Profile fetched ✅", user: req.user });
};

export const admin = async (req, res) => {
  res.json({ message: "Admin route ✅", user: req.user });
};
