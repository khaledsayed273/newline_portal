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
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Loader2,
  MessageCircle,
  Plus,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const consultationStatusLabels: Record<string, { label: string; variant: any }> = {
  new: { label: "جديد", variant: "info" },
  reviewed: { label: "تمت المراجعة", variant: "warning" },
  replied: { label: "تم الرد", variant: "success" },
  closed: { label: "مغلق", variant: "secondary" },
};

const requestStatusLabels: Record<string, { label: string; variant: any }> = {
  pending: { label: "قيد المراجعة", variant: "warning" },
  approved: { label: "موافق عليه", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
  completed: { label: "مكتمل", variant: "info" },
};

const suggestionStatusLabels: Record<string, { label: string; variant: any }> = {
  new: { label: "جديد", variant: "info" },
  reviewed: { label: "تمت المراجعة", variant: "warning" },
  implemented: { label: "تم التطبيق", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
};

export default function ServiceManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeTab, setActiveTab] = useState<"consultations" | "requests" | "suggestions">(
    "consultations"
  );

  // ---------- Consultations ----------
  const [cSubject, setCSubject] = useState("");
  const [cMessage, setCMessage] = useState("");
  const [cUserName, setCUserName] = useState(user?.name ?? "");
  const [cSent, setCSent] = useState(false);

  const { data: myConsultations } = trpc.consultations.mine.useQuery(undefined, {
    enabled: !isAdmin,
  });
  const { data: allConsultations, isLoading: cLoading } =
    trpc.consultations.all.useQuery(undefined, { enabled: isAdmin });
  const utils = trpc.useUtils();

  const createConsultationMutation = trpc.consultations.create.useMutation({
    onSuccess: () => {
      setCSent(true);
      utils.consultations.mine.invalidate();
      utils.consultations.all.invalidate();
      toast.success("تم إرسال استشارتك بنجاح");
    },
    onError: (err: any) => toast.error(err?.message || "حدث خطأ أثناء الإرسال"),
  });

  const updateConsultationMutation = trpc.consultations.update.useMutation({
    onSuccess: () => {
      utils.consultations.all.invalidate();
      toast.success("تم تحديث الاستشارة");
    },
    onError: (err: any) => toast.error(err?.message || "فشل التحديث"),
  });

  // ---------- Training requests ----------
  const [showReqForm, setShowReqForm] = useState(false);
  const [reqTitle, setReqTitle] = useState("");
  const [reqDescription, setReqDescription] = useState("");

  const { data: myRequests } = trpc.trainingRequests.mine.useQuery(undefined, {
    enabled: !isAdmin,
  });
  const { data: allRequests, isLoading: rLoading } =
    trpc.trainingRequests.all.useQuery(undefined, { enabled: isAdmin });

  const createRequestMutation = trpc.trainingRequests.create.useMutation({
    onSuccess: () => {
      utils.trainingRequests.mine.invalidate();
      utils.trainingRequests.all.invalidate();
      setShowReqForm(false);
      setReqTitle("");
      setReqDescription("");
      toast.success("تم إرسال طلب التدريب بنجاح");
    },
    onError: (err: any) => toast.error(err?.message || "فشل الإرسال"),
  });

  const updateRequestMutation = trpc.trainingRequests.update.useMutation({
    onSuccess: () => {
      utils.trainingRequests.all.invalidate();
      toast.success("تم تحديث الطلب");
    },
    onError: (err: any) => toast.error(err?.message || "فشل التحديث"),
  });

  // ---------- Suggestions ----------
  const [showSugForm, setShowSugForm] = useState(false);
  const [sugTitle, setSugTitle] = useState("");
  const [sugContent, setSugContent] = useState("");
  const [sugCategory, setSugCategory] = useState("");

  const { data: mySuggestions } = trpc.suggestions.mine.useQuery(undefined, {
    enabled: !isAdmin,
  });
  const { data: allSuggestions, isLoading: sLoading } =
    trpc.suggestions.all.useQuery(undefined, { enabled: isAdmin });

  const createSuggestionMutation = trpc.suggestions.create.useMutation({
    onSuccess: () => {
      utils.suggestions.mine.invalidate();
      utils.suggestions.all.invalidate();
      setShowSugForm(false);
      setSugTitle("");
      setSugContent("");
      setSugCategory("");
      toast.success("تم إرسال اقتراحك بنجاح");
    },
    onError: (err: any) => toast.error(err?.message || "فشل الإرسال"),
  });

  const updateSuggestionMutation = trpc.suggestions.update.useMutation({
    onSuccess: () => {
      utils.suggestions.all.invalidate();
      toast.success("تم تحديث الاقتراح");
    },
    onError: (err: any) => toast.error(err?.message || "فشل التحديث"),
  });

  // admin editing state
  const [editingConsultationId, setEditingConsultationId] = useState<number | null>(null);
  const [consultationStatus, setConsultationStatus] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");

  const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
  const [requestStatus, setRequestStatus] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  const [editingSuggestionId, setEditingSuggestionId] = useState<number | null>(null);
  const [suggestionStatus, setSuggestionStatus] = useState("");

  const tabs = [
    { key: "consultations", label: "الاستشارات", icon: MessageCircle },
    { key: "requests", label: "الطلبات", icon: Send },
    { key: "suggestions", label: "الاقتراحات", icon: Lightbulb },
  ] as const;

  return (
    <PortalLayout role={isAdmin ? "admin" : "trainee"} title="إدارة الخدمات">
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <Button
                key={t.key}
                variant="ghost"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 gap-2",
                  activeTab === t.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Button>
            );
          })}
        </div>

        {/* ===== Consultations ===== */}
        {activeTab === "consultations" && (
          <div className="space-y-5">
            {!isAdmin ? (
              <>
                <div className="rounded-2xl p-6 bg-warning/10 border border-warning/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/15">
                      <MessageCircle size={20} className="text-warning-emphasis" />
                    </div>
                    <div>
                      <h2 className="text-foreground">استشاراتك التدريبية</h2>
                      <h6 className="text-muted-foreground">
                        أرسل استشارتك وسيتم الرد عليها في أقرب وقت
                      </h6>
                    </div>
                  </div>
                </div>

                {cSent ? (
                  <div className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center bg-success/10 border border-success/30">
                    <h3 className="text-foreground mb-2">تم إرسال استفسارك بنجاح!</h3>
                    <Button
                      onClick={() => {
                        setCSent(false);
                        setCSubject("");
                        setCMessage("");
                      }}
                      className="mt-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                    >
                      إرسال استشارة أخرى
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!cSubject.trim() || !cMessage.trim()) return;
                      createConsultationMutation.mutate({
                        subject: cSubject.trim(),
                        message: cMessage.trim(),
                        userName: cUserName.trim() || user?.name || "متدرب",
                      });
                    }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-foreground mb-2">الاسم</label>
                      <Input
                        value={cUserName}
                        onChange={e => setCUserName(e.target.value)}
                        placeholder={user?.name ?? "أدخل اسمك"}
                      />
                    </div>
                    <div>
                      <label className="block text-foreground mb-2">موضوع الاستشارة *</label>
                      <Input
                        value={cSubject}
                        onChange={e => setCSubject(e.target.value)}
                        required
                        placeholder="مثال: استفسار عن برنامج تدريبي..."
                      />
                    </div>
                    <div>
                      <label className="block text-foreground mb-2">تفاصيل الاستشارة *</label>
                      <Textarea
                        value={cMessage}
                        onChange={e => setCMessage(e.target.value)}
                        required
                        rows={6}
                        placeholder="اشرح استشارتك بالتفصيل..."
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={
                        createConsultationMutation.isPending ||
                        !cSubject.trim() ||
                        cMessage.trim().length < 10
                      }
                      className="w-full font-bold gap-2"
                    >
                      {createConsultationMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          إرسال الاستشارة
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* my consultations list */}
                <div className="space-y-3 mt-6">
                  {(myConsultations ?? []).map((c: any) => {
                    const st = consultationStatusLabels[c.status ?? "new"];
                    return (
                      <div key={c.id} className="card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="text-foreground mb-1">{c.subject}</h5>
                            <h6 className="text-muted-foreground mb-2 line-clamp-2">
                              {c.message}
                            </h6>
                            <h6 className="text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                            </h6>
                          </div>
                          <Badge variant={st.variant} className="flex-shrink-0">
                            {st.label}
                          </Badge>
                        </div>
                        {c.adminNotes && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <h6 className="text-muted-foreground">
                              <span className="font-semibold">ملاحظة المدير: </span>
                              {c.adminNotes}
                            </h6>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {cLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="card h-20 animate-pulse" />
                    ))}
                  </div>
                ) : (allConsultations ?? []).length === 0 ? (
                  <div className="flex flex-col items-center text-center py-16">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-foreground mb-2">لا توجد استشارات</h3>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(allConsultations ?? []).map((c: any) => {
                      const st = consultationStatusLabels[c.status ?? "new"];
                      return (
                        <div key={c.id} className="card p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="text-foreground">{c.subject}</h4>
                              <h6 className="text-muted-foreground mt-0.5">
                                {c.userName ?? "مجهول"} •{" "}
                                {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                              </h6>
                            </div>
                            <Badge variant={st.variant} className="flex-shrink-0">
                              {st.label}
                            </Badge>
                          </div>
                          <h6 className="text-muted-foreground mb-3 line-clamp-3">
                            {c.message}
                          </h6>
                          {editingConsultationId === c.id ? (
                            <div className="space-y-3 mt-3 pt-3 border-t border-border">
                              <Select
                                value={consultationStatus || "__none__"}
                                onValueChange={v =>
                                  setConsultationStatus(v === "__none__" ? "" : v)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="-- اختر الحالة --" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">-- اختر الحالة --</SelectItem>
                                  {Object.entries(consultationStatusLabels).map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                      {l.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Textarea
                                value={consultationNotes}
                                onChange={e => setConsultationNotes(e.target.value)}
                                rows={2}
                                placeholder="ملاحظات للمتدرب (اختياري)"
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    updateConsultationMutation.mutate({
                                      id: c.id,
                                      status: (consultationStatus || c.status) as any,
                                      adminNotes: consultationNotes || undefined,
                                    })
                                  }
                                  disabled={updateConsultationMutation.isPending}
                                  className="font-bold"
                                >
                                  {updateConsultationMutation.isPending ? "..." : "حفظ"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingConsultationId(null)}
                                >
                                  إلغاء
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingConsultationId(c.id);
                                setConsultationStatus(c.status ?? "new");
                                setConsultationNotes(c.adminNotes ?? "");
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
              </>
            )}
          </div>
        )}

        {/* ===== Training requests ===== */}
        {activeTab === "requests" && (
          <div className="space-y-5">
            {!isAdmin ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    قدّم طلب تدريب جديد وتابع حالة طلباتك
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => setShowReqForm(!showReqForm)}
                    className="gap-2 font-bold"
                  >
                    <Plus className="h-4 w-4" />
                    طلب جديد
                  </Button>
                </div>

                {showReqForm && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      createRequestMutation.mutate({ title: reqTitle, description: reqDescription });
                    }}
                    className="bg-card border border-border rounded-2xl p-5 space-y-4"
                  >
                    <h3 className="text-foreground">طلب تدريب جديد</h3>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        موضوع التدريب *
                      </label>
                      <Input
                        value={reqTitle}
                        onChange={e => setReqTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        التفاصيل
                      </label>
                      <Textarea
                        value={reqDescription}
                        onChange={e => setReqDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        variant="ghost"
                        disabled={createRequestMutation.isPending}
                        className="font-bold gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {createRequestMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowReqForm(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </form>
                )}

                {(myRequests ?? []).length === 0 && !showReqForm ? (
                  <div className="flex flex-col items-center text-center py-16">
                    <Send className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-foreground mb-2">لا توجد طلبات</h3>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(myRequests ?? []).map((req: any) => {
                      const status = requestStatusLabels[req.status ?? "pending"];
                      return (
                        <div key={req.id} className="card p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h5 className="text-foreground mb-1">{req.title}</h5>
                              {req.description && (
                                <h6 className="text-muted-foreground mb-2">{req.description}</h6>
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
              </>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {["all", "pending", "approved", "rejected", "completed"].map(s => (
                    <Button
                      key={s}
                      variant="ghost"
                      size="sm"
                      onClick={() => {}}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground"
                    >
                      {s === "all" ? "الكل" : requestStatusLabels[s]?.label}
                    </Button>
                  ))}
                </div>
                {rLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="card h-20 animate-pulse" />
                    ))}
                  </div>
                ) : (allRequests ?? []).length === 0 ? (
                  <div className="flex flex-col items-center text-center py-16">
                    <Send className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-foreground mb-2">لا توجد طلبات</h3>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(allRequests ?? []).map((req: any) => {
                      const status = requestStatusLabels[req.status ?? "pending"];
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
                            <h6 className="text-muted-foreground mb-3">{req.description}</h6>
                          )}
                          {editingRequestId === req.id ? (
                            <div className="space-y-3 mt-3 pt-3 border-t border-border">
                              <Select
                                value={requestStatus || "__none__"}
                                onValueChange={v =>
                                  setRequestStatus(v === "__none__" ? "" : v)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="-- اختر الحالة --" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">-- اختر الحالة --</SelectItem>
                                  {Object.entries(requestStatusLabels).map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                      {l.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Textarea
                                value={requestNotes}
                                onChange={e => setRequestNotes(e.target.value)}
                                rows={2}
                                placeholder="ملاحظات للمتدرب (اختياري)"
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    updateRequestMutation.mutate({
                                      id: req.id,
                                      status: (requestStatus || req.status) as any,
                                      adminNotes: requestNotes || undefined,
                                    })
                                  }
                                  disabled={updateRequestMutation.isPending}
                                  className="font-bold"
                                >
                                  {updateRequestMutation.isPending ? "..." : "حفظ"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingRequestId(null)}>
                                  إلغاء
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingRequestId(req.id);
                                setRequestStatus(req.status ?? "pending");
                                setRequestNotes(req.adminNotes ?? "");
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
              </>
            )}
          </div>
        )}

        {/* ===== Suggestions ===== */}
        {activeTab === "suggestions" && (
          <div className="space-y-5">
            {!isAdmin ? (
              <>
                <div className="bg-card border border-primary/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    <h3 className="text-foreground">اقتراحاتك تُحدث الفرق</h3>
                  </div>
                  <p className="text-muted-foreground">
                    شاركنا أفكارك لتطوير بيئة العمل والتدريب في نيولاين
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowSugForm(!showSugForm)}
                    className="gap-2 font-bold"
                  >
                    <Plus className="h-4 w-4" />
                    اقتراح جديد
                  </Button>
                </div>

                {showSugForm && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      createSuggestionMutation.mutate({
                        title: sugTitle,
                        content: sugContent,
                        category: sugCategory,
                      });
                    }}
                    className="bg-card border border-border rounded-2xl p-5 space-y-4"
                  >
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        عنوان الاقتراح *
                      </label>
                      <Input
                        value={sugTitle}
                        onChange={e => setSugTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        تفاصيل الاقتراح *
                      </label>
                      <Textarea
                        value={sugContent}
                        onChange={e => setSugContent(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">
                        الفئة
                      </label>
                      <Input
                        value={sugCategory}
                        onChange={e => setSugCategory(e.target.value)}
                        placeholder="مثال: تدريب، بيئة عمل، تقنية..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        variant="ghost"
                        disabled={createSuggestionMutation.isPending}
                        className="font-bold gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {createSuggestionMutation.isPending ? "جاري الإرسال..." : "إرسال الاقتراح"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowSugForm(false)}>
                        إلغاء
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {(mySuggestions ?? []).map((sug: any) => {
                    const status = suggestionStatusLabels[sug.status ?? "new"];
                    return (
                      <div key={sug.id} className="card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="text-foreground mb-1">{sug.title}</h5>
                            <h6 className="text-muted-foreground mb-2 line-clamp-2">
                              {sug.content}
                            </h6>
                            <h6 className="text-muted-foreground">
                              {new Date(sug.createdAt).toLocaleDateString("ar-SA")}
                            </h6>
                          </div>
                          <Badge variant={status.variant} className="flex-shrink-0">
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {sLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="card h-20 animate-pulse" />
                    ))}
                  </div>
                ) : (allSuggestions ?? []).length === 0 ? (
                  <div className="flex flex-col items-center text-center py-16">
                    <Lightbulb className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-foreground mb-2">لا توجد اقتراحات</h3>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(allSuggestions ?? []).map((sug: any) => {
                      const status = suggestionStatusLabels[sug.status ?? "new"];
                      return (
                        <div key={sug.id} className="card p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="text-foreground">{sug.title}</h4>
                              <h6 className="text-muted-foreground mt-0.5">
                                {sug.user?.name ?? "مجهول"} •{" "}
                                {new Date(sug.createdAt).toLocaleDateString("ar-SA")}
                              </h6>
                            </div>
                            <Badge variant={status.variant} className="flex-shrink-0">
                              {status.label}
                            </Badge>
                          </div>
                          <h6 className="text-muted-foreground mb-3 line-clamp-3">
                            {sug.content}
                          </h6>
                          {editingSuggestionId === sug.id ? (
                            <div className="flex gap-2 mt-2">
                              <Select value={suggestionStatus} onValueChange={setSuggestionStatus}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(suggestionStatusLabels).map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                      {l.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  updateSuggestionMutation.mutate({
                                    id: sug.id,
                                    status: suggestionStatus as any,
                                  })
                                }
                                disabled={updateSuggestionMutation.isPending}
                                className="font-bold"
                              >
                                {updateSuggestionMutation.isPending ? "..." : "حفظ"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSuggestionId(null)}
                              >
                                إلغاء
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSuggestionId(sug.id);
                                setSuggestionStatus(sug.status ?? "new");
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
              </>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
