import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import {
  Award,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function TraineeStats() {
  const { user } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const { data: stats, isLoading } = trpc.traineeStats.get.useQuery(undefined, {
    enabled: Boolean(user),
  });
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery();

  const completed = enrollments?.filter(e => e.isCompleted).length ?? 0;
  const inProgress =
    enrollments?.filter(e => !e.isCompleted && (e.progress ?? 0) > 0).length ??
    0;

  const cards = [
    {
      label: "النقاط المكتسبة",
      value: stats?.points ?? 0,
      suffix: " نقطة",
      icon: Award,
    },
    {
      label: "نسبة الإنجاز",
      value: stats?.completionRate ?? 0,
      suffix: "%",
      icon: TrendingUp,
    },
    {
      label: "الشهادات",
      value: stats?.certificates ?? 0,
      suffix: "",
      icon: GraduationCap,
    },
    {
      label: "الدورات المكتملة",
      value: completed,
      suffix: "",
      icon: CheckCircle2,
    },
    { label: "قيد التقدم", value: inProgress, suffix: "", icon: Clock },
    {
      label: "إجمالي الدورات",
      value: completed + inProgress,
      suffix: "",
      icon: BookOpen,
    },
  ];

  return (
    <PortalLayout role="trainee" title="الإحصائيات">
      <div className="space-y-5">
        {/* بطاقات الإحصائيات */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl animate-pulse bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3">
            {cards.map(card => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-card border border-border shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h2 className="text-foreground">
                    {card.value}
                    {card.suffix}
                  </h2>
                  <h6 className="text-muted-foreground text-center">
                    {card.label}
                  </h6>
                </div>
              );
            })}
          </div>
        )}

        {/*شريط تقدم الإنجاز*/}
        <div className="rounded-2xl p-5 bg-card border border-border shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-foreground">
              نسبة إنجاز الدورات
            </span>
            <span className="font-medium text-success-emphasis">
              {stats?.completionRate ?? 0}%
            </span>
          </div>
          <div className="w-full rounded-full h-3 bg-muted">
            <div
              className="h-3 rounded-full bg-success transition-all duration-700"
              style={{
                width: `${Math.min(stats?.completionRate ?? 0, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
