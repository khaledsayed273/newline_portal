import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Award, BookOpen, Download, ExternalLink, FolderTree } from "lucide-react";

const kindMeta: Record<
  string,
  { label: string; icon: typeof Award; badgeClass: string }
> = {
  course: {
    label: "شهادة إتمام دورة",
    icon: Award,
    badgeClass: "bg-warning/10 text-warning-emphasis",
  },
  path: {
    label: "شهادة إتمام مسار",
    icon: FolderTree,
    badgeClass: "bg-primary/10 text-primary",
  },
  admin: {
    label: "شهادة إدارية",
    icon: BookOpen,
    badgeClass: "bg-success/10 text-success-emphasis",
  },
};

export default function TraineeCertificates() {
  const { user } = useAuth();
  const { data: certificates, isLoading } = trpc.certificates.mine.useQuery();

  const buildHref = (cert: any): string | null => {
    if (cert.kind === "course") {
      return cert.courseId ? `/courses/${cert.courseId}?phase=certificate` : null;
    }
    if (cert.kind === "path") {
      const params = new URLSearchParams();
      params.set("uid", String(user?.id ?? ""));
      if (cert.departmentName) params.set("dept", cert.departmentName);
      params.set("path", cert.title);
      return `/certificate/path/${cert.pathId}?${params.toString()}`;
    }
    return null;
  };

  return (
    <PortalLayout role="trainee" title="شهاداتي">
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-36 animate-pulse" />
            ))}
          </div>
        ) : certificates?.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20">
            <Award className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد شهادات بعد</h3>
            <h6 className="text-muted-foreground max-w-xs text-center">
              أكمل الدورات والمسارات التدريبية للحصول على شهاداتك
            </h6>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates?.map((cert: any, i: number) => {
              const meta = kindMeta[cert.kind] ?? kindMeta.admin;
              const KindIcon = meta.icon;
              const href = buildHref(cert);
              return (
                <div
                  key={`${cert.kind}-${cert.id}`}
                  className={cn(
                    "card p-5 animate-in fade-in slide-in-from-bottom-4",
                    `fill-mode-both delay-${Math.min(i + 1, 6) * 50}`
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-warning-emphasis" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mb-1",
                          meta.badgeClass
                        )}
                      >
                        <KindIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                      <h3 className="text-foreground mb-1 line-clamp-1">
                        {cert.title}
                      </h3>
                      <h6 className="text-muted-foreground mb-2">
                        {cert.issuedAt
                          ? new Date(cert.issuedAt).toLocaleDateString("ar-EG")
                          : ""}
                      </h6>
                      {cert.certCode && (
                        <h6 className="font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                          {cert.certCode}
                        </h6>
                      )}
                    </div>
                    {cert.fileUrl ? (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                        title="تحميل الشهادة"
                      >
                        <Download className="h-4 w-4 text-primary" />
                      </a>
                    ) : href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                        title="فتح الشهادة للطباعة"
                      >
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
