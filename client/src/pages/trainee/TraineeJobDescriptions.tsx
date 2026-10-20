import { Button } from "@/components/ui/button";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Briefcase, CheckCircle2, Download } from "lucide-react";
import { useState } from "react";

export default function TraineeJobDescriptions() {
  const [selectedDept, setSelectedDept] = useState<number | undefined>();

  const { data: departments } = trpc.departments.list.useQuery();
  const { data: jobs, isLoading } = trpc.jobDescriptions.list.useQuery({
    departmentId: selectedDept,
  });

  return (
    <PortalLayout role="trainee" title="الأوصاف الوظيفية">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Button variant="ghost" 
            onClick={() => setSelectedDept(undefined)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all",
              !selectedDept
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            الكل
          </Button>
          {departments?.map(dept => (
            <Button variant="ghost" 
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                selectedDept === dept.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {dept.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl h-40 animate-pulse"
              />
            ))}
          </div>
        ) : jobs?.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <Briefcase className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">
              لا توجد مهام
            </h3>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {jobs?.map((job, i) => (
              <div
                key={job.id}
                className={cn(
                  "bg-card border border-border rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4",
                  `fill-mode-both delay-${Math.min(i + 1, 6) * 50}`
                )}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-foreground">{job.title}</h3>
                  </div>
                  {job.fileUrl && (
                    <a
                      href={job.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      تحميل
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {job.responsibilities &&
                    (job.responsibilities as string[]).length > 0 && (
                      <div>
                        <h5 className="text-foreground mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-primary rounded-full" />
                          المسؤوليات والمهام
                        </h5>
                        <ul className="space-y-2">
                          {(job.responsibilities as string[]).map((r, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {job.requirements &&
                    (job.requirements as string[]).length > 0 && (
                      <div>
                        <h5 className="text-foreground mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                          المتطلبات
                        </h5>
                        <ul className="space-y-2">
                          {(job.requirements as string[]).map((r, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
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
