import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Award, Download, ExternalLink } from "lucide-react";

export default function TraineeCertificates() {
  const { data: certificates, isLoading } = trpc.certificates.mine.useQuery();

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
            <p className="text-xs leading-6 md:text-sm text-muted-foreground max-w-xs text-center">
              أكمل الدورات والمسارات التدريبية للحصول على شهاداتك
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates?.map((cert, i) => (
              <div
                key={cert.id}
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
                    <h3 className="text-base font-semibold md:text-lg text-foreground mb-1">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(cert.issuedAt).toLocaleDateString("ar-SA")}
                    </p>
                    {cert.certificateCode && (
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                        {cert.certificateCode}
                      </p>
                    )}
                  </div>
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    >
                      <Download className="h-4 w-4 text-primary" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
