import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Send } from "lucide-react";
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

export default function TraineeTrainingRequest() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: requests, isLoading } = trpc.trainingRequests.mine.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.trainingRequests.create.useMutation({
    onSuccess: () => {
      utils.trainingRequests.mine.invalidate();
      setShowForm(false);
      setTitle("");
      setDescription("");
      toast.success("تم إرسال طلب التدريب بنجاح");
    },
  });

  return (
    <PortalLayout role="trainee" title="طلب تدريب">
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <p className="text-muted-foreground">
            قدّم طلب تدريب جديد وتابع حالة طلباتك
          </p>
          <Button variant="ghost" 
            onClick={() => setShowForm(!showForm)}
            className="gap-2 font-bold"
          >
            <Plus className="h-4 w-4" />
            طلب جديد
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={e => {
              e.preventDefault();
              createMutation.mutate({ title, description });
            }}
            className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4"
          >
            <h3 className="text-foreground">
              طلب تدريب جديد
            </h3>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                موضوع التدريب *
              </label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="ما الموضوع الذي تريد التدريب عليه؟"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                التفاصيل
              </label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="اشرح سبب الحاجة لهذا التدريب..."
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" 
                type="submit"
                disabled={createMutation.isPending}
                className="font-bold gap-2"
              >
                <Send className="h-4 w-4" />
                {createMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
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

        {!isLoading && requests?.length === 0 && !showForm ? (
          <div className="flex flex-col items-center text-center py-16">
            <Send className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">
              لا توجد طلبات
            </h3>
            <p className="text-muted-foreground">
              لم تقدّم أي طلبات تدريب بعد
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            {requests?.map(req => {
              const status = statusLabels[req.status ?? "pending"];
              return (
                <div key={req.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h5 className="text-foreground mb-1">
                        {req.title}
                      </h5>
                      {req.description && (
                        <h6 className="text-muted-foreground mb-2">
                          {req.description}
                        </h6>
                      )}
                      <h6 className="text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString("ar-SA")}
                      </h6>
                    </div>
                    <Badge variant={status.variant} className="flex-shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  {req.adminNotes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <h6 className="text-muted-foreground">
                        <span className="font-semibold">ملاحظة المدير: </span>
                        {req.adminNotes}
                      </h6>
                    </div>
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
