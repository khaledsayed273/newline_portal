import { X, Download } from "lucide-react";
import { useEffect } from "react";

export function FileViewerModal({
  open,
  onClose,
  fileUrl,
  fileType,
  title,
}: {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  fileType?: string | null;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isPdf = (fileType || "").toLowerCase() === "pdf";
  const absoluteUrl =
    typeof window !== "undefined" ? window.location.origin + fileUrl : fileUrl;
  const viewerSrc = isPdf
    ? fileUrl
    : `https://docs.google.com/viewer?url=${encodeURIComponent(
        absoluteUrl
      )}&embedded=true`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[85vh] bg-card rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-foreground truncate">{title || "عرض الملف"}</h3>
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Download className="h-4 w-4" />
              تحميل
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-muted">
          <iframe
            src={viewerSrc}
            title={title || "viewer"}
            className="w-full h-full border-0"
          />
        </div>
        {!isPdf && (
          <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
            معاينة ملفات Office تعتمد على خدمة Google Docs Viewer (تتطلب URL عام في
            الإنتاج). إذا لم تظهر، استخدم "تحميل".
          </div>
        )}
      </div>
    </div>
  );
}
