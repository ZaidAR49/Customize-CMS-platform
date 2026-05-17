const BRAND_GREEN = "#2e7d32";
const BRAND_GREEN_LIGHT = "#43a047";
const BRAND_GREEN_BG = "#e8f5e9";
const BRAND_WHITE = "#ffffff";
const TEXT_DARK = "#1b1b1b";
const TEXT_MUTED = "#555555";
const BORDER_COLOR = "#c8e6c9";


function emailWrapper(content: string): string {
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: ${BRAND_GREEN_BG};
  font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
  direction: rtl;
  -webkit-font-smoothing: antialiased;
">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color: ${BRAND_GREEN_BG}; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
          style="max-width: 600px; width: 100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="
              background: linear-gradient(135deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN_LIGHT} 100%);
              border-radius: 16px 16px 0 0;
              padding: 36px 40px 28px;
              text-align: center;
            ">
              <!-- Logo placeholder circle -->
              <div style="
                display: inline-block;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.5);
                line-height: 64px;
                font-size: 30px;
                margin-bottom: 14px;
              ">🌿</div>
              <h1 style="
                margin: 0;
                color: ${BRAND_WHITE};
                font-size: 22px;
                font-weight: 700;
                letter-spacing: 0.3px;
                line-height: 1.4;
              ">جمعية حماية الأسرة والطفولة</h1>
              <p style="
                margin: 6px 0 0;
                color: rgba(255,255,255,0.82);
                font-size: 13px;
              ">fcpsjo.org</p>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="
              background: ${BRAND_WHITE};
              padding: 40px;
              border-right: 1px solid ${BORDER_COLOR};
              border-left: 1px solid ${BORDER_COLOR};
            ">
              ${content}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="
              background: ${BRAND_GREEN};
              border-radius: 0 0 16px 16px;
              padding: 24px 40px;
              text-align: center;
            ">
              <p style="margin: 0 0 8px; color: rgba(255,255,255,0.85); font-size: 13px;">
                جمعية حماية الأسرة والطفولة — إربد، المملكة الأردنية الهاشمية
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.55);">
                هذا البريد الإلكتروني مُرسَل تلقائيًا، يُرجى عدم الرد عليه مباشرةً.
              </p>
              <p style="margin: 10px 0 0;">
                <a href="mailto:info@fcpsjo.org"
                  style="color: rgba(255,255,255,0.75); font-size: 12px; text-decoration: none;">
                  info@fcpsjo.org
                </a>
                &nbsp;|&nbsp;
                <a href="tel:+96220000000"
                  style="color: rgba(255,255,255,0.75); font-size: 12px; text-decoration: none;">
                  +962 2 000 0000
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function divider(): string {
    return `<hr style="border:none; border-top: 1px solid ${BORDER_COLOR}; margin: 28px 0;" />`;
}

function iconRow(icon: string, label: string, value: string): string {
    return /* html */ `
    <tr>
      <td style="padding: 8px 0; vertical-align: top; width: 36px; font-size: 18px; color: ${BRAND_GREEN};">
        ${icon}
      </td>
      <td style="padding: 8px 0; vertical-align: top;">
        <span style="font-size: 12px; color: ${TEXT_MUTED}; display: block; margin-bottom: 2px;">${label}</span>
        <span style="font-size: 14px; color: ${TEXT_DARK}; font-weight: 600;">${value}</span>
      </td>
    </tr>
  `;
}

// ============================================================
// Function 1 — Contact Us Email
// ============================================================

/**
 * Generates an Arabic-language "Contact Us" notification email.
 *
 * @param userName   - Full name of the sender
 * @param userEmail  - Email address of the sender
 * @param subject    - Subject of the message
 * @param message    - Body of the message
 * @returns          - Complete HTML string ready to be sent as an email body
 */
export function generateContactUsEmail(
    userName: string,
    userEmail: string,
    subject: string,
    message: string
): string {
    const escapedMessage = message
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br />");

    const body = /* html */ `
    <!-- Section title -->
    <h2 style="
      margin: 0 0 6px;
      font-size: 20px;
      color: ${BRAND_GREEN};
      font-weight: 700;
    ">رسالة جديدة عبر نموذج التواصل</h2>
    <p style="margin: 0 0 28px; font-size: 14px; color: ${TEXT_MUTED};">
      تم استلام الرسالة التالية من خلال صفحة "اتصل بنا" على الموقع الإلكتروني.
    </p>

    <!-- Sender info card -->
    <div style="
      background: ${BRAND_GREEN_BG};
      border-right: 4px solid ${BRAND_GREEN_LIGHT};
      border-radius: 10px;
      padding: 20px 24px;
      margin-bottom: 28px;
    ">
      <p style="margin: 0 0 14px; font-size: 13px; font-weight: 700;
                color: ${BRAND_GREEN}; text-transform: uppercase; letter-spacing: 0.5px;">
        معلومات المُرسِل
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${iconRow("👤", "الاسم", userName)}
        ${iconRow("✉️", "البريد الإلكتروني", userEmail)}
        ${iconRow("📌", "الموضوع", subject)}
      </table>
    </div>

    ${divider()}

    <!-- Message body -->
    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: ${TEXT_DARK};">
      نص الرسالة
    </p>
    <div style="
      background: #fafafa;
      border: 1px solid ${BORDER_COLOR};
      border-radius: 10px;
      padding: 20px 24px;
      font-size: 15px;
      line-height: 1.8;
      color: ${TEXT_DARK};
      white-space: pre-wrap;
    ">
      ${escapedMessage}
    </div>

    ${divider()}

    <!-- Reply CTA -->
    <p style="margin: 0 0 20px; font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.7;">
      للرد على هذه الرسالة، يمكنك التواصل مع المُرسِل مباشرةً عبر البريد الإلكتروني الموضح أعلاه.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="border-radius: 8px; background: ${BRAND_GREEN_LIGHT};">
          <a href="mailto:${userEmail}?subject=Re: ${encodeURIComponent(subject)}"
            style="
              display: inline-block;
              padding: 12px 28px;
              color: ${BRAND_WHITE};
              font-size: 14px;
              font-weight: 600;
              text-decoration: none;
              border-radius: 8px;
            ">
            ✉️ &nbsp; الرد على الرسالة
          </a>
        </td>
      </tr>
    </table>
  `;

    return emailWrapper(body);
}

// ============================================================
// Function 2 — One-Time Password (OTP) Email
// ============================================================

/**
 * Generates an Arabic-language OTP (One-Time Password) email.
 *
 * @param otp - The one-time password string to display
 * @returns   - Complete HTML string ready to be sent as an email body
 */
export function generateOtpEmail(otp: string): string {
    // Split OTP into individual characters for the styled digit grid
    const digits = otp.split("").map(
        (ch) => /* html */ `
      <td style="
        display: inline-block;
        min-width: 48px;
        height: 56px;
        line-height: 56px;
        background: ${BRAND_GREEN_BG};
        border: 2px solid ${BRAND_GREEN_LIGHT};
        border-radius: 10px;
        text-align: center;
        font-size: 28px;
        font-weight: 800;
        color: ${BRAND_GREEN};
        margin: 0 4px;
        letter-spacing: 0;
      ">${ch}</td>
    `
    ).join("");

    const body = /* html */ `
    <!-- Icon -->
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="
        display: inline-block;
        width: 72px;
        height: 72px;
        background: ${BRAND_GREEN_BG};
        border-radius: 50%;
        border: 2px solid ${BORDER_COLOR};
        line-height: 72px;
        font-size: 34px;
      ">🔐</div>
    </div>

    <!-- Title -->
    <h2 style="
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 700;
      color: ${BRAND_GREEN};
      text-align: center;
    ">رمز التحقق الخاص بك</h2>
    <p style="
      margin: 0 0 32px;
      font-size: 14px;
      color: ${TEXT_MUTED};
      text-align: center;
      line-height: 1.7;
    ">
      استخدم الرمز أدناه لإتمام عملية التحقق من هويتك.<br />
      الرمز صالح لمدة <strong style="color:${BRAND_GREEN};">10 دقائق</strong> فقط.
    </p>

    <!-- OTP box -->
    <div style="
      background: ${BRAND_GREEN_BG};
      border: 1.5px solid ${BORDER_COLOR};
      border-radius: 14px;
      padding: 28px 24px;
      text-align: center;
      margin-bottom: 28px;
    ">
      <p style="margin: 0 0 16px; font-size: 12px; font-weight: 600;
                color: ${TEXT_MUTED}; letter-spacing: 1px; text-transform: uppercase;">
        رمز التحقق المؤقت (OTP)
      </p>

      <!-- Digit cells -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0"
        style="margin: 0 auto; border-collapse: separate; border-spacing: 6px;">
        <tr>
          ${digits}
        </tr>
      </table>

      <!-- Plain-text fallback -->
      <p style="
        margin: 18px 0 0;
        font-size: 11px;
        color: ${TEXT_MUTED};
        direction: ltr;
        letter-spacing: 4px;
        font-family: monospace;
      ">${otp}</p>
    </div>

    ${divider()}

    <!-- Security notice -->
    <div style="
      background: #fff8e1;
      border-right: 4px solid #f9a825;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 24px;
    ">
      <p style="margin: 0; font-size: 13px; color: #6d4c00; line-height: 1.7;">
        ⚠️ <strong>تنبيه أمني:</strong> لا تشارك هذا الرمز مع أي شخص آخر،
        ولن يطلب منك فريقنا هذا الرمز عبر الهاتف أو البريد الإلكتروني.
        إذا لم تطلب هذا الرمز، يُرجى تجاهل هذه الرسالة.
      </p>
    </div>

    <p style="margin: 0; font-size: 13px; color: ${TEXT_MUTED}; text-align: center; line-height: 1.7;">
      هل تحتاج إلى مساعدة؟ تواصل معنا على
      <a href="mailto:info@fcpsjo.org"
        style="color: ${BRAND_GREEN}; font-weight: 600; text-decoration: none;">
        info@fcpsjo.org
      </a>
    </p>
  `;

    return emailWrapper(body);
}

// ============================================================
// Function 3 — Role Assignment Email
// ============================================================

/** Supported roles — extend this union as needed */
export type UserRole = "admin" | "editor" | "viewer" | string;

/** Per-role display metadata (Arabic label, icon, color, description) */
interface RoleMeta {
    label: string;          // Arabic role name shown in the badge
    icon: string;           // Emoji representing the role
    badgeBg: string;        // Badge background color
    badgeBorder: string;    // Badge border color
    badgeText: string;      // Badge text color
    description: string;    // One-line Arabic description of what the role can do
    permissions: string[];  // Bullet list of permissions shown to the user
}

function getRoleMeta(role: UserRole): RoleMeta {
    switch (role.toLowerCase()) {
        case "admin":
            return {
                label: "مدير النظام",
                icon: "🛡️",
                badgeBg: "#fce4ec",
                badgeBorder: "#e91e63",
                badgeText: "#880e4f",
                description: "تمتلك صلاحيات كاملة على لوحة التحكم وإدارة المستخدمين.",
                permissions: [
                    "إدارة جميع المستخدمين وتعيين الأدوار",
                    "إضافة وتعديل وحذف جميع المحتويات",
                    "الوصول إلى لوحة التحكم الكاملة",
                    "إدارة الإعدادات والبرامج والمشاريع",
                ],
            };
        case "editor":
            return {
                label: "محرِّر",
                icon: "✏️",
                badgeBg: "#e3f2fd",
                badgeBorder: "#1e88e5",
                badgeText: "#0d47a1",
                description: "يمكنك إنشاء المحتوى وتعديله ونشره على الموقع.",
                permissions: [
                    "إضافة وتعديل الأخبار والأنشطة",
                    "رفع الصور والملفات",
                    "إدارة البرامج والمشاريع",
                    "معاينة التغييرات قبل النشر",
                ],
            };
        case "viewer":
        default:
            return {
                label: "مُشاهِد",
                icon: "👁️",
                badgeBg: BRAND_GREEN_BG,
                badgeBorder: BRAND_GREEN_LIGHT,
                badgeText: BRAND_GREEN,
                description: "يمكنك الاطلاع على المحتوى دون إجراء أي تعديلات.",
                permissions: [
                    "عرض جميع الأخبار والأنشطة",
                    "الاطلاع على التقارير والإحصائيات",
                    "تصفح لوحة التحكم في وضع القراءة فقط",
                ],
            };
    }
}

/**
 * Generates an Arabic-language role-assignment notification email.
 * Sent to a user when an admin assigns them a new role on the platform.
 *
 * @param userName  - Full name of the user receiving the role
 * @param userEmail - Email address of the user
 * @param userRole  - Role being assigned: "admin" | "editor" | "viewer" | any string
 * @returns         - Complete HTML string ready to be sent as an email body
 */
export function generateRoleAssignmentEmail(
    userName: string,
    userEmail: string,
    userRole: UserRole
): string {
    const role = getRoleMeta(userRole);

    const permissionRows = role.permissions
        .map(
            (perm) => /* html */ `
        <tr>
          <td style="padding: 7px 0; vertical-align: top; width: 24px;">
            <span style="
              display: inline-block;
              width: 20px;
              height: 20px;
              background: ${BRAND_GREEN_LIGHT};
              border-radius: 50%;
              text-align: center;
              line-height: 20px;
              font-size: 11px;
              color: ${BRAND_WHITE};
            ">✓</span>
          </td>
          <td style="padding: 7px 0 7px 10px; font-size: 14px; color: ${TEXT_DARK}; line-height: 1.5;">
            ${perm}
          </td>
        </tr>
      `
        )
        .join("");

    const body = /* html */ `
    <!-- Greeting -->
    <p style="margin: 0 0 6px; font-size: 15px; color: ${TEXT_MUTED};">مرحباً،</p>
    <h2 style="
      margin: 0 0 24px;
      font-size: 21px;
      font-weight: 700;
      color: ${TEXT_DARK};
      line-height: 1.4;
    ">
      تم تعيين دور جديد لحسابك على منصة
      <span style="color: ${BRAND_GREEN};">جمعية حماية الأسرة والطفولة</span>
    </h2>

    <!-- Role badge card -->
    <div style="
      border: 1.5px solid ${role.badgeBorder};
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 28px;
    ">
      <!-- Card header -->
      <div style="
        background: ${role.badgeBg};
        padding: 22px 24px;
        border-bottom: 1.5px solid ${role.badgeBorder};
      ">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <!-- Icon circle -->
            <td style="width: 56px; vertical-align: middle;">
              <div style="
                width: 52px;
                height: 52px;
                border-radius: 50%;
                background: ${BRAND_WHITE};
                border: 2px solid ${role.badgeBorder};
                text-align: center;
                line-height: 52px;
                font-size: 24px;
              ">${role.icon}</div>
            </td>
            <!-- Role name -->
            <td style="padding-right: 16px; vertical-align: middle;">
              <p style="margin: 0 0 3px; font-size: 11px; color: ${role.badgeText};
                         font-weight: 600; letter-spacing: 0.5px;">
                الدور المُعيَّن
              </p>
              <p style="margin: 0; font-size: 20px; font-weight: 800; color: ${role.badgeText};">
                ${role.label}
              </p>
            </td>
            <!-- User name pill -->
            <td style="vertical-align: middle; text-align: left;">
              <span style="
                display: inline-block;
                background: ${BRAND_WHITE};
                border: 1.5px solid ${role.badgeBorder};
                border-radius: 20px;
                padding: 4px 14px;
                font-size: 13px;
                font-weight: 600;
                color: ${role.badgeText};
                white-space: nowrap;
              ">👤 ${userName}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Description -->
      <div style="padding: 18px 24px; background: ${BRAND_WHITE};">
        <p style="margin: 0; font-size: 14px; color: ${TEXT_MUTED}; line-height: 1.7;">
          ${role.description}
        </p>
      </div>
    </div>

    ${divider()}

    <!-- Permissions list -->
    <p style="margin: 0 0 16px; font-size: 14px; font-weight: 700; color: ${TEXT_DARK};">
      الصلاحيات الممنوحة لهذا الدور
    </p>
    <div style="
      background: ${BRAND_GREEN_BG};
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 28px;
    ">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${permissionRows}
      </table>
    </div>

    ${divider()}

    <!-- Info note -->
    <div style="
      background: #e8f4fd;
      border-right: 4px solid #1e88e5;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 28px;
    ">
      <p style="margin: 0; font-size: 13px; color: #0d47a1; line-height: 1.7;">
        ℹ️ إذا كنت تعتقد أن هذا التعيين تم بالخطأ أو لديك أي استفسار،
        يُرجى التواصل مع مدير النظام أو مراسلتنا على
        <a href="mailto:info@fcpsjo.org"
          style="color: #0d47a1; font-weight: 700; text-decoration: underline;">
          info@fcpsjo.org
        </a>.
      </p>
    </div>

    <!-- CTA button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="border-radius: 8px; background: ${BRAND_GREEN_LIGHT};">
          <a href="https://fcpsjo.org/dashboard"
            style="
              display: inline-block;
              padding: 13px 32px;
              color: ${BRAND_WHITE};
              font-size: 14px;
              font-weight: 700;
              text-decoration: none;
              border-radius: 8px;
            ">
            🚀 &nbsp; الدخول إلى لوحة التحكم
          </a>
        </td>
      </tr>
    </table>
  `;

    return emailWrapper(body);
}