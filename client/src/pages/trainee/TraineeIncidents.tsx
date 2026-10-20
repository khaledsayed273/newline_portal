import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Download,
  FileText,
  Presentation,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ملفات سجلات التعثرات الثابتة
const STUMBLING_FILES = [
  {
    id: 1,
    title: "سجل تعثرات المبيعات",
    dept: "إدارة المبيعات",
    deptId: 3,
    fileUrl: "/manus-storage/stumbling_sales_27d7c2fe.pptx",
    fileType: "pptx",
    fileSize: 1166188,
    color: "bg-warning/10 border-warning/30",
    iconColor: "bg-warning/10 text-warning-emphasis",
    badgeVariant: "warning" as const,
  },
  {
    id: 2,
    title: "سجل تعثرات السائقين",
    dept: "إدارة التشغيل",
    deptId: 2,
    fileUrl: "/manus-storage/stumbling_drivers_515ee7a2.pdf",
    fileType: "pdf",
    fileSize: 816517,
    color: "bg-success/10 border-success/30",
    iconColor: "bg-success/10 text-success-emphasis",
    badgeVariant: "success" as const,
  },
  {
    id: 3,
    title: "سجل تعثرات التشغيل",
    dept: "إدارة التشغيل",
    deptId: 2,
    fileUrl: "/manus-storage/stumbling_operations_65c8bdfd.pptx",
    fileType: "pptx",
    fileSize: 1185301,
    color: "bg-success/10 border-success/30",
    iconColor: "bg-success/10 text-success-emphasis",
    badgeVariant: "success" as const,
  },
  {
    id: 4,
    title: "سجل تعثرات الموارد البشرية",
    dept: "إدارة الخدمات المشتركة",
    deptId: 1,
    fileUrl: "/manus-storage/stumbling_hr_1d96d566.pptx",
    fileType: "pptx",
    fileSize: 1170873,
    color: "bg-primary/10 border-primary/30",
    iconColor: "bg-primary/10 text-primary",
    badgeVariant: "info" as const,
  },
  {
    id: 5,
    title: "سجل تعثرات الخدمات المساندة",
    dept: "إدارة الخدمات المشتركة",
    deptId: 1,
    fileUrl: "/manus-storage/stumbling_shared_996d5c0b.pptx",
    fileType: "pptx",
    fileSize: 1202881,
    color: "bg-primary/10 border-primary/30",
    iconColor: "bg-primary/10 text-primary",
    badgeVariant: "info" as const,
  },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const priorityLabels = {
  low: { label: "منخفض", variant: "success" as const },
  medium: { label: "متوسط", variant: "warning" as const },
  high: { label: "عالي", variant: "destructive" as const },
};

const statusLabels = {
  open: { label: "مفتوح", variant: "info" as const },
  in_progress: { label: "قيد المعالجة", variant: "warning" as const },
  resolved: { label: "تم الحل", variant: "success" as const },
  closed: { label: "مغلق", variant: "secondary" as const },
};

export default function TraineeIncidents() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const { data: incidents, isLoading } = trpc.incidents.mine.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.incidents.create.useMutation({
    onSuccess: () => {
      utils.incidents.mine.invalidate();
      setShowForm(false);
      setTitle("");
      setDescription("");
      setCategory("");
      toast.success("تم تسجيل التعثر بنجاح");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title, description, category, priority });
  };

  return (
    <PortalLayout role="trainee" title="سجل التعثرات">
      <div className="space-y-6">
        {/* قسم ملفات سجلات التعثرات */}
        <div className="card overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground">
                ملفات سجلات التعثرات
              </h3>
              <h6 className="text-muted-foreground mt-0.5">
                5 ملفات حسب الإدارة — اضغط للتحميل
              </h6>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STUMBLING_FILES.map(file => {
                const FileIcon =
                  file.fileType === "pdf" ? FileText : Presentation;
                const handleOpen = () => {
                  window.open(file.fileUrl, "_blank", "noopener,noreferrer");
                };
                return (
                  <Button
                    variant="ghost"
                    key={file.id}
                    type="button"
                    onClick={handleOpen}
                    className={cn(
                      "h-auto w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-start transition-all duration-200 hover:shadow-md",
                      file.color
                    )}
                  >
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                        file.iconColor
                      )}
                    >
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-start">
                      <p className="font-semibold text-foreground">
                        {file.title}
                      </p>
                      <h6 className="text-muted-foreground mt-0.5">
                        {file.dept}
                      </h6>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant={file.badgeVariant}
                          size="sm"
                          className="uppercase"
                        >
                          {file.fileType}
                        </Badge>
                        <span className="text-muted-foreground">
                          {formatFileSize(file.fileSize)}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200",
                        "bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground"
                      )}
                    >
                      <Download className="h-4 w-4" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <h6 className="text-muted-foreground">
            سجّل تعثراتك ومشكلاتك التدريبية
          </h6>
          <Button variant="ghost" 
            onClick={() => setShowForm(!showForm)}
            className="gap-2 font-bold"
          >
            <Plus className="h-4 w-4" />
            تسجيل تعثر
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="card p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4"
          >
            <h3 className="text-foreground">
              تسجيل تعثر جديد
            </h3>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                العنوان *
              </label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="وصف مختصر للتعثر"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                التفاصيل
              </label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="اشرح التعثر بالتفصيل..."
              />
            </div>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">
                  الفئة
                </label>
                <Input
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="مثال: تقني، إداري..."
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">
                  الأولوية
                </label>
                <Select value={priority} onValueChange={v => setPriority(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفض</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="font-bold"
              >
                {createMutation.isPending ? "جاري الحفظ..." : "تسجيل التعثر"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-20 animate-pulse" />
            ))}
          </div>
        ) : incidents?.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد تعثرات مسجلة</h3>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            {incidents?.map(incident => {
              const priority = priorityLabels[incident.priority ?? "medium"];
              const status = statusLabels[incident.status ?? "open"];
              return (
                <div key={incident.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h5 className="text-foreground">
                      {incident.title}
                    </h5>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant={priority.variant} size="sm">
                        {priority.label}
                      </Badge>
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                  {incident.description && (
                    <h6 className="text-muted-foreground mb-2">
                      {incident.description}
                    </h6>
                  )}
                  <h6 className="text-muted-foreground">
                    {new Date(incident.createdAt).toLocaleDateString("ar-SA")}
                  </h6>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
