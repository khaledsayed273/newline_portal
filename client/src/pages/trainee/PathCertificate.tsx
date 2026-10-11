import { useState } from "react";
import { Award, Printer, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const LOGO_URL = "/assets/logo.png";

function useQueryParams() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const uid = params.get("uid") ?? "";
  const savedName = localStorage.getItem("newline_trainee_name");
  const displayName = savedName || (uid.startsWith("user_") ? "" : uid);
  return {
    uid,
    displayName,
    dept: params.get("dept") ?? "",
    path: params.get("path") ?? "",
    score: params.get("score") ?? "",
    certCode: params.get("certCode") ?? "",
  };
}

function generateCertCode(uid: string, pathId: string): string {
  const hash = (uid + pathId)
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return "NL-" + String(hash + 532051).padStart(9, "0");
}

function formatDateRange(): {
  from: string;
  to: string;
  issued: string;
  issuedAr: string;
} {
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 5);
  const fmtEn = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const fmtAr = (d: Date) =>
    d.toLocaleDateString("ar-SA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  return {
    from: fmtEn(from),
    to: fmtEn(now),
    issued: fmtEn(now),
    issuedAr: fmtAr(now),
  };
}

function NameInputForm({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && name.trim() && onSave(name)}
        placeholder="أدخل اسمك الكامل"
        className="card w-full px-4 py-3 text-start text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
        autoFocus
        dir="rtl"
      />
      <button
        onClick={() => name.trim() && onSave(name)}
        disabled={!name.trim()}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold py-3 rounded-xl transition-all active:scale-95"
      >
        تأكيد الاسم
      </button>
    </div>
  );
}

export default function PathCertificate() {
  const [, navigate] = useLocation();
  const {
    uid,
    displayName,
    dept,
    path,
    score,
    certCode: certCodeParam,
  } = useQueryParams();
  const [traineeName, setTraineeName] = useState(displayName);
  const [showNameInput, setShowNameInput] = useState(!displayName);
  const pathId = window.location.pathname.split("/").pop() ?? "0";
  const certNumber = certCodeParam || generateCertCode(uid, pathId);
  const dates = formatDateRange();

  const handlePrint = () => window.print();

  const handleSaveName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed) {
      setTraineeName(trimmed);
      localStorage.setItem("newline_trainee_name", trimmed);
      setShowNameInput(false);
    }
  };

  const programName = path || "المسار التدريبي الشامل";
  const programDesc = dept
    ? `صُمِّم هذا البرنامج لتعزيز كفاءات المشاركين في ${dept} وتطوير مهاراتهم المهنية وتطبيق أفضل الممارسات في مجال العمل.`
    : "صُمِّم هذا البرنامج لتعزيز كفاءات المشاركين وتطوير مهاراتهم المهنية وتطبيق أفضل الممارسات في مجال العمل.";

  return (
    <div className="min-h-screen bg-muted print:bg-white">
      {/* نافذة إدخال الاسم */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold md:text-xl text-foreground mb-1">
                أدخل اسمك في الشهادة
              </h2>
              <p className="text-muted-foreground text-sm">
                سيظهر اسمك في شهادة الإتمام
              </p>
            </div>
            <NameInputForm onSave={handleSaveName} />
          </div>
        </div>
      )}

      {/* شريط التحكم */}
      <div className="print:hidden bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-none">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="font-medium text-sm">العودة للدورات</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNameInput(true)}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            تغيير الاسم
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            طباعة الشهادة
          </button>
        </div>
      </div>

      {/* الشهادة */}
      <div className="flex items-center justify-center p-8 print:p-0 print:block">
        <div
          id="certificate"
          className="bg-white w-full max-w-5xl shadow-2xl print:shadow-none print:max-w-none overflow-hidden relative"
          style={{
            fontFamily: "'Cairo', 'Segoe UI', sans-serif",
            minHeight: "640px",
            border: "3px solid #C9A227",
          }}
        >
          {/* إطار ذهبي داخلي */}
          <div
            className="absolute inset-2 pointer-events-none"
            style={{ border: "1px solid #C9A227", opacity: 0.4 }}
          />

          {/*الجزء العلوي الأبيض*/}
          <div className="relative px-16 pt-10 pb-4 text-center">
            {/* الشعار */}
            <div className="flex justify-center mb-4">
              <div className="rounded-xl bg-gradient-to-b from-white to-slate-100 px-4 py-2 shadow-sm ring-1 ring-black/5">
                <img
                  src={LOGO_URL}
                  alt="شعار نيولاين"
                  className="h-24 object-contain"
                  onError={e => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* عنوان مزدوج عربي وإنجليزي */}
            <h1
              className="text-3xl font-extrabold tracking-widest mb-1"
              style={{ color: "#1E3A6E" }}
            >
              شهادة إتمام مسار تدريبي
            </h1>
            <p
              className="text-base font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#C9A227" }}
            >
              CERTIFICATE OF ACHIEVEMENT
            </p>

            {/*نص تقديمي*/}
            <p className="text-gray-600 text-base mb-1">
              تُقدِّم شركة نيولاين للخدمات اللوجستية هذه الشهادة إلى
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Newline Logistics Company proudly presents this certificate to
            </p>

            {/* اسم المتدرب */}
            <div
              className="text-5xl font-bold mb-4"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#1a1a2e",
              }}
            >
              {traineeName || "المتدرب"}
            </div>

            {/* اسم البرنامج */}
            <p className="text-gray-600 text-sm mb-1">
              لإتمامه بنجاح المسار المعتمد الخاص به:
            </p>
            <p className="text-gray-500 text-xs mb-2">
              for successfully completing the training path entitled:
            </p>
            <p className="font-bold text-xl mb-3" style={{ color: "#1E3A6E" }}>
              "{programName}"
            </p>

            {/* درجة الاختبار */}
            {score && (
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-1.5 mb-3">
                <span className="text-muted-foreground text-sm">
                  درجة الاختبار / Score:
                </span>
                <span
                  className="font-extrabold text-xl"
                  style={{ color: "#1E3A6E" }}
                >
                  {score}/100
                </span>
              </div>
            )}

            <p className="text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed mb-2 px-4">
              {programDesc}
            </p>
            <p className="text-gray-500 text-xs mb-1">
              Accordingly, this certificate is awarded in recognition of the
              participant's commitment, attendance, active participation, and
              successful completion of the required examinations and assessments
              throughout the program.
            </p>
            <p
              className="font-bold text-base mb-1"
              style={{ color: "#C9A227" }}
            >
              {dates.from} - {dates.to}
            </p>
            <p className="text-gray-500 text-xs">{dates.issuedAr}</p>
          </div>

          {/* الموجات الزرقاء والذهبية */}
          <div
            className="relative"
            style={{ height: "180px", marginTop: "4px" }}
          >
            <svg
              viewBox="0 0 1200 180"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/*موجة ذهبية فاتحة خلفية*/}
              <path
                d="M0,50 C150,90 350,10 600,50 C850,90 1050,10 1200,50 L1200,180 L0,180 Z"
                fill="#C9A227"
                opacity="0.35"
              />
              {/*موجة ذهبية متوسطة*/}
              <path
                d="M0,70 C200,110 400,30 600,70 C800,110 1000,30 1200,70 L1200,180 L0,180 Z"
                fill="#C9A227"
                opacity="0.55"
              />
              {/*موجة زرقاء فاتحة*/}
              <path
                d="M0,80 C200,120 400,40 600,80 C800,120 1000,40 1200,80 L1200,180 L0,180 Z"
                fill="#1E3A6E"
                opacity="0.6"
              />
              {/*موجة زرقاء داكنة أمامية*/}
              <path
                d="M0,105 C200,145 400,65 600,105 C800,145 1000,65 1200,105 L1200,180 L0,180 Z"
                fill="#1E3A6E"
              />

              {/*===== تاريخ الإصدار — يسار =====*/}
              <text
                x="90"
                y="138"
                fill="#C9A227"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Arial"
              >
                Issued on {dates.issued}
              </text>
              <text
                x="90"
                y="155"
                fill="#C9A227"
                fontSize="10"
                textAnchor="middle"
                fontFamily="Arial"
              >
                {certNumber}
              </text>

              {/*===== الختم الذهبي — وسط =====*/}
              <circle cx="600" cy="138" r="36" fill="#C9A227" />
              <circle cx="600" cy="138" r="30" fill="#B8901F" />
              <circle cx="600" cy="138" r="24" fill="#C9A227" />
              {/* نص الختم */}
              <text
                x="600"
                y="130"
                fill="#1E3A6E"
                fontSize="7"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Arial"
              >
                CERTIFICATE
              </text>
              <text
                x="600"
                y="139"
                fill="#1E3A6E"
                fontSize="6.5"
                textAnchor="middle"
                fontFamily="Arial"
              >
                OF ACHIEVEMENT
              </text>
              <text
                x="600"
                y="148"
                fill="#1E3A6E"
                fontSize="7"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Arial"
              >
                NEWLINE
              </text>
              {/* أسنان الختم */}
              {Array.from({ length: 16 }, (_, i) => {
                const angle = (i * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x1 = 600 + 30 * Math.cos(rad);
                const y1 = 138 + 30 * Math.sin(rad);
                const x2 = 600 + 36 * Math.cos(rad);
                const y2 = 138 + 36 * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#8B6914"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* ===== لوغو نيولاين بدل التوقيع — يمين ===== */}
              <rect
                x="1010"
                y="100"
                width="180"
                height="65"
                rx="12"
                fill="white"
                opacity="0.95"
              />
              <image
                href={LOGO_URL}
                x="1020"
                y="108"
                width="160"
                height="55"
                preserveAspectRatio="xMidYMid meet"
              />
            </svg>
          </div>
        </div>
      </div>

      {/*أزرار إضافية*/}
      <div className="print:hidden flex justify-center gap-4 pb-8">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg"
        >
          <Printer className="w-5 h-5" />
          طباعة / حفظ PDF
        </button>
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground font-bold px-6 py-3 rounded-xl transition-all"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للمسارات
        </button>
      </div>

      {/*CSS للطباعة*/}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.3cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          #certificate {
            page-break-inside: avoid;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
