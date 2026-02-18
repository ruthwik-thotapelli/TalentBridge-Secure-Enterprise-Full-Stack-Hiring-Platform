import db from "../config/db.js";
import { signToken } from "../utils/tokenUtil.js";

export const oauthSuccess = async (req, res) => {
  try {
    const passportUser = req.user;

    if (!passportUser || !passportUser.email) {
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }

    // fetch user safely from DB
    const [rows] = await db.query(
      "SELECT id, name, email, role, provider FROM users WHERE email=?",
      [passportUser.email]
    );

    if (rows.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }

    const user = rows[0];
    const token = signToken({ id: user.id });

    // redirect to frontend with token
    return res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  } catch (err) {
    console.error("OAuth Success Error:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
};
