import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";
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

export default function AdminSuggestions() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const { data: suggestions, isLoading } = trpc.suggestions.all.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.suggestions.update.useMutation({
    onSuccess: () => {
      utils.suggestions.all.invalidate();
      setEditingId(null);
      toast.success("تم تحديث الاقتراح");
    },
  });

  const filtered =
    filterStatus === "all"
      ? suggestions
      : suggestions?.filter((s: any) => s.status === filterStatus);

  return (
    <PortalLayout role="admin" title="الاقتراحات">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4">
          {["all", "new", "reviewed", "implemented", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                filterStatus === s
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s === "all" ? "الكل" : statusLabels[s]?.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-20 animate-pulse" />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <Lightbulb className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد اقتراحات</h3>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            {filtered?.map((sug: any) => {
              const status = statusLabels[sug.status ?? "new"];
              return (
                <div key={sug.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h4 className="text-foreground">{sug.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sug.user?.name ?? "مجهول"} •{" "}
                        {new Date(sug.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                    <Badge variant={status.variant} className="flex-shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                    {sug.content}
                  </p>

                  {editingId === sug.id ? (
                    <div className="flex gap-2 mt-2">
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                        className="flex-1 bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {Object.entries(statusLabels).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateMutation.mutate({
                            id: sug.id,
                            status: newStatus as any,
                            adminNotes: undefined,
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="font-bold"
                      >
                        {updateMutation.isPending ? "..." : "حفظ"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(sug.id);
                        setNewStatus(sug.status ?? "new");
                      }}
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      تحديث الحالة
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
