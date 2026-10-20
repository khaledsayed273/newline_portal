import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import {
  Award,
  BookOpen,
  Building2,
  ChevronDown,
  Eye,
  Heart,
  Lock,
  Play,
  Settings,
  ShoppingCart,
  Star,
  TrendingUp,
  Trophy,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

// الإدارات الخمس لنيولاين
const DEPARTMENTS = [
  { id: 1, name: "الخدمات المشتركة", icon: Building2 },
  { id: 2, name: "التشغيل", icon: Settings },
  { id: 3, name: "المبيعات", icon: ShoppingCart },
  { id: 4, name: "المالية", icon: TrendingUp },
  { id: 5, name: "الصيانة والمرافق", icon: Wrench },
];

const levelMap: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};
const levelColors: Record<string, string> = {
  beginner: "bg-success/10 text-success-emphasis",
  intermediate: "bg-warning/10 text-warning-emphasis",
  advanced: "bg-destructive/10 text-destructive",
};

// بطاقة الدورة
function CourseCard({
  course,
  isPathLocked,
  enrollment,
}: {
  course: any;
  isPathLocked: boolean;
  enrollment?: { progress: number; isCompleted: boolean } | null;
}) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(course.likesCount ?? 0);
  const progress = enrollment?.progress ?? course.progress ?? 0;
  const isCompleted = enrollment?.isCompleted ?? false;

  const toggleLike = trpc.courseLikes.toggle.useMutation({
    onSuccess: (data: any) => {
      setLiked(data.liked);
      setLikesCount((prev: number) =>
        data.liked ? prev + 1 : Math.max(0, prev - 1)
      );
    },
  });

  return (
    <div
      className={`card hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col hover:border-primary/40 ${isPathLocked ? "opacity-40 pointer-events-none" : "shadow-md hover:shadow-xl"}`}
    >
      {/*صورة مصغرة*/}
      <div className="relative h-36 bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-3 text-center bg-muted">
            <div className="card w-10 h-10 flex items-center justify-center mb-1">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <h6 className="text-card-foreground line-clamp-3 px-1">
              {course.title}
            </h6>
          </div>
        )}
        {!isPathLocked && (
          <Link
            href={`/courses/${course.id}`}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground text-sm font-bold px-4 py-2 rounded-md flex items-center gap-1.5 shadow-lg transition-all">
              {/*زر ابدأ/متابعة دائماً في المنتصف*/}
              {isCompleted ? (
                <>
                  مكتملة <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              ) : progress > 0 ? (
                <>
                  متابعة <Play className="w-3.5 h-3.5 fill-current" />
                </>
              ) : (
                <>
                  ابدأ <Play className="w-3.5 h-3.5 fill-current" />
                </>
              )}
            </span>
          </Link>
        )}
        {isCompleted && (
          <span className="absolute top-2 end-2 bg-success text-success-foreground text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-3 h-3" />
            مكتملة
          </span>
        )}
        {course.level && (
          <span
            className={`absolute top-2 start-2 text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[course.level] ?? "bg-muted text-muted-foreground"}`}
          >
            {levelMap[course.level] ?? course.level}
          </span>
        )}
        {isPathLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white/70" />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h6 className="text-foreground mb-1 line-clamp-2 flex-1">
          {course.title}
        </h6>
        {course.description && (
          <h6 className="text-muted-foreground mb-2 line-clamp-2 text-start">
            {course.description}
          </h6>
        )}

        {progress > 0 && (
          <div className="mb-2">
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`${isCompleted ? "bg-success" : "bg-primary"} h-1.5 rounded-full transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-muted-foreground mt-0.5">
              {progress}% مكتمل
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" 
              onClick={e => {
                e.preventDefault();
                if (!isPathLocked) toggleLike.mutate({ courseId: course.id });
              }}
              className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
              <span className="font-semibold">{likesCount}</span>
            </Button>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              <span>{course.viewsCount ?? 0}</span>
            </div>
            {course.duration && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="w-3 h-3" />
                <span>{course.duration} د</span>
              </div>
            )}
          </div>
          {isPathLocked && (
            <div className="flex items-center gap-1 text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
              <Lock className="w-3 h-3" />
              <span>مقفل</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// بطاقة مسار متسلسل مع قفل وإنجاز
function PathCard({
  path,
  index,
  onCertificate,
  enrollmentMap,
}: {
  path: any;
  index: number;
  onCertificate: (path: any) => void;
  enrollmentMap?: Map<number, { progress: number; isCompleted: boolean }>;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const { data: pathData, isLoading } = trpc.coursePaths.withCourses.useQuery(
    { pathId: path.id },
    { enabled: !path.isLocked }
  );
  const courses = pathData?.courses ?? [];

  const isLocked = path.isLocked;
  const isCompleted = path.isCompleted;
  const progressPercent = path.progressPercent ?? 0;
  const completedCourses = path.completedCourses ?? 0;
  const totalCourses = path.totalCourses ?? 0;

  // ألوان المسار حسب الترتيب
  const pathColors = [
    "from-primary to-primary/70",
    "from-primary to-primary/80",
    "from-primary to-primary/60",
    "from-primary/80 to-primary/60",
    "from-muted-foreground to-foreground",
  ];
  const gradientClass = pathColors[index % pathColors.length];

  return (
    <div
      className={`mb-4 rounded-xl overflow-hidden border transition-all duration-300 ${isLocked ? "border-border bg-card/50" : isCompleted ? "border-success/30 bg-success/10 shadow-sm" : "border-border bg-card shadow-sm"}`}
    >
      {/*رأس المسار*/}
      <div
        onClick={() => !isLocked && setExpanded(!expanded)}
        onKeyDown={e => {
          if (!isLocked && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded(value => !value);
          }
        }}
        role="button"
        tabIndex={isLocked ? -1 : 0}
        className={`flex h-auto w-full items-center justify-between p-3 text-start transition-colors sm:p-4 ${isLocked ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer text-foreground hover:bg-muted/50"}`}
      >
        <div className="flex items-center gap-3">
          {/*رقم المسار أو أيقونة الحالة*/}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isLocked
                ? "bg-muted"
                : isCompleted
                  ? "bg-success/10 border border-success/30"
                  : `bg-gradient-to-br ${gradientClass}`
            }`}
          >
            {isLocked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success-emphasis" />
            ) : (
              <Trophy className="w-5 h-5 text-primary-foreground" />
            )}
          </div>

          <div className="text-start">
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-sm ${isLocked ? "text-muted-foreground" : "text-foreground"}`}
              >
                {path.name}
              </span>
              {isCompleted && (
                <Badge variant="success" size="sm">
                  مكتمل ✓
                </Badge>
              )}
              {isLocked && (
                <Badge variant="secondary" size="sm">
                  مقفل
                </Badge>
              )}
            </div>
            {path.description && (
              <div
                className={`text-xs mt-0.5 ${isLocked ? "text-muted-foreground" : "text-muted-foreground"}`}
              >
                {path.description}
              </div>
            )}
            {!isLocked && index > 0 && (
              <div className="text-primary mt-0.5">
                المسار {index + 1} من 5
              </div>
            )}
            {isLocked && (
              <div className="text-muted-foreground mt-0.5">
                أكمل المسار السابق للفتح
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/*شريط الإنجاز*/}
          {!isLocked && (
            <div className="hidden sm:flex flex-col items-end gap-1 min-w-[100px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>
                  {completedCourses}/{totalCourses > 0 ? totalCourses : "?"}{" "}
                  دورة
                </span>
                <span className="font-bold text-primary">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-24 bg-muted rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${isCompleted ? "bg-success" : "bg-primary"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* زر الشهادة */}
          {isCompleted && (
            <Button variant="ghost" size="sm" 
              onClick={e => {
                e.stopPropagation();
                onCertificate(path);
              }}
              className="flex items-center gap-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-md transition-all active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              <span>شهادة</span>
            </Button>
          )}

          {!isLocked && (
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </div>

      {/*شريط الإنجاز للجوال*/}
      {!isLocked && (
        <div className="px-4 pb-2 sm:hidden">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span>
              {completedCourses}/{totalCourses > 0 ? totalCourses : "?"} دورة
            </span>
            <span className="font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${isCompleted ? "bg-success" : "bg-primary"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/*محتوى المسار (الدورات)*/}
      {expanded && !isLocked && (
        <div className="px-4 pb-4 border-t border-border">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="bg-muted rounded-xl h-48 animate-pulse"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 bg-muted/50 rounded-xl border border-dashed border-border mt-4">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                لم يتم إضافة دورات لهذا المسار بعد
              </p>
              <h6 className="text-muted-foreground mt-1">
                يمكن للمدير إضافة الدورات من لوحة التحكم
              </h6>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {courses.map((c: any) => (
                <CourseCard
                  key={c.courseId}
                  isPathLocked={false}
                  enrollment={enrollmentMap?.get(Number(c.courseId)) ?? null}
                  course={{
                    id: c.courseId,
                    title: c.courseTitle,
                    description: c.courseDescription,
                    duration: c.courseDuration,
                    level: c.courseLevel,
                    thumbnailUrl: c.courseThumbnail,
                    progress: 0,
                    likesCount: 0,
                    viewsCount: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// محتوى الإدارة المختارة
function DepartmentContent({
  deptId,
  userId,
  onCertificate,
}: {
  deptId: number;
  userId: number;
  onCertificate: (path: any, deptName: string) => void;
}) {
  const { data: paths, isLoading, isError, error } =
    trpc.coursePaths.byDepartmentWithProgress.useQuery({
      departmentId: deptId,
    }, { enabled: Boolean(userId) });
  const { data: myEnrollments } = trpc.enrollments.myEnrollments.useQuery(
    undefined,
    { enabled: Boolean(userId) }
  );
  const enrollmentMap = new Map<number, { progress: number; isCompleted: boolean }>(
    (myEnrollments ?? []).map((e: any) => [
      Number(e.courseId),
      { progress: e.progress ?? 0, isCompleted: Boolean(e.isCompleted) },
    ])
  );

  const deptName = DEPARTMENTS.find(d => d.id === deptId)?.name ?? "";

  if (isError) {
    return (
      <div className="card border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="font-semibold text-destructive">تعذر تحميل المسارات</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || "حدث خطأ في الاتصال بالخادم"}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!paths || paths.length === 0) {
    return (
      <div className="card text-center py-16 border-dashed">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">
          لم يتم إضافة مسارات لهذه الإدارة بعد
        </p>
        <p className="text-muted-foreground mt-1">
          يمكن للمدير إضافة المسارات والدورات من لوحة التحكم
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* شرح نظام المسارات */}
      <div className="card p-3 mb-5 flex items-start gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-foreground font-bold">
            نظام المسارات المتسلسلة
          </p>
          <h6 className="text-muted-foreground mt-0.5">
            أكمل كل مسار 100% للانتقال للمسار التالي والحصول على شهادة إتمام
          </h6>
        </div>
      </div>

      {paths.map((path: any, index: number) => (
        <PathCard
          key={path.id}
          path={path}
          index={index}
          onCertificate={p => onCertificate(p, deptName)}
          enrollmentMap={enrollmentMap}
        />
      ))}
    </div>
  );
}

export default function TraineeCourses() {
  const [activeDept, setActiveDept] = useState(1);
  const [certPath, setCertPath] = useState<{
    path: any;
    deptName: string;
  } | null>(null);
  const activeDeptData = DEPARTMENTS.find(d => d.id === activeDept);
  const { user } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });

  return (
    <PortalLayout role="trainee" title="الدورات التدريبية">
      <div>
        {/*رأس الصفحة*/}
        <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-xl p-6 mb-6">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-x-1/4 translate-y-1/4 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-foreground/15 rounded-xl flex items-center justify-center border border-primary-foreground/20 flex-shrink-0">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1>الدورات التدريبية</h1>
              <h6 className="text-primary-foreground/80 mt-0.5">
                5 مسارات متسلسلة لكل إدارة — أكمل المسار للحصول على شهادة
              </h6>
            </div>
          </div>
        </div>

        {/*شريط الإدارات الأفقي الثابت*/}
        <div className="card p-1.5 mb-6 flex items-center gap-1 overflow-x-auto">
          {DEPARTMENTS.map(dept => {
            const Icon = dept.icon;
            const isActive = activeDept === dept.id;
            return (
              <Button variant="ghost" size="sm" 
                key={dept.id}
                onClick={() => setActiveDept(dept.id)}
                className={`flex items-center gap-1.5 px-2.5 py-2 md:px-4 md:py-2.5 rounded-md font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${isActive ? "bg-primary text-primary-foreground shadow-lg scale-105" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span>{dept.name}</span>
              </Button>
            );
          })}
        </div>

        {/*عنوان الإدارة المختارة*/}
        {activeDeptData && (
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-muted border border-border rounded-xl flex items-center justify-center">
              <activeDeptData.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-foreground">إدارة {activeDeptData.name}</h2>
              <h6 className="text-muted-foreground">
                5 مسارات تدريبية متسلسلة
              </h6>
            </div>
            <div className="flex-1 h-px bg-border ms-2" />
          </div>
        )}

        {/*محتوى الإدارة المختارة*/}
        <DepartmentContent
           key={activeDept}
           deptId={activeDept}
           userId={user?.id ?? 0}
          onCertificate={(path, deptName) => setCertPath({ path, deptName })}
        />
      </div>

      {/* نافذة الشهادة */}
      {certPath && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setCertPath(null)}
        >
          <div
            className="card p-8 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h2 className="text-foreground mb-1">مبروك!</h2>
              <h6 className="text-muted-foreground mb-4">
                لقد أكملت مسار <strong>{certPath.path.name}</strong>
              </h6>
              <Link
                 href={`/certificate/path/${certPath.path.id}?uid=${user?.id ?? ""}&dept=${encodeURIComponent(certPath.deptName)}&path=${encodeURIComponent(certPath.path.name)}`}
              >
                <Button variant="ghost"  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-3 rounded-md transition-all active:scale-95 flex items-center justify-center gap-2 mb-3">
                  <Award className="w-5 h-5" />
                  عرض الشهادة وطباعتها
                </Button>
              </Link>
              <Button variant="ghost" 
                onClick={() => setCertPath(null)}
                className="w-full bg-muted hover:bg-muted/80 text-muted-foreground font-bold py-3 rounded-md transition-all"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
