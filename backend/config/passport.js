import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import db from "./db.js";

export const initPassport = () => {
  // ---------------- GOOGLE ----------------
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const providerId = profile.id;
          const name = profile.displayName || "Google User";

          if (!email) return done(null, false);

          const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

          if (rows.length > 0) {
            await db.query(
              "UPDATE users SET provider=?, provider_id=?, is_verified=1 WHERE email=?",
              ["google", providerId, email]
            );
            const [updated] = await db.query("SELECT * FROM users WHERE email=?", [email]);
            return done(null, updated[0]);
          }

          const [result] = await db.query(
            `INSERT INTO users (name,email,password,role,provider,provider_id,is_verified,verify_token_hash,verify_token_expiry)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [name, email, null, "user", "google", providerId, 1, null, null]
          );

          return done(null, {
            id: result.insertId,
            name,
            email,
            role: "user",
            provider: "google",
            provider_id: providerId,
          });
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  // ---------------- GITHUB ----------------
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ["user:email"],
        userProfileURL: "https://api.github.com/user",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.find((e) => e?.value)?.value?.toLowerCase() || null;
          const providerId = profile.id;
          const name = profile.displayName || profile.username || "GitHub User";

          if (!email) return done(null, false);

          const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

          if (rows.length > 0) {
            await db.query(
              "UPDATE users SET provider=?, provider_id=?, is_verified=1 WHERE email=?",
              ["github", providerId, email]
            );
            const [updated] = await db.query("SELECT * FROM users WHERE email=?", [email]);
            return done(null, updated[0]);
          }

          const [result] = await db.query(
            `INSERT INTO users (name,email,password,role,provider,provider_id,is_verified,verify_token_hash,verify_token_expiry)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [name, email, null, "user", "github", providerId, 1, null, null]
          );

          return done(null, {
            id: result.insertId,
            name,
            email,
            role: "user",
            provider: "github",
            provider_id: providerId,
          });
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  return passport;
};
