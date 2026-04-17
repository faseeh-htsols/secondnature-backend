import { Request, Response } from "express";
import prisma from "../utils/prisma-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      messages: [
        { type: "error", message: "Please provide email and password." },
      ],
      data: null,
    });
  }

  try {
    let user = await prisma.users.findFirst({
      where: {
        OR: [{ email: email }, { username: email }],
      },
    });

    if (!user) {
      res.status(404).json({
        messages: [{ type: "error", message: "User not found." }],
        data: null,
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        messages: [{ type: "error", message: "Invalid email or password." }],
        data: null,
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      messages: [{ type: "success", message: "Logged in successfully." }],
      data: {
        user: {
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      messages: [{ type: "error", message: `Something went wrong.` }],
      data: null,
    });
  }
};

export const requestResetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    res
      .status(404)
      .json({ messages: [{ type: "error", message: "User not found" }] });
    return;
  }

  // Generate Reset Token (Valid for 15 min)
  const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: "15m",
  });

  // Store Token in DB
  await prisma.users.update({
    where: { email },
    data: {
      reset_token: resetToken,
      reset_token_expiry: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  // Send Email with Reset Link
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587"),
    secure: false, // false for port 587 (TLS), true for 465 (SSL)
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  const resetLink = `https://blogs.nuyu-dental.co.uk/reset-password/${resetToken}`;
  await transporter.sendMail(
    {
      from: `"Nuyu Blog CMS" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: email,
      subject: "Password Reset",
      text: `
      Dear ${user.name}, 

      Please click the link to reset your password: ${resetLink}

      Note: This token is valid for only 15 minutes.
    `,
      html: `
      <p>
        <b>Dear ${user.name},</b>
      </p>
      <p>
        Please click <a href="${resetLink}">here</a> to reset your password.
      </p>
      <br/>
      <p>
        <b>Note:</b> This token is valid for only 15 minutes.
      </p>
      `,
    },
    (error, info) => {
      if (error) console.error("Error sending email:", error);
      else console.log("Email sent:", info.response);
    }
  );

  res
    .status(200)
    .json({ messages: [{ type: "success", message: "Reset email sent!" }] });
};

export const validateResetPasswordToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (
      !user ||
      user.reset_token !== token ||
      user.reset_token_expiry == null ||
      user.reset_token_expiry < new Date()
    ) {
      res.status(400).json({
        messages: [{ type: "error", message: `Invalid or expired token.` }],
        data: null,
      });
      return;
    }

    res
      .status(200)
      .json({ messages: [{ type: "success", message: "Valid Token" }] });
  } catch (error) {
    res.status(500).json({
      messages: [{ type: "error", message: `Something went wrong.` }],
      data: null,
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword, confirmNewPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (
      !user ||
      user.reset_token !== token ||
      user.reset_token_expiry == null ||
      user.reset_token_expiry < new Date()
    ) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({
        messages: [{ type: "error", message: "New passwords do not match" }],
      });
      return;
    }

    if (newPassword && !passwordRegex.test(newPassword)) {
      res.status(400).json({
        messages: [
          {
            type: "error",
            message:
              "Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, and 1 digit.",
          },
        ],
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
    });

    res.status(200).json({
      messages: [{ type: "success", message: "Password successfully reset!" }],
    });
  } catch (error) {
    res
      .status(400)
      .json({ messages: [{ type: "error", message: "Invalid token" }] });
  }
};
