import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Edit2, GraduationCap, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function TrackForm({ initial, departments, onSave, onCancel, isLoading }: any) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [targetRole, setTargetRole] = useState(initial?.targetRole ?? "");
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
          targetRole: targetRole || undefined,
          isPublished,
          order: Number(order),
        });
      }}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-foreground">
        {initial ? "تعديل المسار" : "إضافة مسار جديد"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            اسم المسار *
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="اسم المسار التدريبي"
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
            <option value="">-- اختر الإدارة --</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            الدور المستهدف
          </label>
          <input
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="مثال: موظف جديد، مشرف..."
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
            id="pub-track"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <label
            htmlFor="pub-track"
            className="text-sm font-semibold text-foreground cursor-pointer"
          >
            نشر المسار
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

export default function AdminTracks() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: tracks, isLoading } = trpc.tracks.listAll.useQuery();
  const { data: departments } = trpc.departments.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.tracks.create.useMutation({
    onSuccess: () => {
      utils.tracks.listAll.invalidate();
      setShowForm(false);
      toast.success("تم إضافة المسار");
    },
  });
  const updateMutation = trpc.tracks.update.useMutation({
    onSuccess: () => {
      utils.tracks.listAll.invalidate();
      setEditingId(null);
      toast.success("تم تحديث المسار");
    },
  });
  const deleteMutation = trpc.tracks.delete.useMutation({
    onSuccess: () => {
      utils.tracks.listAll.invalidate();
      toast.success("تم حذف المسار");
    },
  });

  return (
    <PortalLayout role="admin" title="إدارة المسارات">
      <div className="space-y-5">
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <p className="text-xs leading-6 md:text-sm text-muted-foreground">
            {tracks?.length ?? 0} مسار
          </p>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 font-bold"
          >
            <Plus className="h-4 w-4" />
            إضافة مسار
          </Button>
        </div>

        {showForm && (
          <TrackForm
            departments={departments ?? []}
            onSave={(data: any) => createMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-16 animate-pulse" />
            ))}
          </div>
        ) : tracks?.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <GraduationCap className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد مسارات</h3>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            {tracks?.map(track =>
              editingId === track.id ? (
                <TrackForm
                  key={track.id}
                  initial={track}
                  departments={departments ?? []}
                  onSave={(data: any) =>
                    updateMutation.mutate({ id: track.id, ...data })
                  }
                  onCancel={() => setEditingId(null)}
                  isLoading={updateMutation.isPending}
                />
              ) : (
                <div
                  key={track.id}
                  className="card p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-foreground">{track.title}</h4>
                      <Badge
                        variant={track.isPublished ? "success" : "secondary"}
                      >
                        {track.isPublished ? "منشور" : "مسودة"}
                      </Badge>
                    </div>
                    {track.targetRole && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {track.targetRole}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingId(track.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("حذف المسار؟"))
                          deleteMutation.mutate({ id: track.id });
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
