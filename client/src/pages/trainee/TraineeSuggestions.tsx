import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Lightbulb, Plus, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusLabels: Record<
  string,
  { label: string; variant: "info" | "warning" | "success" | "destructive" }
> = {
  new: { label: "جديد", variant: "info" },
  reviewed: { label: "تمت المراجعة", variant: "warning" },
  implemented: { label: "تم التطبيق", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

export default function TraineeSuggestions() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  const { data: suggestions } = trpc.suggestions.mine.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.suggestions.create.useMutation({
    onSuccess: () => {
      utils.suggestions.mine.invalidate();
      setShowForm(false);
      setTitle("");
      setContent("");
      setCategory("");
      toast.success("شكراً! تم إرسال اقتراحك بنجاح");
    },
  });

  return (
    <PortalLayout role="trainee" title="شاركنا أفكارك">
      <div className="space-y-6">
        <div className="bg-card border border-primary/20 rounded-2xl p-5 bg-primary/10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <h3 className="text-base font-semibold md:text-lg text-foreground">
              اقتراحاتك تُحدث الفرق
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            شاركنا أفكارك لتطوير بيئة العمل والتدريب في نيولاين
          </p>
        </div>

        <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 font-bold"
          >
            <Plus className="h-4 w-4" />
            اقتراح جديد
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={e => {
              e.preventDefault();
              createMutation.mutate({ title, content, category });
            }}
            className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4"
          >
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                عنوان الاقتراح *
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="عنوان مختصر لاقتراحك"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                تفاصيل الاقتراح *
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                required
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="اشرح اقتراحك بالتفصيل..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                الفئة
              </label>
              <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="مثال: تدريب، بيئة عمل، تقنية..."
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="font-bold gap-2"
              >
                <Send className="h-4 w-4" />
                {createMutation.isPending
                  ? "جاري الإرسال..."
                  : "إرسال الاقتراح"}
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

        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
          {suggestions?.map(sug => {
            const status = statusLabels[sug.status ?? "new"];
            return (
              <div key={sug.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      {sug.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {sug.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sug.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <Badge variant={status.variant} className="flex-shrink-0">
                    {status.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PortalLayout>
  );
}
