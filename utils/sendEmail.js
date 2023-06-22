require("dotenv").config();
const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, url, user) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: 587,
      tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2",
      },
      secure: false,
      auth: {
        user: "m.fajars.net",
        pass: process.env.PASS,
      },
      debug: false,
      logger: true,
    });

    await transporter.sendMail({
      from: `Forum Ilmiah Matematika Nasional <${process.env.USER}>`,
      to: email,
      subject: subject,
      html: `<div style="height: 20rem; text-align: center;">
        <img src="https://drive.google.com/uc?export=view&id=1ic7bG6dkAV9C-ZWBdQj6bZ3vAzNumvYi"
            alt="fim logo" style="min-width: 4rem; width: 24vw; max-width: 20vh;" />
        <h3 style="margin: 3rem 0 1rem 0; font-weight: bolder; color: #28a0f6;">Hi, ${user}</h3>
        <h4 style="margin-bottom: 2rem; color: #4b5563;">Link akan kadaluarsa setelah 15 menit.<br/>Segera klik tombol di bawah ini untuk mereset passwordmu.</h4>
        <a href="${url}"
            style="padding: .75rem 2rem; background-color: #28a0f6; color: #ffff; border-radius: .5rem; text-decoration: none; font-weight: bolder;">Reset
            Password</a>
    </div>`,
    });

    console.log("Email telah terkirim");
  } catch (error) {
    console.log("Email gagal terkirim");
    console.log(error);
  }
};

module.exports = sendEmail;
