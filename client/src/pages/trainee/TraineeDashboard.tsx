import { useAuth } from "@/_core/hooks/useAuth";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Map,
  Send,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import type { CSSProperties } from "react";

const SERVICES = [
  {
    href: "/courses",
    label: "الدورات التدريبية",
    desc: "استعرض وتابع دوراتك مع الفيديوهات",
    icon: BookOpen,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.22)",
  },
  {
    href: "/tracks",
    label: "المسارات التدريبية",
    desc: "تابع مسارك التدريبي خطوة بخطوة",
    icon: Map,
    color: "#818cf8",
    bg: "rgba(129,140,248,0.10)",
    border: "rgba(129,140,248,0.22)",
  },
  {
    href: "/brief-files",
    label: "الملفات المختصرة",
    desc: "ملفات مرجعية مقسمة حسب الإدارة",
    icon: FileText,
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.22)",
  },
  {
    href: "/quizzes",
    label: "الاختبارات",
    desc: "اختبر معلوماتك وقيّم مستواك",
    icon: ClipboardCheck,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.10)",
    border: "rgba(167,139,250,0.22)",
  },
  {
    href: "/certificates",
    label: "شهاداتي",
    desc: "استعرض شهاداتك وإنجازاتك",
    icon: Award,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.22)",
  },
  {
    href: "/incidents",
    label: "التعثرات",
    desc: "تتبع وإدارة التعثرات والمشكلات",
    icon: AlertTriangle,
    color: "#f87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.22)",
  },
  {
    href: "/training-request",
    label: "طلب تدريب",
    desc: "قدّم طلب تدريب جديد",
    icon: GraduationCap,
    color: "#34d399",
    bg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.22)",
  },
  {
    href: "/suggestions",
    label: "أفكاري",
    desc: "اقتراحاتك تُحدث الفرق",
    icon: Lightbulb,
    color: "#fb923c",
    bg: "rgba(251,146,60,0.10)",
    border: "rgba(251,146,60,0.22)",
  },
  {
    href: "/faqs",
    label: "الأسئلة الشائعة",
    desc: "إجابات على أكثر الأسئلة شيوعاً",
    icon: HelpCircle,
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.22)",
  },
  {
    href: "/job-descriptions",
    label: "المهام الرئيسية",
    desc: "الوصف الوظيفي ومهامك الأساسية",
    icon: Briefcase,
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.10)",
    border: "rgba(148,163,184,0.22)",
  },
  {
    href: "/training-map",
    label: "الخارطة التدريبية",
    desc: "300+ دورة موزعة على جميع الإدارات",
    icon: Map,
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.10)",
    border: "rgba(14,165,233,0.22)",
  },
  {
    href: "/library",
    label: "المكتبة التدريبية",
    desc: "مصادر عربية مجانية مصنفة ومتاحة للجميع",
    icon: BookOpen,
    color: "#10b981",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.22)",
  },
];

export default function TraineeDashboard() {
  const { user } = useAuth();
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery();
  const { data: coursesRaw } = trpc.courses.list.useQuery({
    departmentId: undefined,
  });

  const { data: traineeStats } = trpc.traineeStats.get.useQuery(undefined, {
    enabled: Boolean(user),
  });

  const courses = (Array.isArray(coursesRaw) ? coursesRaw : []).slice(0, 4);

  const points = traineeStats?.points ?? 0;
  const completionRate = traineeStats?.completionRate ?? 0;
  const certificates = traineeStats?.certificates ?? 0;
  const consultations = traineeStats?.consultations ?? 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "صباح الخير";
    if (h < 17) return "مساء الخير";
    return "مساء النور";
  };

  return (
    <PortalLayout role="trainee" title="لوحتي">
      <div className="space-y-6">
        {/* ===== بطاقة الترحيب ===== */}
        <div className="welcome-hero relative overflow-hidden rounded-xl p-6">
          <div className="hero-glow absolute top-0 left-0 w-56 h-56 rounded-full pointer-events-none" />
          <div className="relative">
            <p className="text-primary font-medium mb-1">
              {getGreeting()}؟
            </p>
            <h2 className="text-white mb-1">{user?.name || "المتدرب"} 👋</h2>
            <p className="text-muted-foreground">
              مرحباً بك في بوابة التدريب — ابدأ رحلتك التعليمية اليوم
            </p>
          </div>

          {/*الإحصائيات الشخصية*/}
          <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-4">
            {[
              {
                label: "نقاطي",
                value: points,
                icon: Award,
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.12)",
                suffix: " نقطة",
              },
              {
                label: "نسبة الإنجاز",
                value: completionRate,
                icon: CheckCircle2,
                color: "#22c55e",
                bg: "rgba(34,197,94,0.12)",
                suffix: "%",
              },
              {
                label: "شهاداتي",
                value: certificates,
                icon: GraduationCap,
                color: "#a78bfa",
                bg: "rgba(167,139,250,0.12)",
                suffix: "",
              },
              {
                label: "استشاراتي",
                value: consultations,
                icon: Send,
                color: "#38bdf8",
                bg: "rgba(56,189,248,0.12)",
                suffix: "",
              },
            ].map(s => (
              <div
                key={s.label}
                className="card flex flex-col items-center justify-center gap-1.5 p-4"
              >
                <div
                  className="size-10 rounded-md flex items-center justify-center"
                  style={{ background: s.bg }}
                >
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <h2 className="text-foreground">
                  {s.value}
                  {s.suffix}
                </h2>
                <h6 className="text-muted-foreground text-center">
                  {s.label}
                </h6>
              </div>
            ))}
          </div>

          {/* شريط التقدم */}
          <div className="mt-4">
            <div className="flex justify-between text-muted-foreground mb-1">
              <span>نسبة إنجاز الدورات</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700 bg-primary"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <h6 className="text-muted-foreground mt-1">
              كل دورة تكملها = نقطة + 5% حوافز
            </h6>
          </div>
        </div>

        {/* ===== شبكة الخدمات ===== */}
        <div>
          <h5 className="text-muted-foreground mb-3 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            الخدمات المتاحة
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {SERVICES.map(
              ({ href, label, desc, icon: Icon, color, bg, border }) => (
                <Link
                  key={href}
                  href={href}
                  className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div
                    className="flex h-full items-start gap-3.5 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--svc)] hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--svc)_25%,transparent)]"
                    style={
                      {
                        "--svc": color,
                        background: bg,
                        border: `1px solid ${border}`,
                      } as CSSProperties
                    }
                  >
                    {/*النص على اليسار*/}
                    <div className="flex-1 min-w-0 text-start">
                      <p className="font-medium text-card-foreground mb-0.5">
                        {label}
                      </p>
                      <h6 className="text-muted-foreground">
                        {desc}
                      </h6>
                    </div>
                    {/*الأيقونة على اليمين*/}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${color}18`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      <Icon size={17} style={{ color }} />
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>

        {/*===== أحدث الدورات =====*/}
        {courses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-muted-foreground flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary" />
                أحدث الدورات المتاحة
              </h5>
              <Link href="/courses">
                <span className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer">
                  عرض الكل <ArrowLeft size={12} />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {courses.map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="card cursor-pointer p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                      <BookOpen size={15} className="text-primary" />
                    </div>
                    <p className="font-medium text-card-foreground mb-1 line-clamp-2">
                      {course.title}
                    </p>
                    <h6 className="text-muted-foreground">
                      {course.department || "عام"}
                    </h6>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
