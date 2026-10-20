import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusLabels: Record<
  string,
  { label: string; variant: "info" | "warning" | "success" | "secondary" }
> = {
  open: { label: "مفتوح", variant: "info" },
  in_progress: { label: "قيد المعالجة", variant: "warning" },
  resolved: { label: "تم الحل", variant: "success" },
  closed: { label: "مغلق", variant: "secondary" },
};

const priorityLabels: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  low: { label: "منخفض", variant: "success" },
  medium: { label: "متوسط", variant: "warning" },
  high: { label: "عالي", variant: "destructive" },
};

export default function AdminIncidents() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [resolution, setResolution] = useState("");

  const { data: incidents, isLoading } = trpc.incidents.all.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.incidents.update.useMutation({
    onSuccess: () => {
      utils.incidents.all.invalidate();
      setEditingId(null);
      toast.success("تم تحديث التعثر");
    },
  });

  const filtered =
    filterStatus === "all"
      ? incidents
      : incidents?.filter((r: any) => r.status === filterStatus);

  return (
    <PortalLayout role="admin" title="سجلات التعثرات">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4">
          {["all", "open", "in_progress", "resolved", "closed"].map(s => (
            <Button variant="ghost" size="sm" 
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
            </Button>
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
            <AlertTriangle className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد تعثرات</h3>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            {filtered?.map((inc: any) => {
              const status = statusLabels[inc.status ?? "open"];
              const priority = priorityLabels[inc.priority ?? "medium"];
              return (
                <div key={inc.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h4 className="text-foreground">{inc.title}</h4>
                      <h6 className="text-muted-foreground mt-0.5">
                        المتدرب: {inc.user?.name ?? "مجهول"} •{" "}
                        {new Date(inc.createdAt).toLocaleDateString("ar-SA")}
                      </h6>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                  {inc.description && (
                    <h6 className="text-muted-foreground mb-3">
                      {inc.description}
                    </h6>
                  )}

                  {editingId === inc.id ? (
                    <div className="space-y-3 mt-3 pt-3 border-t border-border">
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([v, l]) => (
                            <SelectItem key={v} value={v}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={resolution}
                        onChange={e => setResolution(e.target.value)}
                        rows={2}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        placeholder="ملاحظات الحل / الإجراء المتخذ (اختياري)"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          variant="default"
                          size="sm"
                          onClick={() =>
                            updateMutation.mutate({
                              id: inc.id,
                              status: newStatus as any,
                              adminNotes: resolution || undefined,
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
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" 
                      onClick={() => {
                        setEditingId(inc.id);
                        setNewStatus(inc.status ?? "open");
                        setResolution(inc.resolution ?? "");
                      }}
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      تحديث الحالة
                    </Button>
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
