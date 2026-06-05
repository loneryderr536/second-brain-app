const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const pacmanStyle = `
  background:#000;color:#FFD700;font-family:monospace;padding:20px;border-radius:8px;
  border:2px solid #2121DE;box-shadow:0 0 20px #2121DE;
`;

async function sendBirthdayReminder(name, daysUntil) {
  const subject = daysUntil === 0
    ? `🎂 Today is ${name}'s Birthday!`
    : `🎂 ${name}'s Birthday is Tomorrow!`;

  const html = `
    <div style="${pacmanStyle}">
      <h1 style="color:#FFD700;">● ● ● SECOND BRAIN ● ● ●</h1>
      <h2 style="color:#FFB8FF;">${subject}</h2>
      <p style="color:#fff;font-size:16px;">
        ${daysUntil === 0
          ? `Today is <strong style="color:#FFD700;">${name}</strong>'s birthday! Don't forget to wish them! 🎉`
          : `<strong style="color:#FFD700;">${name}</strong>'s birthday is tomorrow. Get ready to celebrate! 🎂`}
      </p>
      <p style="color:#00FFFF;">Complete the wish in your Second Brain to earn <strong>+200 pts</strong>!</p>
      <div style="margin-top:20px;color:#FFD700;">● ● ● ● ● ● ● ● ● ● ● ●</div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Second Brain 🧠" <${process.env.EMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject,
    html,
  });
}

async function sendEventReminder(event, daysUntil) {
  const subject = daysUntil === 0
    ? `📅 Today: ${event.title}`
    : `📅 Tomorrow: ${event.title}`;

  const html = `
    <div style="${pacmanStyle}">
      <h1 style="color:#FFD700;">● ● ● SECOND BRAIN ● ● ●</h1>
      <h2 style="color:#00FFFF;">${subject}</h2>
      <p style="color:#fff;font-size:16px;">
        <strong style="color:#FFD700;">${event.title}</strong> is
        ${daysUntil === 0 ? 'happening <strong>today</strong>' : 'happening <strong>tomorrow</strong>'}.
      </p>
      ${event.time ? `<p style="color:#fff;">🕐 Time: <strong style="color:#FFD700;">${event.time}</strong></p>` : ''}
      ${event.notes ? `<p style="color:#fff;">📝 Notes: ${event.notes}</p>` : ''}
      <div style="margin-top:20px;color:#FFD700;">● ● ● ● ● ● ● ● ● ● ● ●</div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Second Brain 🧠" <${process.env.EMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject,
    html,
  });
}

module.exports = { sendBirthdayReminder, sendEventReminder };
