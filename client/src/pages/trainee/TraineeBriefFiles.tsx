import { Button } from "@/components/ui/button";
import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  File,
  Image,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

function getFileIcon(fileType?: string | null) {
  if (!fileType) return File;
  const t = fileType.toLowerCase();
  if (t === "pdf") return FileText;
  if (["png", "jpg", "jpeg", "gif", "webp", "image"].includes(t)) return Image;
  return File;
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ألوان الأقسام
const DEPT_COLORS: Record<
  number,
  {
    bg: string;
    icon: string;
    badgeVariant:
      | "default"
      | "secondary"
      | "success"
      | "warning"
      | "info"
      | "destructive"
      | "outline";
  }
> = {
  1: {
    bg: "bg-primary/10",
    icon: "bg-primary/10 text-primary",
    badgeVariant: "info",
  },
  2: {
    bg: "bg-success/10",
    icon: "bg-success/10 text-success-emphasis",
    badgeVariant: "success",
  },
  3: {
    bg: "bg-warning/10",
    icon: "bg-warning/10 text-warning-emphasis",
    badgeVariant: "warning",
  },
  4: {
    bg: "bg-secondary text-secondary-foreground",
    icon: "bg-secondary text-secondary-foreground",
    badgeVariant: "secondary",
  },
  5: {
    bg: "bg-destructive/10",
    icon: "bg-destructive/10 text-destructive",
    badgeVariant: "destructive",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-muted",
  icon: "bg-muted text-muted-foreground",
  badgeVariant: "secondary" as const,
};

export default function TraineeBriefFiles() {
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5])
  );

  const { data: departments } = trpc.departments.list.useQuery();
  const { data: briefFiles, isLoading } = trpc.briefFiles.list.useQuery(
    { departmentId: selectedDept },
    { placeholderData: (prev: any) => prev }
  );

  const toggleDept = (deptId: number) => {
    const next = new Set(expandedDepts);
    if (next.has(deptId)) next.delete(deptId);
    else next.add(deptId);
    setExpandedDepts(next);
  };

  // تجميع الملفات حسب الإدارة
  const filesByDept =
    departments?.reduce(
      (acc, dept) => {
        const files = briefFiles?.filter(f => f.departmentId === dept.id) ?? [];
        if (files.length > 0) acc[dept.id] = { dept, files };
        return acc;
      },
      {} as Record<
        number,
        {
          dept: NonNullable<typeof departments>[0];
          files: NonNullable<typeof briefFiles>;
        }
      >
    ) ?? {};

  const unassignedFiles = briefFiles?.filter(f => !f.departmentId) ?? [];

  const handleDownload = (file: {
    fileUrl?: string | null;
    title: string;
    fileType?: string | null;
  }) => {
    if (!file.fileUrl) return;
    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    // تعيين اسم التحميل
    const ext = file.fileType ? `.${file.fileType}` : "";
    link.download = `${file.title}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PortalLayout role="trainee" title="الدورات السريعة">
      <div className="space-y-5">
        {/* فلتر الإدارات */}
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" 
            onClick={() => setSelectedDept(undefined)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
              !selectedDept
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            الكل
          </Button>
          {departments?.map(dept => {
            return (
              <Button variant="ghost" 
                key={dept.id}
                onClick={() =>
                  setSelectedDept(
                    dept.id === selectedDept ? undefined : dept.id
                  )
                }
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                  selectedDept === dept.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {dept.name}
              </Button>
            );
          })}
        </div>

        {/*المحتوى*/}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5">
                <Skeleton className="h-7 w-56 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !briefFiles?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد ملفات</h3>
            <h6 className="text-muted-foreground">
              لم يتم إضافة ملفات مختصرة بعد
            </h6>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(filesByDept).map(({ dept, files }, sectionIdx) => {
              const isExpanded = expandedDepts.has(dept.id);
              const colors = DEPT_COLORS[dept.id] ?? DEFAULT_COLOR;

              return (
                <div
                  key={dept.id}
                  className="card overflow-hidden shadow-sm"
                  style={{ animationDelay: `${sectionIdx * 0.05}s` }}
                >
                  {/* رأس القسم */}
                  <Button
                    variant="ghost"
                    onClick={() => toggleDept(dept.id)}
                    className="h-auto w-full justify-between rounded-none px-5 py-4 text-start transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                          colors.icon
                        )}
                      >
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="text-start">
                        <h3 className="text-foreground">
                          {dept.name}
                        </h3>
                        <h6 className="text-muted-foreground mt-0.5">
                          {files.length} ملف
                        </h6>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </Button>

                  {/* قائمة الملفات */}
                  {isExpanded && (
                    <div
                      className={cn(
                        "border-t border-border px-5 pb-5 pt-4",
                        colors.bg
                      )}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {files.map(file => {
                          const FileIcon = getFileIcon(file.fileType);
                          const sizeLabel = formatFileSize(file.fileSize);
                          const isPdf = file.fileType?.toLowerCase() === "pdf";

                          return (
                            <div
                              key={file.id}
                              className="card flex items-center gap-3 p-3 hover:shadow-md transition-all duration-200 group"
                            >
                              {/* أيقونة نوع الملف */}
                              <div
                                className={cn(
                                  "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                                  colors.icon
                                )}
                              >
                                <FileIcon className="h-5 w-5" />
                              </div>

                              {/* معلومات الملف */}
                              <div className="flex-1 min-w-0 text-start">
                                <p className="font-semibold text-foreground line-clamp-2">
                                  {file.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {file.fileType && (
                                    <Badge
                                      variant={colors.badgeVariant}
                                      size="sm"
                                      className="uppercase"
                                    >
                                      {file.fileType}
                                    </Badge>
                                  )}
                                  {sizeLabel && (
                                    <span className="text-muted-foreground">
                                      {sizeLabel}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* أزرار الإجراءات */}
                              <div className="flex flex-col gap-1.5 flex-shrink-0">
                                {/*زر فتح في نافذة جديدة*/}
                                {file.fileUrl && (
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="فتح الملف"
                                    className={cn(
                                      "w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200",
                                      "bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground"
                                    )}
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ملفات غير مصنفة */}
            {unassignedFiles.length > 0 && (
              <div className="card overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <File className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-start">
                    <h3 className="text-foreground">
                      ملفات عامة
                    </h3>
                    <h6 className="text-muted-foreground mt-0.5">
                      {unassignedFiles.length} ملف
                    </h6>
                  </div>
                </div>
                <div className="p-5 bg-muted/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {unassignedFiles.map(file => {
                      const FileIcon = getFileIcon(file.fileType);
                      return (
                        <div
                          key={file.id}
                          className="card flex items-center gap-3 p-3 hover:shadow-md transition-all duration-200"
                        >
                          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0 text-start">
                            <p className="font-semibold text-foreground line-clamp-2">
                              {file.title}
                            </p>
                            {file.fileType && (
                              <Badge
                                variant="secondary"
                                size="sm"
                                className="uppercase mt-1"
                              >
                                {file.fileType}
                              </Badge>
                            )}
                          </div>
                          {file.fileUrl && (
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="فتح الملف"
                              className="w-9 h-9 rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200 flex-shrink-0"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
