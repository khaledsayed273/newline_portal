import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  Play,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function TraineeTracks() {
  const [, setLocation] = useLocation();
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  const { data: departments } = trpc.departments.list.useQuery();
  const { data: tracks, isLoading } = trpc.tracks.list.useQuery({
    departmentId: selectedDept,
  });
  const { data: trackCourses } = trpc.tracks.courses.useQuery(
    { trackId: selectedTrack! },
    { enabled: !!selectedTrack }
  );
  const { data: enrollments } = trpc.enrollments.myEnrollments.useQuery();

  const selectedTrackData = tracks?.find(t => t.id === selectedTrack);

  const getEnrollment = (courseId: number) =>
    enrollments?.find(e => e.courseId === courseId);

  if (selectedTrack && selectedTrackData) {
    return (
      <PortalLayout role="trainee" title={selectedTrackData.title}>
        <div className="space-y-6">
          {/* زر العودة */}
          <Button variant="ghost" 
            onClick={() => setSelectedTrack(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للمسارات
          </Button>

          {/* رأس المسار */}
          <div className="card p-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-foreground mb-2">
                  {selectedTrackData.title}
                </h2>
                {selectedTrackData.description && (
                  <p className="text-muted-foreground">
                    {selectedTrackData.description}
                  </p>
                )}
                {selectedTrackData.targetRole && (
                  <Badge variant="secondary" className="mt-3">
                    <Users className="h-3 w-3 me-1" />
                    {selectedTrackData.targetRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* دورات المسار */}
          <div>
            <h5 className="text-muted-foreground uppercase mb-4">
              دورات هذا المسار ({trackCourses?.length ?? 0} دورة)
            </h5>

            {!trackCourses ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : trackCourses.length === 0 ? (
              <div className="flex flex-col items-center text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">
                  لم يتم إضافة دورات لهذا المسار بعد
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trackCourses.map((tc, index) => {
                  // نحتاج بيانات الدورة - سنعرض رقم الترتيب فقط
                  const enrollment = getEnrollment(tc.courseId);
                  const progress = enrollment?.progress ?? 0;
                  const isCompleted = enrollment?.isCompleted ?? false;

                  return (
                    <div
                      key={tc.id}
                      className={cn(
                        "bg-card border rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4",
                        isCompleted
                          ? "border-success/30"
                          : "border-border hover:border-primary/30"
                      )}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() =>
                        setLocation(`/trainee/courses/${tc.courseId}`)
                      }
                    >
                      {/* رقم الخطوة */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold",
                          isCompleted
                            ? "bg-success/10 text-success-emphasis"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">
                            الدورة رقم {tc.courseId}
                          </p>
                          {tc.isRequired && (
                            <Badge variant="secondary" size="sm">
                              إلزامية
                            </Badge>
                          )}
                        </div>
                        {enrollment && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-primary font-semibold">
                              {progress}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-success-emphasis" />
                          ) : (
                            <Play className="h-3.5 w-3.5 text-primary fill-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout role="trainee" title="المسارات التدريبية">
      <div className="space-y-6">
        {/* فلتر الإدارات */}
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Button variant="ghost" 
            onClick={() => setSelectedDept(undefined)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all",
              !selectedDept
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            الكل
          </Button>
          {departments?.map(dept => (
            <Button variant="ghost" 
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                selectedDept === dept.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {dept.name}
            </Button>
          ))}
        </div>

        {/* قائمة المسارات */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : tracks?.length === 0 ? (
          <div className="flex flex-col items-center text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد مسارات</h3>
            <p className="text-muted-foreground">
              لم يتم إضافة مسارات تدريبية بعد
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tracks?.map((track, i) => (
              <div
                key={track.id}
                className={cn(
                  "card p-5 cursor-pointer transition-all hover:-translate-y-0.5",
                  `animate-in fade-in slide-in-from-bottom-4 fill-mode-both delay-${Math.min(i + 1, 6) * 50}`
                )}
                onClick={() => setSelectedTrack(track.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground mb-1.5">
                      {track.title}
                    </h3>
                    {track.description && (
                      <h6 className="text-muted-foreground line-clamp-2 mb-3">
                        {track.description}
                      </h6>
                    )}
                    {track.targetRole && (
                      <Badge variant="secondary" size="sm">
                        {track.targetRole}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-muted-foreground">
                    عرض المسار
                  </span>
                  <ChevronLeft className="h-4 w-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
