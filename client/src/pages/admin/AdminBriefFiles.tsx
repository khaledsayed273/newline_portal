import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Edit2, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function BriefFileForm({
  initial,
  departments,
  onSave,
  onCancel,
  isLoading,
}: any) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [fileType, setFileType] = useState(initial?.fileType ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [order, setOrder] = useState(initial?.order ?? 0);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave({
          title,
          description: description || undefined,
          departmentId: departmentId ? Number(departmentId) : undefined,
          fileUrl: fileUrl || undefined,
          fileType: fileType || undefined,
          isPublished,
          order: Number(order),
        });
      }}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-foreground">
        {initial ? "تعديل الملف" : "إضافة ملف جديد"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            اسم الملف *
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="اسم الملف المختصر"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            الوصف
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            الإدارة
          </label>
          <select
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">-- عام --</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            نوع الملف
          </label>
          <select
            value={fileType}
            onChange={e => setFileType(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">-- اختر --</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
            <option value="pptx">PowerPoint</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            رابط الملف
          </label>
          <input
            value={fileUrl}
            onChange={e => setFileUrl(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            الترتيب
          </label>
          <input
            type="number"
            value={order}
            onChange={e => setOrder(e.target.value)}
            min={0}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="pub-file"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <label
            htmlFor="pub-file"
            className="text-sm font-semibold text-foreground cursor-pointer"
          >
            نشر الملف
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="font-bold">
          {isLoading ? "جاري الحفظ..." : initial ? "حفظ" : "إضافة"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

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
      toast.success("تم إضافة الملف");
    },
  });
  const updateMutation = trpc.briefFiles.update.useMutation({
    onSuccess: () => {
      utils.briefFiles.listAll.invalidate();
      setEditingId(null);
      toast.success("تم تحديث الملف");
    },
  });
  const deleteMutation = trpc.briefFiles.delete.useMutation({
    onSuccess: () => {
      utils.briefFiles.listAll.invalidate();
      toast.success("تم حذف الملف");
    },
  });

  return (
    <PortalLayout role="admin" title="إدارة الملفات المختصرة">
      <div className="space-y-5">
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <p className="text-xs leading-6 md:text-sm text-muted-foreground">
            {files?.length ?? 0} ملف
          </p>
          <Button
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
                    <button
                      onClick={() => setEditingId(file.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("حذف الملف؟"))
                          deleteMutation.mutate({ id: file.id });
                      }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
