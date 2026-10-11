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
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

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

  // المعرف الفريد للمتدرب
  const userIdentifier = (() => {
    let id = localStorage.getItem("userIdentifier");
    if (!id) {
      id = `user_${Math.random().toString(36).substr(2, 12)}`;
      localStorage.setItem("userIdentifier", id);
    }
    return id;
  })();

  const { data: traineeStats } = trpc.traineeStats.get.useQuery({
    userIdentifier,
  });

  const completed = enrollments?.filter(e => e.isCompleted).length ?? 0;
  const inProgress =
    enrollments?.filter(e => !e.isCompleted && (e.progress ?? 0) > 0).length ??
    0;
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
        <div
          className="relative overflow-hidden rounded-xl p-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(29,78,216,0.28) 0%, rgba(37,99,235,0.14) 50%, rgba(10,22,40,0.70) 100%)",
            border: "1px solid rgba(37,99,235,0.22)",
          }}
        >
          <div
            className="absolute top-0 left-0 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
              transform: "translate(-30%,-30%)",
            }}
          />
          <div className="relative">
            <p className="text-primary text-sm font-medium mb-1">
              {getGreeting()}؟
            </p>
            <h2 className="text-white mb-1">{user?.name || "المتدرب"} 👋</h2>
            <p className="text-muted-foreground text-sm">
              مرحباً بك في بوابة التدريب — ابدأ رحلتك التعليمية اليوم
            </p>
          </div>

          {/*الإحصائيات الشخصية*/}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
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
                  className="rounded-md bg-muted flex items-center justify-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <span
                  className="text-xl font-bold tracking-tight md:text-2xl text-foreground"
                  style={{
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {s.value}
                  {s.suffix}
                </span>
                <span className="text-xs text-muted-foreground font-bold">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* شريط التقدم */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>نسبة إنجاز الدورات</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700 bg-primary"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              كل دورة تكملها = نقطة + 5% حوافز
            </p>
          </div>
        </div>

        {/* ===== شبكة الخدمات ===== */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            الخدمات المتاحة
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {SERVICES.map(
              ({ href, label, desc, icon: Icon, color, bg, border }) => (
                <Link key={href} href={href}>
                  <div
                    className="flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all duration-200 h-full"
                    style={{ background: bg, border: `1px solid ${border}` }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform =
                        "translateY(-2px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        `0 8px 24px ${color}20`;
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        `${color}50`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "none";
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        border;
                    }}
                  >
                    {/*النص على اليسار*/}
                    <div className="flex-1 min-w-0 text-start">
                      <p className="text-sm font-medium text-card-foreground mb-0.5 leading-tight">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {desc}
                      </p>
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
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-primary" />
                أحدث الدورات المتاحة
              </h3>
              <Link href="/courses">
                <span className="text-xs text-muted-foreground text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer">
                  عرض الكل <ArrowLeft size={12} />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {courses.map((course: any) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <div className="card p-4 cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                      <BookOpen size={15} className="text-primary" />
                    </div>
                    <p className="text-sm font-medium text-card-foreground mb-1 leading-tight line-clamp-2">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.department || "عام"}
                    </p>
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
