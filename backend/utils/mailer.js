// import nodemailer from "nodemailer";

// export const sendResetEmail = async (toEmail, name, resetLink) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,                // smtp.gmail.com
//       port: Number(process.env.SMTP_PORT) || 587, // 587 for TLS
//       secure: false,                              // true only for 465
//       auth: {
//         user: process.env.SMTP_USER,              // your Gmail
//         pass: process.env.SMTP_PASS,              // 16-char App Password (no spaces)
//       },
//       tls: {
//         rejectUnauthorized: false,                // helps avoid TLS issues
//       },
//     });

//     const subject = "TalentBridge - Reset your password";

//     const text = `Hi ${name || "User"},

// We received a request to reset your password.
// Reset link (valid for limited time):
// ${resetLink}

// If you didn’t request this, you can ignore this email.

// — TalentBridge Team
// `;

//     const html = `
//       <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
//         <h2>Password Reset</h2>
//         <p>Hi ${name || "User"},</p>
//         <p>Click the button below to reset your password (valid for limited time):</p>
//         <p>
//           <a href="${resetLink}"
//              style="display:inline-block;padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:8px">
//             Reset Password
//           </a>
//         </p>
//         <p>If you didn’t request this, ignore this email.</p>
//         <p>— TalentBridge Team</p>
//       </div>
//     `;

//     await transporter.sendMail({
//       from: `"TalentBridge" <${process.env.SMTP_USER}>`,
//       to: toEmail,
//       subject,
//       text,
//       html,
//     });

//     console.log("✅ Reset email sent to:", toEmail);
//   } catch (error) {
//     console.error("❌ Error sending reset email:", error);
//     throw error;
//   }
// };
