import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Compass,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Map,
  Menu,
  MessageCircle,
  Send,
  Users,
  User,
  X,
  Zap,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";

const LOGO_URL = "/assets/logo.png";

type UserRole = "admin" | "trainee";

interface PortalLayoutProps {
  children: ReactNode;
  role: UserRole;
  title?: string;
}

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
}

const PORTAL_SERVICES: NavItem[] = [
  { icon: Home, label: "الصفحة الرئيسية", href: "/" },
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

const ADMIN_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/admin" },
  { icon: BookOpen, label: "إدارة الدورات", href: "/admin/courses" },
  { icon: Map, label: "إدارة المسارات", href: "/admin/tracks" },
  { icon: FileText, label: "الملفات المختصرة", href: "/admin/brief-files" },
  { icon: Users, label: "المستخدمون", href: "/admin/users" },
  { icon: AlertTriangle, label: "التعثرات", href: "/admin/incidents" },
  { icon: Send, label: "طلبات التدريب", href: "/admin/training-requests" },
  { icon: Lightbulb, label: "الاقتراحات", href: "/admin/suggestions" },
];

const SIDEBAR_WIDTH = "w-60";

function isRouteActive(location: string, href: string) {
  return (
    location === href ||
    (href !== "/" && location.startsWith(`${href}/`))
  );
}

function NavItemLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const { icon: Icon, label, href } = item;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
          "mb-px flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-[7px]",
          "text-[12.5px] font-semibold no-underline",
          "transition-colors duration-150",
          active
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-transparent text-foreground hover:bg-muted"
      )}
    >
        <span
          className={cn(
            "flex size-[26px] shrink-0 items-center justify-center rounded-md",
            "transition-colors duration-150",
            active
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon size={13} strokeWidth={2} />
        </span>

        <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({
  role,
  location,
  onNavigate,
}: {
  role: UserRole;
  location: string;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  const isAdminUser = user?.role === "admin";
  const baseNavItems = role === "admin" ? ADMIN_NAV : PORTAL_SERVICES;
  const navItems =
    role !== "admin" && isAdminUser
      ? [
          { icon: LayoutDashboard, label: "لوحة تحكم المدير", href: "/admin" },
          ...baseNavItems,
        ]
      : baseNavItems;
  const activeHref = navItems
    .filter(item => isRouteActive(location, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex shrink-0 flex-col items-center gap-1.5 border-b border-border-muted px-3.5 pb-2.5 pt-3.5">
        <Link href="/">
          <span
            className={cn(
              "block cursor-pointer rounded-xl px-3 py-1.5",
              "bg-gradient-to-b from-white to-slate-100",
              "shadow-sm ring-1 ring-black/5",
              "dark:from-muted dark:to-card",
              "dark:shadow-none dark:ring-border"
            )}
          >
            <img
              src={LOGO_URL}
              alt="نيولاين"
              className={cn(
                "h-[48px] w-auto object-contain",
                "dark:[filter:invert(1)_hue-rotate(180deg)_saturate(0.9)]",
                "print:[filter:none]"
              )}
            />
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="size-1.5 shrink-0 rounded-full bg-success" />

          <h6 className="text-muted-foreground">
            بوابة التدريب
          </h6>

          {role === "admin" && (
            <span className="rounded border border-warning/30 bg-warning/10 px-1.5 font-bold text-warning-emphasis">
              مدير
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label={role === "admin" ? "الإدارة" : "الخدمات"}
        className="flex-1 overflow-y-auto p-2"
      >
        <h6 className="px-2 py-1 uppercase text-muted-foreground">
          {role === "admin" ? "الإدارة" : "الخدمات"}
        </h6>

        {navItems.map((item) => (
          <NavItemLink
            key={item.href}
            item={item}
            active={item.href === activeHref}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-muted p-2">
        <h6 className="mt-1.5 text-center text-muted-foreground">
          © {new Date().getFullYear()} نيولاين للخدمات اللوجستية
        </h6>
      </div>
    </div>
  );
}

function MobileSidebar({
  open,
  role,
  location,
  onClose,
}: {
  open: boolean;
  role: UserRole;
  location: string;
  onClose: () => void;
}) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        "pointer-events-none",
        open && "pointer-events-auto"
      )}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
        className={cn(
          "absolute inset-0 h-full w-full cursor-default",
          "bg-black/60",
          "transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Sidebar */}
      <aside
        aria-label="القائمة الجانبية"
        className={cn(
          "absolute start-0 top-0 h-screen",
          SIDEBAR_WIDTH,
          "bg-card shadow-xl",
          "transition-transform duration-300 ease-out",
          "will-change-transform",
          open
            ? "translate-x-0"
            : "ltr:-translate-x-full rtl:translate-x-full"
        )}
      >
        {/* Close button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="إغلاق"
          className={cn(
            "absolute end-2.5 top-2.5 z-10",
            "cursor-pointer rounded-md p-1.5",
            "bg-muted text-muted-foreground",
            "transition-colors hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <X size={15} />
        </Button>

        <SidebarContent
          role={role}
          location={location}
          onNavigate={onClose}
        />
      </aside>
    </div>
  );
}

export default function PortalLayout({
  children,
  role,
  title,
}: PortalLayoutProps) {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const isAdminUser = user?.role === "admin";

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const baseNavItems = role === "admin" ? ADMIN_NAV : PORTAL_SERVICES;
  const navItems =
    role !== "admin" && isAdminUser
      ? [{ icon: LayoutDashboard, label: "لوحة تحكم المدير", href: "/admin" }, ...baseNavItems]
      : baseNavItems;

  const pageTitle = useMemo(() => {
    if (title) return title;

    return (
      navItems.find((item) => isRouteActive(location, item.href))?.label ??
      "بوابة نيولاين"
    );
  }, [location, navItems, title]);

  // Close mobile sidebar whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Prevent page scrolling while the mobile sidebar is open.
  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background" dir="rtl">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-s border-border shadow-sm md:flex",
          SIDEBAR_WIDTH
        )}
      >
        <SidebarContent role={role} location={location} />
      </aside>

      {/* Mobile sidebar */}
      <MobileSidebar
        open={sidebarOpen}
        role={role}
        location={location}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="order-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className={cn(
            "flex min-h-[54px] shrink-0 items-center justify-between gap-2.5 py-2",
            "border-b border-border bg-card px-4 shadow-sm"
          )}
        >
          <div className="flex items-center gap-2.5">
            {/* Mobile menu button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={sidebarOpen}
              className={cn(
                "cursor-pointer rounded-lg p-1.5",
                "text-foreground",
                "transition-colors hover:bg-muted",
                "md:hidden"
              )}
            >
              <Menu size={20} />
            </Button>

            {/* Page title */}
            <h3>
              {pageTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex items-center justify-center rounded-lg p-1.5 text-foreground transition-colors hover:bg-muted"
                    aria-label="حساب المستخدم"
                  >
                    <User size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[10rem]">
                  <DropdownMenuLabel>
                    {user.name || user.employeeNumber}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={e => {
                    e.preventDefault();
                    setLogoutOpen(true);
                  }}
                >
                    <LogOut size={14} />
                    تسجيل خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:px-5">
          {children}
        </main>
      </div>
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تسجيل خروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من تسجيل الخروج؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
