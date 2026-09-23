import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_PASS,
  },
});

export default transporter;
