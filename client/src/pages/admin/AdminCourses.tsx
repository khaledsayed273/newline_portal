import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const levelOptions = [
  { value: "beginner", label: "مبتدئ" },
  { value: "intermediate", label: "متوسط" },
  { value: "advanced", label: "متقدم" },
];

function CourseForm({
  initial,
  departments,
  onSave,
  onCancel,
  isLoading,
}: {
  initial?: any;
  departments: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [level, setLevel] = useState(initial?.level ?? "beginner");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [order, setOrder] = useState(initial?.order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      level,
      duration: duration ? Number(duration) : undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      isPublished,
      order: Number(order),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-foreground">
        {initial ? "تعديل الدورة" : "إضافة دورة جديدة"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            اسم الدورة *
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="اسم الدورة التدريبية"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            الوصف
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="وصف مختصر للدورة"
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
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            المستوى
          </label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {levelOptions.map(l => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            المدة (بالدقائق)
          </label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            min={0}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="مثال: 120"
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
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            رابط الصورة المصغرة
          </label>
          <input
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://..."
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <label
            htmlFor="published"
            className="text-sm font-semibold text-foreground cursor-pointer"
          >
            نشر الدورة (ظاهرة للمتدربين)
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="font-bold">
          {isLoading
            ? "جاري الحفظ..."
            : initial
              ? "حفظ التعديلات"
              : "إضافة الدورة"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

function LessonForm({
  courseId,
  initial,
  onSave,
  onCancel,
  isLoading,
}: {
  courseId: number;
  initial?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [videoType, setVideoType] = useState(initial?.videoType ?? "youtube");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave({
          courseId,
          title,
          description: description || undefined,
          videoUrl: videoUrl || undefined,
          videoType,
          duration: duration ? Number(duration) : undefined,
          order: Number(order),
          isPublished,
        });
      }}
      className="bg-muted/50 border border-border rounded-xl p-4 space-y-3 mt-3"
    >
      <h4 className="text-foreground">
        {initial ? "تعديل الدرس" : "إضافة درس جديد"}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="عنوان الدرس *"
          />
        </div>
        <div>
          <input
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="رابط الفيديو (YouTube أو مباشر)"
          />
        </div>
        <div>
          <select
            value={videoType}
            onChange={e => setVideoType(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="direct">رابط مباشر</option>
            <option value="embed">Embed</option>
          </select>
        </div>
        <div>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            min={0}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="المدة (ثانية)"
          />
        </div>
        <div>
          <input
            type="number"
            value={order}
            onChange={e => setOrder(e.target.value)}
            min={0}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="الترتيب"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          size="sm"
          className="font-bold"
        >
          {isLoading ? "..." : "حفظ"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

function CourseRow({
  course,
  departments,
}: {
  course: any;
  departments: any[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: lessons } = trpc.lessons.allByCourse.useQuery(
    { courseId: course.id },
    { enabled: expanded }
  );

  const updateMutation = trpc.courses.update.useMutation({
    onSuccess: () => {
      utils.courses.listAll.invalidate();
      setEditing(false);
      toast.success("تم تحديث الدورة");
    },
  });
  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: () => {
      utils.courses.listAll.invalidate();
      toast.success("تم حذف الدورة");
    },
  });
  const createLessonMutation = trpc.lessons.create.useMutation({
    onSuccess: () => {
      utils.lessons.allByCourse.invalidate({ courseId: course.id });
      setAddingLesson(false);
      toast.success("تم إضافة الدرس");
    },
  });
  const updateLessonMutation = trpc.lessons.update.useMutation({
    onSuccess: () => {
      utils.lessons.allByCourse.invalidate({ courseId: course.id });
      setEditingLesson(null);
      toast.success("تم تحديث الدرس");
    },
  });
  const deleteLessonMutation = trpc.lessons.delete.useMutation({
    onSuccess: () => {
      utils.lessons.allByCourse.invalidate({ courseId: course.id });
      toast.success("تم حذف الدرس");
    },
  });

  if (editing) {
    return (
      <CourseForm
        initial={course}
        departments={departments}
        onSave={data => updateMutation.mutate({ id: course.id, ...data })}
        onCancel={() => setEditing(false)}
        isLoading={updateMutation.isPending}
      />
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-foreground">{course.title}</h4>
            <Badge variant={course.isPublished ? "success" : "secondary"}>
              {course.isPublished ? "منشور" : "مسودة"}
            </Badge>
          </div>
          {course.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {course.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm("هل تريد حذف هذه الدورة؟"))
                deleteMutation.mutate({ id: course.id });
            }}
            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          <div className="flex items-center justify-between mt-3 mb-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              الدروس ({lessons?.length ?? 0})
            </h5>
            <button
              onClick={() => setAddingLesson(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
            >
              <Plus className="h-3 w-3" />
              إضافة درس
            </button>
          </div>

          {addingLesson && (
            <LessonForm
              courseId={course.id}
              onSave={data => createLessonMutation.mutate(data)}
              onCancel={() => setAddingLesson(false)}
              isLoading={createLessonMutation.isPending}
            />
          )}

          <div className="space-y-2 mt-2">
            {lessons?.map(lesson =>
              editingLesson === lesson.id ? (
                <LessonForm
                  key={lesson.id}
                  courseId={course.id}
                  initial={lesson}
                  onSave={data =>
                    updateLessonMutation.mutate({ id: lesson.id, ...data })
                  }
                  onCancel={() => setEditingLesson(null)}
                  isLoading={updateLessonMutation.isPending}
                />
              ) : (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <Video className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {lesson.order}. {lesson.title}
                    </p>
                    {lesson.videoUrl && (
                      <p className="text-xs text-muted-foreground truncate">
                        {lesson.videoUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingLesson(lesson.id)}
                      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("حذف الدرس؟"))
                          deleteLessonMutation.mutate({ id: lesson.id });
                      }}
                      className="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCourses() {
  const [showForm, setShowForm] = useState(false);

  const { data: courses, isLoading } = trpc.courses.listAll.useQuery();
  const { data: departments } = trpc.departments.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.courses.create.useMutation({
    onSuccess: () => {
      utils.courses.listAll.invalidate();
      setShowForm(false);
      toast.success("تم إضافة الدورة");
    },
  });

  return (
    <PortalLayout role="admin" title="إدارة الدورات">
      <div className="space-y-5">
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <p className="text-xs leading-6 md:text-sm text-muted-foreground">
            {courses?.length ?? 0} دورة
          </p>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 font-bold"
          >
            <Plus className="h-4 w-4" />
            إضافة دورة
          </Button>
        </div>

        {showForm && (
          <CourseForm
            departments={departments ?? []}
            onSave={data => createMutation.mutate(data)}
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
        ) : courses?.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد دورات</h3>
            <p className="text-xs leading-6 md:text-sm text-muted-foreground">
              ابدأ بإضافة أول دورة تدريبية
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            {courses?.map(course => (
              <CourseRow
                key={course.id}
                course={course}
                departments={departments ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
