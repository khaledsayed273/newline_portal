import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileWarning,
  GraduationCap,
  Star,
  XCircle,
} from "lucide-react";
import { useLocation, useParams } from "wouter";

const cleanTitle = (title: unknown, fallback: string) => {
  const value = String(title ?? "").trim();
  return !value || /^(.)\1{3,}$/.test(value) ? fallback : value;
};

function StatCard({ icon: Icon, label, value, tone = "primary" }: any) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success-emphasis",
    warning: "bg-warning/10 text-warning-emphasis",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone] ?? toneClasses.primary}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function ExamAnswers({ exam, questions }: { exam: any; questions: any[] }) {
  if (!exam?.answers || !questions?.length) {
    return <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">لا توجد إجابات محفوظة لهذا الاختبار.</p>;
  }
  return (
    <div className="space-y-2">
      {questions.map((question: any, index: number) => {
        const answer = Number(exam.answers[index]);
        const correct = Number(question.correctAnswer ?? question.correctIndex);
        const passed = answer === correct;
        return (
          <div key={question.id ?? index} className={`rounded-xl border p-4 ${passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${passed ? "bg-success/15 text-success-emphasis" : "bg-destructive/15 text-destructive"}`}>
                {passed ? <Check className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{index + 1}. {question.question}</p>
                <p className="mt-2 text-sm text-muted-foreground">إجابة الموظف: <span className="font-semibold text-foreground">{question.options?.[answer] ?? "لم تتم الإجابة"}</span></p>
                {!passed && <p className="mt-1 text-sm text-success-emphasis">الإجابة الصحيحة: {question.options?.[correct] ?? "-"}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const title = cleanTitle(course.title, "دورة تدريبية");
  const progress = Number(course.enrollment?.progress ?? 0);
  const completed = Boolean(course.enrollment?.isCompleted);
  const status = !course.enrollment ? "لم يبدأ" : completed ? "مكتملة" : progress > 0 ? "قيد التقدم" : "مسجلة";
  const statusVariant = completed ? "success" : progress > 0 ? "warning" : "secondary";

  return (
    <details className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <summary className="cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{course.duration ? `${course.duration} دقيقة` : "دورة تدريبية"}</p>
              </div>
              <Badge variant={statusVariant as any}>{status}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full transition-all ${completed ? "bg-success" : "bg-primary"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <span className="w-10 text-end text-sm font-bold text-foreground">{progress}%</span>
            </div>
          </div>
        </div>
      </summary>

      <div className="border-t border-border bg-muted/20 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-3"><p className="text-xs text-muted-foreground">الدروس المكتملة</p><p className="mt-1 text-lg font-bold">{course.enrollment?.completedLessons?.length ?? 0}</p></div>
          <div className="rounded-xl bg-card p-3"><p className="text-xs text-muted-foreground">الاختبار</p><p className="mt-1 text-lg font-bold">{course.exam ? (course.exam.isPassed === null ? "لم يدخل" : course.exam.isPassed ? "اجتاز" : "لم يجتز") : "لا يوجد"}</p></div>
          <div className="rounded-xl bg-card p-3"><p className="text-xs text-muted-foreground">التقييم</p><p className="mt-1 flex items-center gap-1 text-lg font-bold">{course.rating ? `${course.rating.average.toFixed(1)} / 5` : "لم يقيّم"}{course.rating && <Star className="h-4 w-4 text-warning-emphasis" />}</p></div>
        </div>
        {course.rating?.comment && <div className="mt-3 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">تعليق الموظف: {course.rating.comment}</div>}
      </div>
    </details>
  );
}

export default function AdminEmployeeDetails() {
  const params = useParams<{ employeeId: string }>();
  const [, navigate] = useLocation();
  const userId = Number(params.employeeId);
  const { data, isLoading, error } = trpc.stats.employeeDetails.useQuery({ userId }, { enabled: Number.isFinite(userId) && userId > 0 });

  if (isLoading) return <PortalLayout role="admin" title="تفاصيل الموظف"><div className="space-y-4"><div className="h-44 animate-pulse rounded-2xl bg-muted" /><div className="h-96 animate-pulse rounded-2xl bg-muted" /></div></PortalLayout>;
  if (error || !data) return <PortalLayout role="admin" title="تفاصيل الموظف"><div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center text-destructive">تعذر تحميل بيانات الموظف</div></PortalLayout>;

  const employee = data.employee as any;
  const summary = data.summary as any;
  const courses = data.courses as any[];
  const quizzes = data.quizzes as any[];
  const certificates = data.certificates as any[];
  const incidents = data.incidents as any[];
  const averageProgress = summary.requiredCourses ? Math.round(courses.reduce((sum, course) => sum + Number(course.enrollment?.progress ?? 0), 0) / summary.requiredCourses) : 0;
  const initials = String(employee.name || "م").trim().slice(0, 2);

  return (
    <PortalLayout role="admin" title="تفاصيل الموظف">
        <Button variant="ghost" onClick={() => navigate("/admin/employee-stats")} className="mb-2 gap-2">
          <ArrowRight className="h-4 w-4" /> العودة إلى إحصائيات الموظفين
        </Button>

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="h-24 bg-gradient-to-l from-primary/25 via-primary/10 to-transparent" />
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-wrap items-end justify-between gap-5">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-card bg-primary text-2xl font-extrabold text-primary-foreground shadow-lg">{initials}</div>
                <div className="pb-1">
                  <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">{cleanTitle(employee.name, "موظف بدون اسم")}</h1>
                  <p className="mt-1 text-sm text-muted-foreground"><span dir="ltr">{employee.employeeNumber || "-"}</span> • {employee.department || "إدارة غير محددة"} • {employee.jobTitle || "مسمى غير محدد"}</p>
                </div>
              </div>
              <Badge variant="info" className="mb-1 px-3 py-1">ملف الموظف</Badge>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="الدورات المطلوبة" value={summary.requiredCourses} />
          <StatCard icon={CheckCircle2} label="الدورات المكتملة" value={summary.completedCourses} tone="success" />
          <StatCard icon={ClipboardCheck} label="الاختبارات المجتازة" value={`${summary.passedExams} / ${summary.totalExams}`} tone="warning" />
          <StatCard icon={Award} label="الشهادات" value={summary.certificates} tone="primary" />
        </section>

        <Tabs dir="rtl" defaultValue="overview" className="space-y-5">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1 sm:grid-cols-5">
            <TabsTrigger value="overview" className="gap-2 py-2.5"><GraduationCap className="h-4 w-4" /> ملخص</TabsTrigger>
            <TabsTrigger value="courses" className="gap-2 py-2.5"><BookOpen className="h-4 w-4" /> الدورات</TabsTrigger>
            <TabsTrigger value="exams" className="gap-2 py-2.5"><ClipboardCheck className="h-4 w-4" /> الاختبارات</TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2 py-2.5"><Award className="h-4 w-4" /> الشهادات</TabsTrigger>
            <TabsTrigger value="incidents" className="gap-2 py-2.5"><FileWarning className="h-4 w-4" /> التعثرات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">التقدم العام</h2><p className="text-sm text-muted-foreground">متوسط التقدم في الدورات المطلوبة</p></div><span className="text-3xl font-extrabold text-primary">{averageProgress}%</span></div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${averageProgress}%` }} /></div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center"><div><p className="text-xl font-bold">{summary.enrolledCourses}</p><p className="text-xs text-muted-foreground">مسجلة</p></div><div><p className="text-xl font-bold text-warning-emphasis">{summary.inProgressCourses}</p><p className="text-xs text-muted-foreground">قيد التقدم</p></div><div><p className="text-xl font-bold text-success-emphasis">{summary.completedCourses}</p><p className="text-xs text-muted-foreground">مكتملة</p></div></div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-lg font-bold">آخر نشاط</h2><p className="mt-1 text-sm text-muted-foreground">ملخص سريع لأداء الموظف</p><div className="mt-5 space-y-3"><div className="flex items-center justify-between rounded-xl bg-muted/50 p-3"><span className="text-sm">الاختبارات المجتازة</span><strong>{summary.passedExams} من {summary.totalExams}</strong></div><div className="flex items-center justify-between rounded-xl bg-muted/50 p-3"><span className="text-sm">الشهادات</span><strong>{summary.certificates}</strong></div><div className="flex items-center justify-between rounded-xl bg-muted/50 p-3"><span className="text-sm">التعثرات</span><strong>{incidents.length}</strong></div></div></div>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">الدورات التدريبية</h2><p className="text-sm text-muted-foreground">اضغط على أي دورة لعرض التفاصيل</p></div><Badge variant="secondary">{courses.length} دورة</Badge></div>
            <div className="grid gap-4 xl:grid-cols-2">{courses.map(course => <CourseCard key={course.id} course={course} />)}</div>
            {courses.length === 0 && <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">لا توجد دورات مطلوبة لهذا الموظف</div>}
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            {courses.filter(course => course.exam).map(course => <details key={`course-exam-${course.id}`} className="group rounded-2xl border border-border bg-card p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden"><div><h3 className="font-bold">اختبار: {cleanTitle(course.title, "دورة تدريبية")}</h3><p className="mt-1 text-sm text-muted-foreground">درجة النجاح {course.exam.passingScore}%</p></div><Badge variant={course.exam.isPassed ? "success" : course.exam.isPassed === false ? "destructive" : "secondary"}>{course.exam.isPassed ? `اجتاز • ${course.exam.score}%` : course.exam.isPassed === false ? `لم يجتز • ${course.exam.score}%` : "لم يدخل"}</Badge></summary><div className="mt-5 border-t border-border pt-5"><ExamAnswers exam={course.exam} questions={course.exam.questions} /></div></details>)}
            {quizzes.map(quiz => <details key={`quiz-${quiz.id}`} className="group rounded-2xl border border-border bg-card p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden"><div><h3 className="font-bold">{cleanTitle(quiz.title, "اختبار تدريبي")}</h3><p className="mt-1 text-sm text-muted-foreground">درجة النجاح {quiz.passingScore}%</p></div><Badge variant={quiz.isPassed ? "success" : quiz.isPassed === false ? "destructive" : "secondary"}>{quiz.isPassed ? `اجتاز • ${quiz.score}%` : quiz.isPassed === false ? `لم يجتز • ${quiz.score}%` : "لم يدخل"}</Badge></summary><div className="mt-5 border-t border-border pt-5"><ExamAnswers exam={quiz} questions={quiz.questions} /></div></details>)}
            {courses.every(course => !course.exam) && quizzes.length === 0 && <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground"><ClipboardCheck className="mx-auto mb-3 h-10 w-10 opacity-40" />لا توجد اختبارات</div>}
          </TabsContent>

          <TabsContent value="certificates" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map(certificate => { const href = certificate.fileUrl || (certificate.kind === "path" && certificate.pathId ? `/certificate/path/${certificate.pathId}?uid=${employee.id}&path=${encodeURIComponent(certificate.title)}` : certificate.courseId ? `/courses/${certificate.courseId}?phase=certificate` : null); const isImage = Boolean(certificate.fileUrl && /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(certificate.fileUrl)); return <article key={`${certificate.kind}-${certificate.id}`} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">{isImage ? <img src={certificate.fileUrl} alt={certificate.title} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/10 to-warning/10"><Award className="h-16 w-16 text-primary/50" /></div>}<div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{cleanTitle(certificate.title, "شهادة تدريبية")}</h3><p className="mt-1 text-xs text-muted-foreground">{certificate.kind === "course" ? "إتمام دورة" : certificate.kind === "path" ? "إتمام مسار" : "شهادة إدارية"}</p></div>{href && <a href={href} target="_blank" rel="noreferrer" className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20" title="عرض الشهادة"><ExternalLink className="h-4 w-4" /></a>}</div><p className="mt-3 text-xs text-muted-foreground">{certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString("ar-EG") : "تاريخ غير محدد"}</p></div></article>; })}
            {certificates.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground"><Award className="mx-auto mb-3 h-10 w-10 opacity-40" />لا توجد شهادات</div>}
          </TabsContent>

          <TabsContent value="incidents" className="space-y-3">
            {incidents.map(incident => <article key={incident.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{cleanTitle(incident.title, "تعثر تدريبي")}</h3><p className="mt-1 text-sm text-muted-foreground">{incident.description || "لا يوجد وصف"}</p></div><Badge variant={incident.status === "resolved" || incident.status === "closed" ? "success" : "warning"}>{incident.status === "resolved" ? "تم الحل" : incident.status === "closed" ? "مغلق" : incident.status === "in_progress" ? "قيد المعالجة" : "مفتوح"}</Badge></div><div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>الأولوية: {incident.priority}</span><span>{new Date(incident.createdAt).toLocaleDateString("ar-EG")}</span></div>{incident.adminNotes && <p className="mt-3 rounded-xl bg-muted p-3 text-sm">ملاحظات المدير: {incident.adminNotes}</p>}</article>)}
            {incidents.length === 0 && <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground"><FileWarning className="mx-auto mb-3 h-10 w-10 opacity-40" />لا توجد تعثرات</div>}
          </TabsContent>
        </Tabs>
    </PortalLayout>
  );
}
