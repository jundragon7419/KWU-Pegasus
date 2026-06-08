const nodemailer = require('nodemailer')

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })
}

// { email: { code, expiresAt } }
const codeStore = new Map()

const CODE_TTL = 5 * 60 * 1000  // 5분

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendVerificationCode(email) {
  const code = generateCode()
  codeStore.set(email, { code, expiresAt: Date.now() + CODE_TTL })

  await getTransporter().sendMail({
    from: `"KWU Pegasus" <${process.env.MAIL_USER}>`,
    to: email,
    subject: '[KWU Pegasus] 이메일 인증번호',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#011126;color:#fff;border-radius:12px;">
        <h2 style="color:#D9C5A0;margin-bottom:8px;">이메일 인증</h2>
        <p style="color:rgba(255,255,255,0.7);margin-bottom:24px;">아래 인증번호를 입력해주세요. 유효시간은 5분입니다.</p>
        <div style="font-size:2rem;font-weight:800;letter-spacing:8px;color:#D9C5A0;text-align:center;padding:20px;background:rgba(255,255,255,0.06);border-radius:8px;">
          ${code}
        </div>
        <p style="color:rgba(255,255,255,0.35);font-size:0.8rem;margin-top:20px;">본인이 요청하지 않은 경우 이 메일을 무시하세요.</p>
      </div>
    `,
  })
}

function verifyCode(email, code) {
  const entry = codeStore.get(email)
  if (!entry) return { ok: false, message: '인증번호를 먼저 발송해주세요.' }
  if (Date.now() > entry.expiresAt) {
    codeStore.delete(email)
    return { ok: false, message: '인증번호가 만료되었습니다. 재발송해주세요.' }
  }
  if (entry.code !== code) return { ok: false, message: '인증번호가 올바르지 않습니다.' }
  codeStore.delete(email)
  return { ok: true }
}

module.exports = { sendVerificationCode, verifyCode }
