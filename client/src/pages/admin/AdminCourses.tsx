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
  BookOpen,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  FileText,
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
          <Input
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
          <Textarea
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
          <Select
            value={departmentId ? String(departmentId) : "__all__"}
            onValueChange={v => setDepartmentId(v === "__all__" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- اختر الإدارة --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">-- اختر الإدارة --</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            المستوى
          </label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="المستوى" />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map(l => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            المدة (بالدقائق)
          </label>
          <Input
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
          <Input
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
          <Input
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://..."
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Input
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
<Button type="submit" variant="default" disabled={isLoading} 
className="font-bold">
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
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [fileType, setFileType] = useState(initial?.fileType ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentKind, setContentKind] = useState<"video" | "file">(
    initial?.fileUrl ? "file" : "video"
  );
  const [videoType, setVideoType] = useState(initial?.videoType ?? "youtube");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let uploadedFileUrl = fileUrl || null;
      let uploadedFileType = fileType || null;
      if (contentKind === "video") {
        if (!videoUrl.trim()) {
          toast.error("أدخل رابط الفيديو الخارجي");
          return;
        }
        try {
          const url = new URL(videoUrl.trim());
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error();
          }
        } catch {
          toast.error("أدخل رابط فيديو خارجي صالحًا");
          return;
        }
      }
      if (contentKind === "file" && selectedFile) {
          if (selectedFile.size === 0) {
            toast.error("الملف المحدد حجمه صفر، اختر ملفًا صالحًا");
            return;
          }
        const formData = new FormData();
        formData.append("file", selectedFile);
        const response = await fetch("/api/admin/course-lessons/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.message || "فشل رفع الملف");
        }
        const result = await response.json();
        uploadedFileUrl = result.fileUrl;
        uploadedFileType = result.fileType;
      }
      onSave({
        courseId,
        title,
        description: description || undefined,
        videoUrl: contentKind === "video" ? videoUrl || null : null,
        videoType: contentKind === "video" ? videoType : undefined,
        fileUrl: contentKind === "file" ? uploadedFileUrl : null,
        fileType: contentKind === "file" ? uploadedFileType : null,
        duration: contentKind === "video" && duration ? Number(duration) : undefined,
        order: Number(order),
        isPublished,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل رفع الملف");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-muted/50 border border-border rounded-xl p-4 space-y-3 mt-3"
    >
      <h4 className="text-foreground">
        {initial ? "تعديل الدرس" : "إضافة درس جديد"}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="عنوان الدرس *"
          />
        </div>
        <div>
          <div className="sm:col-span-2">
            <Select
              value={contentKind}
              onValueChange={value => setContentKind(value as "video" | "file")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="نوع المحتوى" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">فيديو</SelectItem>
                <SelectItem value="file">ملف PDF / Word / ZIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {contentKind === "file" && fileUrl ? (
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-sm">
              <FileText className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate text-foreground">
                {fileUrl.split("/").pop() ?? fileUrl}
              </span>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="text-primary hover:underline text-xs"
              >
                تحميل/فتح
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFileUrl("");
                  setFileType("");
                  setSelectedFile(null);
                }}
                className="text-destructive hover:bg-destructive/10"
                title="حذف الملف"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ) : contentKind === "file" ? (
            <input
              type="file"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setFileUrl("");
                  setFileType(file.name.split(".").pop()?.toLowerCase() ?? "");
                }
              }}
              accept=".pdf,.doc,.docx,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          ) : (
            <Input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="رابط الفيديو الخارجي (YouTube أو Vimeo)"
            />
          )}
        </div>
        {contentKind === "video" && <div>
          <Select value={videoType} onValueChange={setVideoType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="نوع الفيديو" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="direct">رابط فيديو خارجي</SelectItem>
              <SelectItem value="embed">Embed</SelectItem>
            </SelectContent>
          </Select>
        </div>}
        {contentKind === "video" && <div>
          <Input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            min={0}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="المدة (ثانية)"
          />
        </div>}
        <div>
          <Input
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
          variant="default"
          disabled={isLoading}
          size="sm"
          className="font-bold"
        >
          {isLoading ? "جاري الحفظ..." : "حفظ"}
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
        <Button variant="ghost" 
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-foreground">{course.title}</h4>
            <Badge variant={course.isPublished ? "success" : "secondary"}>
              {course.isPublished ? "منشور" : "مسودة"}
            </Badge>
          </div>
          {course.description && (
            <h6 className="text-muted-foreground truncate mt-0.5">
              {course.description}
            </h6>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" 
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" 
            onClick={() => deleteMutation.mutate({ id: course.id })}
            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          <div className="flex items-center justify-between mt-3 mb-2">
            <h6 className="text-muted-foreground uppercase">
              الدروس ({lessons?.length ?? 0})
            </h6>
            <Button variant="ghost" size="sm" 
              onClick={() => setAddingLesson(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
            >
              <Plus className="h-3 w-3" />
              إضافة درس
            </Button>
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
                    {lesson.fileUrl ? (
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <Video className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {lesson.order}. {lesson.title}
                    </p>
                    {lesson.videoUrl && (
                      <a
                        href={lesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-muted-foreground truncate flex items-center gap-1 hover:underline"
                      >
                        <FileText className="h-3 w-3" />
                        {lesson.videoUrl.split("/").pop() ?? lesson.videoUrl}
                      </a>
                    )}
                    {lesson.fileUrl && (
                      <a
                        href={lesson.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-muted-foreground truncate flex items-center gap-1 hover:underline"
                      >
                        <FileText className="h-3 w-3" />
                        {lesson.fileUrl.split("/").pop() ?? lesson.fileUrl}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm"
                      onClick={() => setEditingLesson(lesson.id)}
                      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" 
                      onClick={() => deleteLessonMutation.mutate({ id: lesson.id })}
                      className="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
          <h6 className="text-muted-foreground">
            {courses?.length ?? 0} دورة
          </h6>
          <Button variant="ghost" 
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
            <h6 className="text-muted-foreground">
              ابدأ بإضافة أول دورة تدريبية
            </h6>
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
