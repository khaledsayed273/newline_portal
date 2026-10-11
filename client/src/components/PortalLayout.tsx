import {
  BookOpen,
  Zap,
  Briefcase,
  AlertTriangle,
  Map,
  Compass,
  Globe,
  MessageCircle,
  Send,
  Lightbulb,
  BarChart3,
  Award,
  LayoutDashboard,
  Users,
  FileText,
  Menu,
  X,
  Home,
} from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

const LOGO_URL = "/assets/logo.png";

// نفس قائمة الخدمات الموجودة في Home.tsx
const PORTAL_SERVICES = [
  { icon: Home, label: "الصفحة الرئيسية", href: "/home" },
  { icon: BookOpen, label: "الدورات التدريبية", href: "/courses" },
  { icon: Zap, label: "الدورات السريعة", href: "/quick-courses" },
  { icon: Briefcase, label: "الأوصاف الوظيفية", href: "/job-descriptions" },
  { icon: AlertTriangle, label: "سجلات التعثرات", href: "/incidents" },
  { icon: Map, label: "المسار التوجيهي", href: "/training-map" },
  { icon: Compass, label: "الخارطة التدريبية", href: "/map" },
  { icon: Globe, label: "الثقافة العامة", href: "/general-culture" },
  { icon: MessageCircle, label: "الاستشارات", href: "/consultations" },
  { icon: Send, label: "الطلبات", href: "/training-request" },
  { icon: Lightbulb, label: "الاقتراحات", href: "/suggestions" },
  { icon: BarChart3, label: "الإحصائيات", href: "/stats" },
  { icon: Award, label: "الشهادات", href: "/certificates" },
];

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/admin" },
  { icon: BookOpen, label: "إدارة الدورات", href: "/admin/courses" },
  { icon: Map, label: "إدارة المسارات", href: "/admin/tracks" },
  { icon: FileText, label: "الملفات المختصرة", href: "/admin/brief-files" },
  { icon: Users, label: "المستخدمون", href: "/admin/users" },
  { icon: AlertTriangle, label: "التعثرات", href: "/admin/incidents" },
  { icon: Send, label: "طلبات التدريب", href: "/admin/training-requests" },
  { icon: Lightbulb, label: "الاقتراحات", href: "/admin/suggestions" },
];

interface PortalLayoutProps {
  children: ReactNode;
  role: "admin" | "trainee";
  title?: string;
}

export default function PortalLayout({
  children,
  role,
  title,
}: PortalLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const navItems = role === "admin" ? ADMIN_NAV : PORTAL_SERVICES;

  const pageTitle =
    title ||
    navItems.find(
      i =>
        location === i.href ||
        (i.href.length > 1 && location.startsWith(i.href + "/"))
    )?.label ||
    "بوابة نيولاين";

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card">
      {/*رأس الشريط*/}
      <div className="flex shrink-0 flex-col items-center gap-1.5 border-b border-border-muted px-3.5 pb-2.5 pt-3.5">
        <Link href="/">
          <span className="block cursor-pointer rounded-xl bg-gradient-to-b from-white to-slate-100 px-3 py-1.5 shadow-sm ring-1 ring-black/5 dark:from-muted dark:to-card dark:shadow-none dark:ring-border">
            <img
              src={LOGO_URL}
              alt="نيولاين"
              className="h-[48px] w-auto object-contain dark:[filter:invert(1)_hue-rotate(180deg)_saturate(0.9)] print:[filter:none]"
            />
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 shrink-0 rounded-full bg-success" />
          <span className="text-xs font-semibold text-muted-foreground">
            بوابة التدريب
          </span>
          {role === "admin" && (
            <span className="rounded border border-warning/30 bg-warning/10 px-1.5 text-xs font-bold text-warning-emphasis">
              مدير
            </span>
          )}
        </div>
      </div>

      {/* محتوى الصفحة */}
      <nav className="flex-1 overflow-y-auto p-2">
        <p className="text-xs text-muted-foreground px-2 pb-1 pt-1 font-bold uppercase tracking-wider">
          {role === "admin" ? "الإدارة" : "الخدمات"}
        </p>
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive =
            location === href ||
            (href.length > 1 && location.startsWith(href + "/"));
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "mb-px flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-[7px] text-[12.5px] font-semibold no-underline transition-colors",
                  isActive
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-transparent text-foreground hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "flex size-[26px] shrink-0 items-center justify-center rounded-md",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon size={13} />
                </div>
                <span>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border-muted p-2">
        <p className="text-xs text-muted-foreground mt-1.5 text-center">
          © {new Date().getFullYear()} نيولاين للخدمات اللوجستية
        </p>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden bg-background">
      {/* القائمة الجانبية - الشاشات الكبيرة */}
      <aside className="order-1 hidden w-[210px] shrink-0 flex-col border-e border-border shadow-sm md:flex">
        <SidebarContent />
      </aside>

      {/* قائمة الجوال */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute start-0 top-0 h-screen w-[210px] bg-card shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="إغلاق"
              className="absolute end-2.5 top-2.5 z-10 cursor-pointer rounded-md bg-muted p-1.5 text-muted-foreground"
            >
              <X size={15} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="order-2 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* شريط علوي */}
        <header className="flex h-[54px] shrink-0 items-center gap-2.5 border-b border-border bg-card px-4 shadow-sm">
          {/* زر القائمة - الجوال */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="القائمة"
            className="hidden cursor-pointer rounded-lg p-1.5 text-foreground max-md:flex"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-base font-semibold md:text-lg flex-1 text-foreground">
            {pageTitle}
          </h1>
          <ThemeToggle />
        </header>

        {/* قائمة التنقل */}
        <main className="flex-1 overflow-y-auto p-4 px-5">{children}</main>
      </div>
    </div>
  );
}
