import { NextResponse } from "next/server";
import { Resend } from "resend";

const recipientEmail = "omarapdelmorid@gmail.com";
const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );
}

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json();
    const fields = [name, email, phone, subject, message];

    if (
      fields.some((field) => typeof field !== "string" || !field.trim()) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please complete all fields with a valid email address." },
        { status: 400 },
      );
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safePhone = escapeHtml(phone.trim());
    const safeSubject = escapeHtml(subject.trim());
    const safeMessage = escapeHtml(message.trim()).replace(/\n/g, "<br>");

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: recipientEmail,
      replyTo: email.trim(),
      subject: `Contact form: ${subject.trim()}`,
      html: `
        <div style="font-family: Inter, system-ui, Arial, sans-serif; background:#f4f7fb; padding:40px 20px; color:#1e293b;">
          <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #e2e8f0;">
            <div style="background:#17212b; padding:32px 24px; text-align:center;">
              <div style="width:70px; height:70px; line-height:70px; border-radius:50%; background:#263746; margin:0 auto; font-size:30px;">&#9993;</div>
              <h1 style="margin:18px 0 8px; color:#ffffff; font-size:28px; line-height:1.2; font-weight:700;">New Contact Message</h1>
              <p style="margin:0; color:#b8c4ce; font-size:15px; line-height:1.5;">You received a new inquiry from The Wild Oasis website.</p>
            </div>
            <div style="padding:32px 24px;">
              <div style="margin-bottom:28px;">
                <div style="font-size:18px; line-height:1.4; font-weight:700; color:#0f172a;">${safeName}</div>
                <div style="font-size:13px; line-height:1.5; color:#64748b; margin-top:4px;">New website inquiry</div>
              </div>
              <table role="presentation" width="100%" style="border-collapse:separate; border-spacing:0 10px; margin-bottom:22px;">
                <tr>
                  <td style="padding:14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px 0 0 12px; width:110px; color:#64748b; font-size:14px; font-weight:600;">Email</td>
                  <td style="padding:14px; background:#ffffff; border:1px solid #e2e8f0; border-left:0; border-radius:0 12px 12px 0; font-size:14px; line-height:1.4; color:#0f172a; word-break:break-word;">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="padding:14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px 0 0 12px; width:110px; color:#64748b; font-size:14px; font-weight:600;">Phone</td>
                  <td style="padding:14px; background:#ffffff; border:1px solid #e2e8f0; border-left:0; border-radius:0 12px 12px 0; font-size:14px; line-height:1.4; color:#0f172a; word-break:break-word;">${safePhone}</td>
                </tr>
                <tr>
                  <td style="padding:14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px 0 0 12px; width:110px; color:#64748b; font-size:14px; font-weight:600;">Subject</td>
                  <td style="padding:14px; background:#ffffff; border:1px solid #e2e8f0; border-left:0; border-radius:0 12px 12px 0; font-size:14px; line-height:1.4; color:#0f172a; word-break:break-word;">${safeSubject}</td>
                </tr>
              </table>
              <div style="font-size:15px; line-height:1.5; font-weight:700; margin-bottom:12px; color:#0f172a;">Message</div>
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px; font-size:15px; line-height:1.8; color:#334155; word-break:break-word;">${safeMessage}</div>
            </div>
            <div style="border-top:1px solid #e2e8f0; padding:20px 24px; background:#f8fafc; text-align:center;">
              <p style="margin:0; font-size:13px; line-height:1.5; color:#94a3b8;">This email was generated automatically from your contact form.</p>
            </div>
          </div>
        </div>`,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form email failed:", error);
    return NextResponse.json(
      { error: "Your message could not be sent. Please try again later." },
      { status: 500 },
    );
  }
}
