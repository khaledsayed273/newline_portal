import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BriefFileForm({
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
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        try {
          let uploadedFileUrl = fileUrl || undefined;
          let uploadedFileType = fileType || undefined;
          if (selectedFile) {
            if (selectedFile.size === 0) {
              toast.error("الملف المحدد حجمه صفر، اختر ملفًا صالحًا");
              return;
            }
            setUploading(true);
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
            title,
            description: description || undefined,
            departmentId: departmentId ? Number(departmentId) : undefined,
            fileUrl: uploadedFileUrl,
            fileType: uploadedFileType,
            isPublished,
            order: Number(order),
          });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "فشل رفع الملف");
        } finally {
          setUploading(false);
        }
      }}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-foreground">
        {initial ? "تعديل الدورة السريعة" : "إضافة دورة سريعة جديدة"}
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
            placeholder="اسم الدورة المختصرة"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            الوصف
          </label>
          <Textarea
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
          <Select
            value={departmentId ? String(departmentId) : "__all__"}
            onValueChange={v => setDepartmentId(v === "__all__" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- عام --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">-- عام --</SelectItem>
              {departments.map((d: any) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {initial?.fileUrl && !selectedFile && (
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              الملف الحالي
            </label>
            <a
              href={initial.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              {initial.fileUrl.split("/").pop() ?? initial.fileUrl}
            </a>
          </div>
        )}
        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            رفع ملف (PDF / Word / ZIP)
          </label>
          <input
            type="file"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                setSelectedFile(f);
                setFileType(f.name.split(".").pop()?.toLowerCase() ?? "");
                setFileUrl("");
              }
            }}
            accept=".pdf,.doc,.docx,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {selectedFile && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span>{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                }}
                className="text-destructive hover:underline"
              >
                حذف
              </button>
            </div>
          )}
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
        <div className="flex items-center gap-3">
          <Input
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
            نشر الدورة
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading || uploading} className="font-bold">
          {uploading
            ? "جاري الرفع..."
            : isLoading
            ? "جاري الحفظ..."
            : initial
            ? "حفظ"
            : "إضافة"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
