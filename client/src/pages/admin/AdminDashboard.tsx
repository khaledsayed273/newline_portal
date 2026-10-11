import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Award,
  BookOpen,
  FileText,
  GraduationCap,
  Send,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.stats.overview.useQuery();

  const statCards = [
    {
      label: "المتدربون",
      value: stats?.users,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/40",
    },
    {
      label: "الدورات",
      value: stats?.courses,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/40",
    },
    {
      label: "المسارات",
      value: stats?.tracks,
      icon: GraduationCap,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      label: "الملفات المختصرة",
      value: stats?.briefFiles,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "التسجيلات",
      value: stats?.enrollments,
      icon: BookOpen,
      color: "text-fuchsia-600",
      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    },
    {
      label: "الشهادات",
      value: stats?.certificates,
      icon: Award,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "التعثرات",
      value: stats?.incidents,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/40",
    },
    {
      label: "طلبات معلقة",
      value: stats?.pendingRequests,
      icon: Send,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/40",
    },
  ];

  return (
    <PortalLayout role="admin" title="لوحة التحكم">
      <div className="space-y-8">
        {/* ترحيب */}
        <div className="bg-card border border-border rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-foreground">لوحة تحكم المدير</h2>
              <p className="text-xs leading-6 md:text-sm text-muted-foreground mt-1">
                إدارة شاملة لبوابة نيولاين للتدريب
              </p>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div>
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">
            نظرة عامة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <div
                key={card.label}
                className={cn(
                  "rounded-2xl p-5 border border-border animate-in fade-in slide-in-from-bottom-4",
                  card.bg,
                  `fill-mode-both delay-${Math.min(i + 1, 6) * 50}`
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl bg-card/60 flex items-center justify-center mb-3",
                    card.color
                  )}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-xl font-bold tracking-tight md:text-2xl text-foreground">
                  {isLoading ? "—" : (card.value ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* روابط سريعة */}
        <div>
          <h3 className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">
            إجراءات سريعة
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                href: "/admin/courses",
                label: "إدارة الدورات",
                desc: "إضافة وتعديل الدورات والدروس",
                icon: BookOpen,
              },
              {
                href: "/admin/tracks",
                label: "إدارة المسارات",
                desc: "إنشاء مسارات تدريبية متكاملة",
                icon: GraduationCap,
              },
              {
                href: "/admin/brief-files",
                label: "إدارة الملفات",
                desc: "رفع وتنظيم الملفات المختصرة",
                icon: FileText,
              },
              {
                href: "/admin/users",
                label: "إدارة المتدربين",
                desc: "عرض وإدارة حسابات المتدربين",
                icon: Users,
              },
              {
                href: "/admin/training-requests",
                label: "طلبات التدريب",
                desc: "مراجعة والرد على الطلبات",
                icon: Send,
              },
              {
                href: "/admin/incidents",
                label: "سجلات التعثرات",
                desc: "متابعة ومعالجة التعثرات",
                icon: AlertTriangle,
              },
            ].map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "card p-4 flex items-center gap-3 hover:border-primary/30",
                  `animate-in fade-in slide-in-from-bottom-4 fill-mode-both delay-${Math.min(i + 1, 6) * 50}`
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
