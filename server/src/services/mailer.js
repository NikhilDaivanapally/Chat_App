import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendMail = ({to, subject,text,html, attachments = ""}) => {
  const mailOptions = {
    from: {
      name: "Messenger Team",
      address: "nikhildaivanapally@gmail.com",
    },
    to: to,
    subject: subject,
    text:text,
    html:html,
    attachments: attachments,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(false);
      } else {
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        resolve(true);
      }
    });
  });
};

export { sendMail };
