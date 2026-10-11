import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DEPARTMENTS = [
  "الخدمات المشتركة",
  "التشغيل",
  "المبيعات",
  "الصيانة",
  "المالية",
  "الموارد البشرية",
  "تقنية المعلومات",
  "أخرى",
];

export default function TraineeConsultations() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState("");
  const [userName, setUserName] = useState(user?.name ?? "");
  const [sent, setSent] = useState(false);

  const createMutation = trpc.consultations.create.useMutation({
    onSuccess: () => {
      setSent(true);
      toast.success("تم إرسال استشارتك بنجاح، سنتواصل معك قريباً");
    },
    onError: err => {
      toast.error("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى");
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    createMutation.mutate({
      subject: subject.trim(),
      message: message.trim(),
      userName: userName.trim() || user?.name || "متدرب",
      userEmail: user?.email ?? undefined,
      department: department || undefined,
    });
  };

  const handleReset = () => {
    setSent(false);
    setSubject("");
    setMessage("");
    setDepartment("");
  };

  return (
    <PortalLayout role="trainee" title="الاستشارات">
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="rounded-2xl p-6 bg-warning/10 border border-warning/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/15">
              <MessageCircle size={20} className="text-warning-emphasis" />
            </div>
            <div>
              <h2 className="text-lg font-semibold md:text-xl text-foreground">
                استشاراتك التدريبية
              </h2>
              <p className="text-xs leading-6 md:text-sm text-muted-foreground">
                أرسل استشارتك وسيتم الرد عليها في أقرب وقت
              </p>
            </div>
          </div>
        </div>

        {/* حالة النجاح */}
        {sent ? (
          <div className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center bg-success/10 border border-success/30">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-success/15">
              <CheckCircle size={32} className="text-success-emphasis" />
            </div>
            <div>
              <h3 className="text-foreground mb-2">تم إرسال استفسارك بنجاح!</h3>
              <p className="text-xs leading-6 md:text-sm text-muted-foreground">
                سيتم مراجعة استشارتك والرد عليها في أقرب وقت ممكن على البريد
                الإلكتروني
              </p>
            </div>
            <button
              onClick={handleReset}
              className="mt-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all bg-success/15 text-success-emphasis border border-success/30 hover:bg-success/20"
            >
              إرسال استشارة أخرى
            </button>
          </div>
        ) : (
          /* نموذج الاستشارة */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* الاسم */}
            <div>
              <label className="block text-foreground mb-2">الاسم</label>
              <input
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder={user?.name ?? "أدخل اسمك"}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* الإدارة */}
            <div>
              <label className="block text-foreground mb-2">
                الإدارة{" "}
                <span className="text-muted-foreground font-normal">
                  (اختياري)
                </span>
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-muted border border-border text-foreground focus:ring-2 focus:ring-ring"
              >
                <option value="">اختر الإدارة...</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* موضوع الاستشارة */}
            <div>
              <label className="block text-foreground mb-2">
                موضوع الاستشارة *
              </label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                placeholder="مثال: استفسار عن برنامج تدريبي، طلب توجيه مهني..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>

            {/*تفاصيل الاستشارة*/}
            <div>
              <label className="block text-foreground mb-2">
                تفاصيل الاستشارة *
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="اشرح استشارتك بالتفصيل حتى نتمكن من مساعدتك بشكل أفضل..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {message.length} حرف
              </p>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !subject.trim() ||
                message.trim().length < 10
              }
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${createMutation.isPending || !subject.trim() || message.trim().length < 10 ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-warning text-warning-foreground hover:bg-warning/90"}`}
            >
              {createMutation.isPending ? (
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
            </button>
          </form>
        )}
      </div>
    </PortalLayout>
  );
}
