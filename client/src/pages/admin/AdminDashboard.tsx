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
      color: "text-info-emphasis",
      bg: "bg-info/10",
    },
    {
      label: "الدورات",
      value: stats?.courses,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "المسارات",
      value: stats?.tracks,
      icon: GraduationCap,
      color: "text-primary",
      bg: "bg-primary/10",
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
      color: "text-secondary-foreground",
      bg: "bg-secondary/20",
    },
    {
      label: "الشهادات",
      value: stats?.certificates,
      icon: Award,
      color: "text-warning-emphasis",
      bg: "bg-warning/10",
    },
    {
      label: "التعثرات",
      value: stats?.incidents,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "طلبات معلقة",
      value: stats?.pendingRequests,
      icon: Send,
      color: "text-success-emphasis",
      bg: "bg-success/10",
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
              <h6 className="text-muted-foreground mt-1">
                إدارة شاملة لبوابة نيولاين للتدريب
              </h6>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div>
          <h6 className="text-muted-foreground uppercase mb-4">
            نظرة عامة
          </h6>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-4">
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
                <h2 className="text-foreground">
                  {isLoading ? "—" : (card.value ?? 0)}
                </h2>
                <h6 className="text-muted-foreground mt-1">
                  {card.label}
                </h6>
              </div>
            ))}
          </div>
        </div>

        {/* روابط سريعة */}
        <div>
          <h6 className="text-muted-foreground uppercase mb-4">
            إجراءات سريعة
          </h6>
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
                  <p className="font-medium text-foreground">
                    {item.label}
                  </p>
                  <h6 className="text-muted-foreground">{item.desc}</h6>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
