import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const sendingEmail = process.env.EMAIL || "";

export async function sendEmailVerification(
  name: string,
  link: string,
  email: string
) {
  const { data, error } = await resend.emails.send({
    from: `SmartSpend <${sendingEmail}>`,
    to: [email],
    subject: "Welcome to SmartSpend!",
    html: getEmailVerifyTemplate(name, link),
    text: "Welcome to SmartSpend! Click the link to verify your email. " + link,
  });

  return { data, error };
}
function getEmailVerifyTemplate(name: string, link: string) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Email</title>
    <style>
      body {
        background-color: #101010;
        color: #ffffff;
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .container {
        background-color: #171717;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        text-align: center;
        width: 90%;
        max-width: 600px;
        color: #ffffff;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
        color: #ffffff;
      }
      .message {
        font-size: 16px;
        margin-bottom: 20px;
        color: #ffffff;
      }
      .button {
        background-color: #31d88a;
        color: #101010;
        padding: 10px 20px;
        font-size: 18px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="title">Hello, ${name}!</h1>
      <p class="message">Please click the button below to verify your email:</p>
      <a href="${link}" class="button">Verify Email</a>
    </div>
  </body>
  </html>`;
}

function getResetPasswordTemplate(name: string, link: string) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
    <style>
      body {
        background-color: #101010;
        color: #ffffff;
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .container {
        background-color: #171717;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        text-align: center;
        width: 90%;
        max-width: 600px;
        color: #ffffff;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 16px;
        color: #ffffff;
      }
      .message {
        font-size: 16px;
        margin-bottom: 20px;
        color: #ffffff;
      }
      .button {
        background-color: #31d88a;
        color: #101010;
        padding: 10px 20px;
        font-size: 18px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="title">Hello, ${name}!</h1>
      <p class="message">Please click the button below to reset your password:</p>
      <a href="${link}" class="button">Reset Password</a>
    </div>
  </body>
  </html>`;
}

export async function sendPasswordReset(
  name: string,
  link: string,
  email: string
) {
  const { data, error } = await resend.emails.send({
    from: `SmartSpend <${sendingEmail}>`,
    to: [email],
    subject: "Welcome to SmartSpend!",
    html: getResetPasswordTemplate(name, link),
    text: "Click the link here to reset your password: " + link,
  });

  return { data, error };
}
