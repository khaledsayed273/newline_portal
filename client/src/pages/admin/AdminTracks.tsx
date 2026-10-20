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
import { Edit2, GraduationCap, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function PathForm({ initial, departments, onSave, onCancel, isLoading }: any) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [order, setOrder] = useState(initial?.order ?? 0);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!departmentId) return;
        onSave({
          name,
          description: description || undefined,
          departmentId: Number(departmentId),
          isPublished,
          order: Number(order),
        });
      }}
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <h3 className="text-foreground">
        {initial ? "تعديل المسار" : "إضافة مسار جديد"}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            اسم المسار *
          </label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            الوصف
          </label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            الإدارة *
          </label>
          <Select
            value={departmentId ? String(departmentId) : ""}
            onValueChange={setDepartmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الإدارة" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department: any) => (
                <SelectItem key={department.id} value={String(department.id)}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            الترتيب
          </label>
          <Input
            type="number"
            min={0}
            value={order}
            onChange={e => setOrder(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-foreground sm:col-span-2">
          <Input
            type="checkbox"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            className="size-4"
          />
          نشر المسار للمتدربين
        </label>
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

function PathCourses({
  pathId,
  departmentId,
  courses,
}: {
  pathId: number;
  departmentId: number;
  courses: any[];
}) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.coursePaths.withCourses.useQuery({ pathId });
  const addMutation = trpc.coursePaths.addCourse.useMutation({
    onSuccess: async () => {
      await utils.coursePaths.withCourses.invalidate({ pathId });
      setSelectedCourse("");
      toast.success("تمت إضافة الدورة للمسار");
    },
  });
  const removeMutation = trpc.coursePaths.removeCourse.useMutation({
    onSuccess: () => {
      utils.coursePaths.withCourses.invalidate({ pathId });
      toast.success("تم حذف الدورة من المسار");
    },
  });

  const linkedCourses = (data?.courses ?? []).filter(
    (course: any) => course.courseDepartmentId === departmentId
  );
  const linkedIds = new Set(linkedCourses.map((course: any) => course.courseId));
  const departmentCourses = courses.filter(
    course => course.departmentId === departmentId
  );
  const availableCourses = departmentCourses.filter(
    course => !linkedIds.has(course.id)
  );

  return (
    <div className="border-t border-border bg-muted/20 px-4 py-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h5 className="text-foreground">دورات المسار ({linkedCourses.length})</h5>
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="min-w-52 bg-card">
              <SelectValue placeholder="اختر دورة لإضافتها" />
            </SelectTrigger>
            <SelectContent>
              {availableCourses.map(course => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            disabled={!selectedCourse || addMutation.isPending}
            onClick={() =>
              addMutation.mutate({
                pathId,
                courseId: Number(selectedCourse),
                order: linkedCourses.length,
              })
            }
          >
            إضافة
          </Button>
        </div>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">جاري تحميل الدورات...</p>
      ) : linkedCourses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          لم تتم إضافة دورات من هذه الإدارة لهذا المسار.
        </p>
      ) : (
        <div className="space-y-2">
          {linkedCourses.map((course: any) => (
            <div
              key={course.courseId}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm text-foreground">
                {course.courseTitle}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`حذف ${course.courseTitle}`}
                disabled={removeMutation.isPending}
                onClick={() =>
                  removeMutation.mutate({ pathId, courseId: course.courseId })
                }
                className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTracks() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data: paths, isLoading } = trpc.coursePaths.listAll.useQuery();
  const { data: departments } = trpc.departments.list.useQuery();
  const { data: courses } = trpc.courses.listAll.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.coursePaths.create.useMutation({
    onSuccess: () => {
      utils.coursePaths.listAll.invalidate();
      setShowForm(false);
      toast.success("تم إضافة المسار");
    },
  });
  const updateMutation = trpc.coursePaths.update.useMutation({
    onSuccess: () => {
      utils.coursePaths.listAll.invalidate();
      setEditingId(null);
      toast.success("تم تحديث المسار");
    },
  });
  const deleteMutation = trpc.coursePaths.delete.useMutation({
    onSuccess: () => {
      utils.coursePaths.listAll.invalidate();
      toast.success("تم حذف المسار");
    },
  });

  return (
    <PortalLayout role="admin" title="إدارة المسارات">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h6 className="text-muted-foreground">{paths?.length ?? 0} مسار</h6>
          <Button
            variant="ghost"
            onClick={() => setShowForm(value => !value)}
            className="gap-2 font-bold"
          >
            <Plus className="size-4" />
            إضافة مسار
          </Button>
        </div>

        {showForm && (
          <PathForm
            departments={departments ?? []}
            onSave={(data: any) => createMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(item => (
              <div key={item} className="card h-20 animate-pulse" />
            ))}
          </div>
        ) : paths?.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <GraduationCap className="mb-4 size-12 text-muted-foreground/40" />
            <h3 className="mb-2 text-foreground">لا توجد مسارات</h3>
            <p className="text-sm text-muted-foreground">
              أضف مسارًا ثم اربط به الدورات ليظهر للمتدربين.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paths?.map(path =>
              editingId === path.id ? (
                <PathForm
                  key={path.id}
                  initial={path}
                  departments={departments ?? []}
                  onSave={(data: any) =>
                    updateMutation.mutate({ id: path.id, ...data })
                  }
                  onCancel={() => setEditingId(null)}
                  isLoading={updateMutation.isPending}
                />
              ) : (
                <div key={path.id} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <GraduationCap className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-foreground">{path.name}</h4>
                        <Badge variant={path.isPublished ? "success" : "secondary"}>
                          {path.isPublished ? "منشور" : "مسودة"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {departments?.find((item: any) => item.id === path.departmentId)?.name ??
                          "بدون إدارة"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(value => (value === path.id ? null : path.id))
                        }
                        className="font-semibold"
                      >
                        {expandedId === path.id ? "إخفاء الدورات" : "إدارة الدورات"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(path.id)}
                        aria-label={`تعديل ${path.name}`}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate({ id: path.id })}
                        aria-label={`حذف ${path.name}`}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {expandedId === path.id && (
                    <PathCourses
                      pathId={path.id}
                      departmentId={path.departmentId}
                      courses={courses ?? []}
                    />
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
