import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Edit2, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BriefFileForm } from "@/components/BriefFileForm";

export default function AdminBriefFiles() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: files, isLoading } = trpc.briefFiles.listAll.useQuery();
  const { data: departments } = trpc.departments.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.briefFiles.create.useMutation({
    onSuccess: () => {
      utils.briefFiles.listAll.invalidate();
      setShowForm(false);
      toast.success("تم إضافة الدورة السريعة");
    },
    onError: (err: any) => toast.error(err?.message || "فشل الإضافة"),
  });
  const updateMutation = trpc.briefFiles.update.useMutation({
    onSuccess: () => {
      utils.briefFiles.listAll.invalidate();
      setEditingId(null);
      toast.success("تم تحديث الدورة السريعة");
    },
    onError: (err: any) => toast.error(err?.message || "فشل التحديث"),
  });
  const deleteMutation = trpc.briefFiles.delete.useMutation({
    onSuccess: () => {
      utils.briefFiles.listAll.invalidate();
      toast.success("تم حذف الدورة السريعة");
    },
    onError: (err: any) => toast.error(err?.message || "فشل الحذف"),
  });

  return (
    <PortalLayout role="admin" title="إدارة الدورات السريعة">
      <div className="space-y-5">
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <h6 className="text-muted-foreground">
            {files?.length ?? 0} ملف
          </h6>
          <Button variant="ghost" 
            onClick={() => setShowForm(!showForm)}
            className="gap-2 font-bold"
          >
            <Plus className="h-4 w-4" />
            إضافة ملف
          </Button>
        </div>

        {showForm && (
          <BriefFileForm
            departments={departments ?? []}
            onSave={(data: any) => createMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-14 animate-pulse" />
            ))}
          </div>
        ) : files?.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد ملفات</h3>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {files?.map(file =>
              editingId === file.id ? (
                <BriefFileForm
                  key={file.id}
                  initial={file}
                  departments={departments ?? []}
                  onSave={(data: any) =>
                    updateMutation.mutate({ id: file.id, ...data })
                  }
                  onCancel={() => setEditingId(null)}
                  isLoading={updateMutation.isPending}
                />
              ) : (
                <div key={file.id} className="card p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-foreground">{file.title}</h4>
                      {file.fileType && (
                        <Badge
                          variant="secondary"
                          size="sm"
                          className="uppercase"
                        >
                          {file.fileType}
                        </Badge>
                      )}
                      <Badge
                        variant={file.isPublished ? "success" : "secondary"}
                      >
                        {file.isPublished ? "منشور" : "مسودة"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" 
                      onClick={() => setEditingId(file.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" 
                      onClick={() => deleteMutation.mutate({ id: file.id })}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
