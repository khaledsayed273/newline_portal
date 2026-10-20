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
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusLabels: Record<
  string,
  { label: string; variant: "warning" | "success" | "destructive" | "info" }
> = {
  pending: { label: "قيد المراجعة", variant: "warning" },
  approved: { label: "موافق عليه", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
  completed: { label: "مكتمل", variant: "info" },
};

export default function AdminTrainingRequests() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: requests, isLoading } = trpc.trainingRequests.all.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.trainingRequests.update.useMutation({
    onSuccess: () => {
      utils.trainingRequests.all.invalidate();
      setEditingId(null);
      toast.success("تم تحديث الطلب");
    },
  });

  const filtered =
    filterStatus === "all"
      ? requests
      : requests?.filter((r: any) => r.status === filterStatus);

  return (
    <PortalLayout role="admin" title="طلبات التدريب">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4">
          {["all", "pending", "approved", "rejected", "completed"].map(s => (
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
            <Send className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد طلبات</h3>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            {filtered?.map((req: any) => {
              const status = statusLabels[req.status ?? "pending"];
              return (
                <div key={req.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h4 className="text-foreground">{req.title}</h4>
                      <h6 className="text-muted-foreground mt-0.5">
                        المتدرب: {req.user?.name ?? "مجهول"} •{" "}
                        {new Date(req.createdAt).toLocaleDateString("ar-SA")}
                      </h6>
                    </div>
                    <Badge variant={status.variant} className="flex-shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  {req.description && (
                    <h6 className="text-muted-foreground mb-3">
                      {req.description}
                    </h6>
                  )}

                  {editingId === req.id ? (
                    <div className="space-y-3 mt-3 pt-3 border-t border-border">
                      <Select
                        value={newStatus || "__none__"}
                        onValueChange={v => setNewStatus(v === "__none__" ? "" : v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-- اختر الحالة --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">-- اختر الحالة --</SelectItem>
                          {Object.entries(statusLabels).map(([v, l]) => (
                            <SelectItem key={v} value={v}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        placeholder="ملاحظات للمتدرب (اختياري)"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          variant="default"
                          size="sm"
                          onClick={() =>
                            updateMutation.mutate({
                              id: req.id,
                              status: newStatus || req.status,
                              adminNotes: adminNotes || undefined,
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
                        setEditingId(req.id);
                        setNewStatus(req.status ?? "pending");
                        setAdminNotes(req.adminNotes ?? "");
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
