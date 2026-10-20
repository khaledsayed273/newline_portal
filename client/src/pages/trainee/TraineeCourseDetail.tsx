import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Lock,
  Play,
  PlayCircle,
  Printer,
  Shield,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// ===== أنواع YouTube IFrame API (تُحقن عبر السكريبت externe) =====
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// ===== استخراج معرف Bunny =====
// الصيغة: bunny:libraryId:videoId
function getBunnyInfo(
  url: string
): { libraryId: string; videoId: string } | null {
  const match = url.match(/^bunny:(\d+):([a-f0-9-]+)$/);
  if (match) return { libraryId: match[1], videoId: match[2] };
  return null;
}

// ===== مكون فيديو Bunny.net =====
function BunnyVideoPlayer({
  videoId,
  lessonId,
  courseId,
  userId,
  onCompleted,
  initialWatched,
}: {
  videoId: string;
  lessonId: number;
  courseId: number;
  userId: number;
  onCompleted: () => void;
  initialWatched: number;
}) {
  const [videoInfo, setVideoInfo] = useState<{
    embedUrl: string;
    tasheelUrl: string;
    title: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watched, setWatched] = useState(initialWatched);
  const [isCompleted, setIsCompleted] = useState(initialWatched >= 90);
  const [confirmed, setConfirmed] = useState(false);
  const updateProgress = trpc.lessonWatch.updateProgress.useMutation();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/bunny-token/${videoId}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.embedUrl) {
          setVideoInfo({
            embedUrl: data.embedUrl,
            tasheelUrl:
              data.tasheelUrl || "https://tasheel.new-line.sa/trainings",
            title: data.title || "",
          });
        } else {
          setError("تعذّر تحميل الفيديو");
        }
      })
      .catch(() => setError("خطأ في الاتصال"))
      .finally(() => setLoading(false));
  }, [videoId]);

  // بعد فتح تسهيل ومشاهدة الفيديو، يضغط المتدرب على "أكملت المشاهدة"
  const handleConfirmWatched = () => {
    setConfirmed(true);
    setWatched(100);
    if (!isCompleted) {
      setIsCompleted(true);
      updateProgress.mutate({
        lessonId,
        courseId,
        watchedSeconds: 3600,
        totalSeconds: 3600,
      });
      onCompleted();
    }
  };

  if (loading) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/60">جاري تحميل بيانات الفيديو...</p>
        </div>
      </div>
    );
  }

  if (error || !videoInfo) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-white/60">
            {error || "تعذّر تحميل الفيديو"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* بطاقة مشاهدة الفيديو من تسهيل */}
      <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background shadow-xl">
        {/* رأس البطاقة */}
        <div className="flex items-center gap-3 border-b border-border bg-primary/10 px-5 py-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold">
              {videoInfo.title || "مقطع الدورة"}
            </p>
            <h6 className="text-primary-foreground/70">
              متوفر عبر منصة تسهيل
            </h6>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 bg-primary/10 rounded-lg p-3 border border-primary/30">
            <svg
              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-primary-foreground/85">
              هذا الفيديو متاح عبر منصة <strong>تسهيل</strong> الخاصة بنيولاين.
              اضغط على الزر أدناه لمشاهدته ثم عد هنا وأكد المشاهدة.
            </p>
          </div>

          <a
            href={videoInfo.tasheelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold py-3.5 px-6 rounded-md transition-all duration-150 shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            مشاهدة الفيديو على منصة تسهيل
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          {!isCompleted && !confirmed ? (
            <Button variant="ghost" 
              onClick={handleConfirmWatched}
              className="flex items-center justify-center gap-2 w-full bg-success hover:bg-success/90 active:scale-[0.98] text-success-foreground font-semibold py-3 px-6 rounded-md transition-all duration-150 border border-success/30"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              أكملت مشاهدة الفيديو — انتقل للاختبار
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full bg-success/10 text-success-emphasis font-semibold py-3 px-6 rounded-md border border-success/30">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              تمت المشاهدة — يمكنك الانتقال للاختبار
            </div>
          )}
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>حالة المشاهدة</span>
          </div>
          <span
            className={cn(
              "font-bold",
              isCompleted || confirmed
                ? "text-success-emphasis"
                : "text-warning-emphasis"
            )}
          >
            {isCompleted || confirmed ? "مكتمل" : "في الانتظار"}
          </span>
        </div>
        <Progress
          value={isCompleted || confirmed ? 100 : watched}
          className="h-2"
        />
      </div>
    </div>
  );
}

// ===== استخراج معرف يوتيوب =====
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ===== نافذة تسجيل بيانات المتدرب =====
function TraineeRegistrationModal({
  userId,
  onComplete,
}: {
  userId: number;
  onComplete: (profile: { fullName: string; employeeId: string }) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    employeeId?: string;
  }>({});

  const upsertMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      onComplete({ fullName, employeeId });
    },
    onError: err => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length < 3) {
      newErrors.fullName =
        "يرجى إدخال الاسم الثلاثي كاملاً (3 أجزاء على الأقل)";
    }
    if (!employeeId.trim()) {
      newErrors.employeeId = "الرقم الوظيفي مطلوب";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    upsertMutation.mutate({
      fullName: fullName.trim(),
      employeeId: employeeId.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
        {/* الرأس */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-foreground mb-1">
            تسجيل بيانات المتدرب
          </h2>
          <p className="text-muted-foreground">
            يرجى تعبئة البيانات التالية قبل بدء المشاهدة — ستُستخدم في شهادة
            الإتمام
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* الاسم الثلاثي */}
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-sm font-semibold text-foreground"
            >
              الاسم الثلاثي <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => {
                setFullName(e.target.value);
                setErrors(prev => ({ ...prev, fullName: undefined }));
              }}
              placeholder="مثال: محمد عبدالله الأحمد"
              className={cn(
                "text-start",
                errors.fullName &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.fullName && (
              <h6 className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.fullName}
              </h6>
            )}
          </div>

          {/* الرقم الوظيفي */}
          <div className="space-y-2">
            <Label
              htmlFor="employeeId"
              className="text-sm font-semibold text-foreground"
            >
              الرقم الوظيفي <span className="text-destructive">*</span>
            </Label>
            <Input
              id="employeeId"
              value={employeeId}
              onChange={e => {
                setEmployeeId(e.target.value);
                setErrors(prev => ({ ...prev, employeeId: undefined }));
              }}
              placeholder="مثال: EMP-12345"
              className={cn(
                "text-start",
                errors.employeeId &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.employeeId && (
              <h6 className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.employeeId}
              </h6>
            )}
          </div>

          {/* تنبيه */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex gap-2">
            <Shield className="h-4 w-4 text-warning-emphasis flex-shrink-0 mt-0.5" />
            <h6 className="text-warning-emphasis">
              لن يُحتسب إنجاز الدورة إلا بعد مشاهدة الفيديو كاملاً. لا يُسمح
              بالتسريع أو التخطي.
            </h6>
          </div>

          <Button
            type="submit"
            variant="default"
            disabled={upsertMutation.isPending}
            className="w-full font-bold text-base h-12"
          >
            {upsertMutation.isPending ? "جاري الحفظ..." : "ابدأ المشاهدة"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ===== مشغل يوتيوب مع تتبع صارم =====
function StrictYouTubePlayer({
  videoId,
  lessonId,
  courseId,
  userId,
  onCompleted,
  initialWatched,
  duration: lessonDuration = 0,
}: {
  videoId: string;
  lessonId: number;
  courseId: number;
  userId: number;
  onCompleted: () => void;
  initialWatched: number;
  duration?: number;
}) {
  const [watchPercent, setWatchPercent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

  // تتبع الثواني المشاهدة بدقة
  const watchedSecondsRef = useRef(initialWatched);
  const lastPositionRef = useRef(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const completedRef = useRef(false);
  const apiReadyRef = useRef(false);
  const playerCreatedRef = useRef(false);
  const updateMutation = trpc.lessonWatch.updateProgress.useMutation();

  // تحديد المدة من بيانات الدرس إذا لم يوفرها مشغل يوتيوب بعد
  useEffect(() => {
    if (lessonDuration && lessonDuration > 0 && totalDuration === 0) {
      setTotalDuration(lessonDuration);
    }
  }, [lessonDuration, totalDuration]);

  // تحميل سكريبت YouTube IFrame API مرة واحدة
  useEffect(() => {
    if (apiReadyRef.current) return;
    if (window.YT && window.YT.Player) {
      apiReadyRef.current = true;
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => {
      apiReadyRef.current = true;
    };
  }, []);

  // حفظ التقدم عند الخادم
  const saveProgress = useCallback(
    (watched: number, total: number) => {
      if (total <= 0) return;
      updateMutation.mutate(
        {
          lessonId,
          courseId,
          watchedSeconds: Math.round(watched),
          totalSeconds: Math.round(total),
        },
        {
          onSuccess: (res: { isCompleted?: boolean } | null | undefined) => {
            if (res?.isCompleted && !completedRef.current) {
              completedRef.current = true;
              setIsCompleted(true);
              onCompleted();
            }
          },
        }
      );
    },
    [lessonId, courseId, onCompleted, updateMutation]
  );

  // مستمع postMessage كبديل لمراقبة.currentTime (قد لا تُرسل من يوتيوب أحيانًا)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === "infoDelivery" && data.info) {
          const { currentTime, duration, playerState, playbackRate } =
            data.info;

          if (playbackRate && playbackRate > 1 && !warningShown) {
            setWarningShown(true);
            toast.error("⚠️ لا يُسمح بتسريع الفيديو — لن يُحتسب الإنجاز", {
              duration: 4000,
            });
            watchedSecondsRef.current = 0;
            setWatchPercent(0);
          }

          if (duration && duration > 0) {
            setTotalDuration(duration);

            if (currentTime && lastPositionRef.current > 0) {
              const jump = currentTime - lastPositionRef.current;
              if (jump > 5) {
                toast.warning("⚠️ تخطي الفيديو لا يُحتسب في الإنجاز", {
                  duration: 3000,
                });
              } else if (
                jump > 0 &&
                jump <= 5 &&
                (!playbackRate || playbackRate <= 1)
              ) {
                watchedSecondsRef.current = Math.min(
                  watchedSecondsRef.current + jump,
                  duration
                );
              }
            }

            if (currentTime) {
              lastPositionRef.current = currentTime;
            }

            const percent = Math.min(
              100,
              Math.round((watchedSecondsRef.current / duration) * 100)
            );
            setWatchPercent(percent);
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [warningShown]);

  // إنشاء مشغل يوتيوب الحقيقي باستخدام IFrame API لكشف نهاية الفيديو (ENDED)
  useEffect(() => {
    if (!window.YT || !window.YT.Player) return;
    if (playerCreatedRef.current) return;

    const player = new window.YT.Player(iframeRef.current!, {
      videoId,
      events: {
        onReady: () => {
          try {
            const dur = player.getDuration();
            if (dur && dur > 0) {
              setTotalDuration(dur);
            }
          } catch {}
        },
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0 && !completedRef.current) {
            const total =
              totalDuration > 0
                ? totalDuration
                : lessonDuration > 0
                  ? lessonDuration
                  : 0;
            if (total > 0) {
              watchedSecondsRef.current = total;
              saveProgress(total, total);
              setWatchPercent(100);
              setIsCompleted(true);
              completedRef.current = true;
              onCompleted();
            }
          }
        },
        onError: () => {},
      },
    });
    playerRef.current = player;
    playerCreatedRef.current = true;
  }, [window.YT, videoId, iframeRef.current, totalDuration, lessonDuration, saveProgress, onCompleted]);

  // حفظ دوري كل 5 ثوانٍ باستخدام getCurrentTime من مشغل يوتيوب
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!totalDuration || totalDuration <= 0) return;
      let current = watchedSecondsRef.current;
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
          const ct = playerRef.current.getCurrentTime();
          if (ct && ct >= 0) {
            current = Math.max(watchedSecondsRef.current, Math.floor(ct));
          }
        }
      } catch {}
      saveProgress(current, totalDuration);
      watchedSecondsRef.current = Math.min(current, totalDuration);
      setWatchPercent(Math.min(100, Math.round((watchedSecondsRef.current / totalDuration) * 100)));
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalDuration, saveProgress]);

  // حفظ التقدم عند مغادرة الصفحة أو إخفاء التبويب
  useEffect(() => {
    const flush = () => {
      if (totalDuration > 0 && watchedSecondsRef.current > 0 && !completedRef.current) {
        saveProgress(watchedSecondsRef.current, totalDuration);
      }
    };
    const handleBeforeUnload = () => flush();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [totalDuration, saveProgress]);

  const iframeSrc = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`;

  return (
    <div className="space-y-3">
      {/* مشغل الفيديو */}
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="فيديو الدرس"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {isCompleted && (
          <div className="absolute inset-0 bg-success/10 border-2 border-success rounded-xl pointer-events-none flex items-center justify-center">
            <div className="bg-success text-success-foreground rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">تم إكمال الدرس</span>
            </div>
          </div>
        )}
      </div>

      {/* مؤشر التقدم */}
      <div className="card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>نسبة المشاهدة</span>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="text-success-emphasis font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                مكتمل
              </span>
            ) : (
              <span className="font-bold text-primary">{watchPercent}%</span>
            )}
          </div>
        </div>
        <Progress value={watchPercent} className="h-3" />
        {!isCompleted && watchPercent < 95 && (
          <h6 className="text-muted-foreground text-center">
            يجب مشاهدة الفيديو كاملاً للحصول على الاعتماد — لا يُسمح بالتسريع أو
            التخطي
          </h6>
        )}
        {!isCompleted && watchPercent >= 95 && (
          <h6 className="text-warning-emphasis text-center">
            اقتربت من الإكمال... استمر في المشاهدة
          </h6>
        )}
      </div>
    </div>
  );
}

// ===== مشغل Zoom مستقل =====
function ZoomPlayer({
  lesson,
  onCompleted,
}: {
  lesson: {
    videoUrl?: string | null;
    title: string;
    description?: string | null;
  };
  onCompleted: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const passcodeMatch = lesson.description?.match(/كلمة المرور[:\s]+([^\s|]+)/);
  const passcode = passcodeMatch ? passcodeMatch[1] : null;

  const handleCopy = () => {
    if (passcode) {
      navigator.clipboard
        .writeText(passcode)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => {
          // fallback: select text manually
        });
    }
  };

  return (
    <div className="aspect-video rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-primary via-primary to-accent flex flex-col items-center justify-center gap-5 p-8">
      {/* شعار Zoom */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
            <rect width="40" height="40" rx="10" fill="#2D8CFF" />
            <path
              d="M8 14a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V14z"
              fill="white"
            />
            <path d="M26 17.5l6-4v13l-6-4V17.5z" fill="white" />
          </svg>
        </div>
        <div>
          <h2 className="text-white">
            {lesson.title}
          </h2>
          <p className="text-white/75">تسجيل Zoom مباشر</p>
        </div>
      </div>

      {/* بطاقة كلمة المرور */}
      {passcode ? (
        <div className="bg-white/15 border border-white/30 rounded-xl px-6 py-4 w-full max-w-xs text-center">
          <h6 className="text-white/75 mb-2 uppercase">
            كلمة المرور للتسجيل
          </h6>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-white font-mono select-all">
              {passcode}
            </h2>
            <Button variant="ghost" 
              onClick={handleCopy}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
              title="نسخ كلمة المرور"
            >
              {copied ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </Button>
          </div>
          <h6 className="text-white/70 mt-2">
            {copied ? "✔ تم النسخ!" : "انقر الأيقونة لنسخ كلمة المرور"}
          </h6>
        </div>
      ) : (
        <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-white/80">
          لا توجد كلمة مرور لهذا التسجيل
        </div>
      )}

      {/* زر فتح التسجيل */}
      <a
        href={lesson.videoUrl ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-white text-primary font-bold text-lg px-8 py-3 rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-xl"
        onClick={onCompleted}
      >
        <Play className="w-6 h-6 fill-primary" />
        فتح التسجيل
      </a>
      <h6 className="text-white/70">
        سيتم فتح التسجيل في نافذة جديدة — ادخل كلمة المرور عند الطلب
      </h6>
    </div>
  );
}

// ===== مشغل الفيديو العام =====
function VideoPlayer({
  lesson,
  userId,
  onCompleted,
  initialWatched,
}: {
  lesson: {
    id: number;
    courseId: number;
    videoUrl?: string | null;
    videoType?: string | null;
    fileUrl?: string | null;
    fileType?: string | null;
    duration?: number | null;
    title: string;
    description?: string | null;
  };
  userId: number;
  onCompleted: () => void;
  initialWatched: number;
}) {
  if (lesson.fileUrl) {
    const isPdf = lesson.fileType?.toLowerCase() === "pdf" || /\.pdf(?:$|[?#])/i.test(lesson.fileUrl);
    if (isPdf) {
      return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="size-5 shrink-0 text-primary" />
              <span className="truncate font-semibold text-foreground">{lesson.title}</span>
            </div>
            <a
              href={lesson.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              تحميل PDF
            </a>
          </div>
          <iframe
            src={`${lesson.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title={lesson.title}
            className="h-[min(700px,75vh)] min-h-[420px] w-full bg-white"
          />
          <div className="border-t border-border p-3 text-center">
            <Button type="button" onClick={onCompleted} className="font-bold">
              تم الاطلاع على الملف
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl bg-muted p-6 text-center shadow-xl">
        <FileText className="size-12 text-muted-foreground/60" />
        <a
          href={lesson.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          onClick={onCompleted}
          className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          تحميل/فتح الملف
        </a>
      </div>
    );
  }

  if (!lesson.videoUrl) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            لا يوجد فيديو لهذا الدرس
          </p>
        </div>
      </div>
    );
  }

  // فحص Bunny أولاً
  const bunnyInfo = getBunnyInfo(lesson.videoUrl);
  if (bunnyInfo) {
    return (
      <BunnyVideoPlayer
        videoId={bunnyInfo.videoId}
        lessonId={lesson.id}
        courseId={lesson.courseId}
        userId={userId}
        onCompleted={onCompleted}
        initialWatched={initialWatched}
      />
    );
  }

  // فحص Zoom
  const isZoom = lesson.videoUrl.includes("zoom.us/rec");
  if (isZoom) {
    return <ZoomPlayer lesson={lesson} onCompleted={onCompleted} />;
  }

  const isYouTube =
    lesson.videoType === "youtube" ||
    lesson.videoUrl.includes("youtube") ||
    lesson.videoUrl.includes("youtu.be");

  if (isYouTube) {
    const videoId = getYouTubeId(lesson.videoUrl);
    if (videoId) {
      return (
        <StrictYouTubePlayer
          videoId={videoId}
          lessonId={lesson.id}
          courseId={lesson.courseId}
          userId={userId}
          onCompleted={onCompleted}
          initialWatched={initialWatched}
          duration={lesson.duration ?? undefined}
        />
      );
    }
  }

  const isFileLink =
    lesson.videoType === "direct" ||
    lesson.videoUrl.match(/\.(pdf|pptx?|docx?|xlsx?|zip|rar)$/i);

  if (isFileLink) {
    const isPdf = /\.pdf(?:$|[?#])/i.test(lesson.videoUrl);
    if (isPdf) {
      return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="size-5 shrink-0 text-primary" />
              <span className="truncate font-semibold text-foreground">
                {lesson.title}
              </span>
            </div>
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              تحميل PDF
            </a>
          </div>
          <iframe
            src={`${lesson.videoUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title={lesson.title}
            className="h-[min(700px,75vh)] min-h-[420px] w-full bg-white"
          />
        </div>
      );
    }

    return (
      <div className="aspect-video rounded-xl overflow-hidden shadow-xl bg-muted flex flex-col items-center justify-center gap-4 p-6">
        <FileText className="h-12 w-12 text-muted-foreground/60" />
        <a
          href={lesson.videoUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg"
        >
          <Download className="h-5 w-5" />
          تحميل/فتح الملف
        </a>
        <h6 className="text-muted-foreground text-center break-all truncate">
          {(lesson.videoUrl ?? "").split("/").pop() ?? lesson.videoUrl}
        </h6>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden shadow-xl bg-black">
      <video
        src={lesson.videoUrl ?? undefined}
        controls
        className="w-full h-full"
        title={lesson.title}
      />
    </div>
  );
}

// ===== الصفحة الرئيسية =====
export default function TraineeCourseDetail() {
  const params = useParams<{ id: string }>();
  const courseId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const [activeLesson, setActiveLesson] = useState<number>(0);
  const [showRegistration, setShowRegistration] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(
    new Set()
  );
  // مراحل ما بعد الفيديو
  const [coursePhase, setCoursePhase] = useState<
    "watching" | "rating" | "exam" | "certificate"
  >("watching");
  const [ratingAnswers, setRatingAnswers] = useState<Record<number, number>>(
    {}
  );
  const [ratingComment, setRatingComment] = useState("");
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult] = useState<{
    score: number;
    isPassed: boolean;
    correct: number;
    total: number;
  } | null>(null);
  const [certCode, setCertCode] = useState<string | null>(null);

  const { user } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  const userId = user?.id ?? 0;

  const { data: course, isLoading: courseLoading } = trpc.courses.byId.useQuery(
    { id: courseId }
  );
  const { data: lessons, isLoading: lessonsLoading } =
    trpc.lessons.byCourse.useQuery({ courseId });
  const { data: courseWatchProgress } =
    trpc.lessonWatch.getCourseProgress.useQuery({ courseId }, { enabled: Boolean(user) });
  const { data: existingExam } = trpc.courseExam.getByCourse.useQuery({
    courseId,
  });
  const { data: existingAttempt } = trpc.courseExam.getAttempt.useQuery({
    courseId,
  }, { enabled: Boolean(user) });
  const { data: existingCert } = trpc.courseCert.get.useQuery({
    courseId,
  }, { enabled: Boolean(user) });
  const { data: existingRating } = trpc.courseRating.getForCourse.useQuery({
    courseId,
  }, { enabled: Boolean(user) });

  const submitRatingMutation = trpc.courseRating.submit.useMutation();
  const submitExamMutation = trpc.courseExam.submit.useMutation();
  const issueCertMutation = trpc.courseCert.issue.useMutation();
  const markLessonCompleteMutation =
    trpc.lessonWatch.markLessonComplete.useMutation();

  const utils = trpc.useUtils();

  // تحديث حالة الإكمال من قاعدة البيانات
  useEffect(() => {
    if (courseWatchProgress) {
      const completedIds = courseWatchProgress
        .filter((p: any) => p.isCompleted)
        .map((p: any) => Number(p.lessonId));
      const completed = new Set<number>(completedIds);
      setCompletedLessonIds(completed);
    }
  }, [courseWatchProgress]);

  // فتح مرحلة الشهادة مباشرة عبر ?phase=certificate (من صفحة شهاداتي)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("phase") !== "certificate")
      return;
    if (existingCert) {
      setCertCode(existingCert.certCode);
      setCoursePhase("certificate");
    } else if (existingAttempt?.isPassed) {
      setCoursePhase("certificate");
    }
  }, [existingCert, existingAttempt]);

  const currentLesson = lessons?.[activeLesson];
  const totalLessons = lessons?.length ?? 0;
  const completedCount = completedLessonIds.size;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const recalcMutation = trpc.lessonWatch.recalcPathProgress.useMutation();

  const handleLessonCompleted = useCallback(() => {
    if (!currentLesson) return;
    setCompletedLessonIds(prev => {
      const next = new Set<number>(Array.from(prev));
      next.add(currentLesson.id);
      return next;
    });
    // دروس الملفات (PDF / Word / ZIP) لا تمر على مشغّل الفيديو،
    // لذا نثبّت إتمامها في قاعدة البيانات صراحةً.
    if (currentLesson.fileUrl) {
      markLessonCompleteMutation.mutate({
        lessonId: currentLesson.id,
        courseId,
      });
    }
    utils.lessonWatch.getCourseProgress.invalidate({
      courseId,
    });
    recalcMutation.mutate({ courseId });
    toast.success("🎉 أحسنت! تم إكمال هذا الدرس بنجاح");
    if (activeLesson < totalLessons - 1) {
      setTimeout(() => setActiveLesson(prev => prev + 1), 2000);
    }
  }, [
    currentLesson,
    activeLesson,
    totalLessons,
    courseId,
    utils,
    recalcMutation,
    markLessonCompleteMutation,
  ]);

  // عند إكمال جميع الدروس → انتقل لمرحلة التقييم
  useEffect(() => {
    if (
      overallProgress === 100 &&
      coursePhase === "watching" &&
      totalLessons > 0
    ) {
      if (existingCert) {
        setCertCode(existingCert.certCode);
        setCoursePhase("certificate");
      } else if (existingAttempt?.isPassed) {
        setCoursePhase("certificate");
      } else if (existingRating) {
        setCoursePhase("exam");
      } else {
        setTimeout(() => setCoursePhase("rating"), 1500);
      }
    }
  }, [
    overallProgress,
    coursePhase,
    totalLessons,
    existingCert,
    existingAttempt,
    existingRating,
  ]);

  const handleSubmitRating = async () => {
    if (Object.keys(ratingAnswers).length < 5) {
      toast.error("يرجى الإجابة على جميع الأسئلة");
      return;
    }
    await submitRatingMutation.mutateAsync({
      courseId,
      q1: ratingAnswers[1],
      q2: ratingAnswers[2],
      q3: ratingAnswers[3],
      q4: ratingAnswers[4],
      q5: ratingAnswers[5],
      comment: ratingComment || undefined,
    });
    toast.success("شكراً على تقييمك!");
    setCoursePhase("exam");
  };

  const handleSubmitExam = async () => {
    if (!existingExam) {
      // لا يوجد اختبار → منح الشهادة مباشرة
      await handleIssueCert(100);
      return;
    }
    const totalQ = existingExam.questions?.length ?? 0;
    if (Object.keys(examAnswers).length < totalQ) {
      toast.error("يرجى الإجابة على جميع الأسئلة");
      return;
    }
    const answersArr = Array.from(
      { length: totalQ },
      (_, i) => examAnswers[i] ?? -1
    );
    const result = await submitExamMutation.mutateAsync({
      courseId,
      answers: answersArr,
    });
    setExamResult(result);
    if (result.isPassed) {
      toast.success(`🎉 اجتزت الاختبار بدرجة ${result.score}/100`);
      await handleIssueCert(result.score);
    } else {
      toast.error(
        `لم تجتز الاختبار. درجتك: ${result.score}/100. يمكنك إعادة المحاولة`
      );
    }
  };

  const handleIssueCert = async (score: number) => {
    if (!course) return;
    const res = await issueCertMutation.mutateAsync({
      courseId,
      courseName: course.title,
      departmentName: course.departmentId
        ? `إدارة ${course.departmentId}`
        : undefined,
      score,
    });
    setCertCode(res.certCode ?? (res as any).certCode);
    setCoursePhase("certificate");
  };

  const handleRetryExam = () => {
    setExamAnswers({});
    setExamResult(null);
  };

  const handleRegistrationComplete = (profile: {
    fullName: string;
    employeeId: string;
  }) => {
    setShowRegistration(false);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ===== شاشة التقييم (5 أسئلة انطباع) =====
  const ratingQuestions = [
    { id: 1, text: "جودة محتوى الدورة" },
    { id: 2, text: "وضوح الشرح والتقديم" },
    { id: 3, text: "الاستفادة العملية من الدورة" },
    { id: 4, text: "هل توصي بها لزملائك؟" },
    { id: 5, text: "التقييم العام للدورة" },
  ];

  if (coursePhase === "rating") {
    return (
      <PortalLayout role="trainee" title="تقييم الدورة">
        <div>
          <div className="card p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-foreground">تقييم الدورة</h2>
              <p className="text-muted-foreground">
                شاركنا انطباعك عن هذه الدورة لتحسين جودتها
              </p>
            </div>
            <div className="space-y-6">
              {ratingQuestions.map(q => (
                <div key={q.id} className="space-y-3">
                  <p className="font-medium text-foreground">
                    {q.id}. {q.text}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Button variant="ghost" 
                        key={star}
                        onClick={() =>
                          setRatingAnswers(prev => ({ ...prev, [q.id]: star }))
                        }
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all text-sm font-bold",
                          ratingAnswers[q.id] === star
                            ? "bg-primary text-primary-foreground scale-110"
                            : ratingAnswers[q.id] >= star
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {star}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between text-muted-foreground px-1">
                    <span>ضعيف</span>
                    <span>ممتاز</span>
                  </div>
                </div>
              ))}
              <div className="space-y-2">
                <Label>تعليق إضافي (اختياري)</Label>
                <Textarea
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                  placeholder="شاركنا رأيك..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
            <Button
              variant="default"
              onClick={handleSubmitRating}
              disabled={
                Object.keys(ratingAnswers).length < 5 ||
                submitRatingMutation.isPending
              }
              className="w-full h-12 text-base font-bold"
            >
              {submitRatingMutation.isPending
                ? "جاري الحفظ..."
                : "إرسال التقييم والمتابعة للاختبار"}
            </Button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // ===== شاشة الاختبار (10 أسئلة) =====
  if (coursePhase === "exam") {
    const questions = existingExam?.questions ?? [];
    return (
      <PortalLayout role="trainee" title="اختبار الدورة">
        <div>
          {examResult ? (
            <div className="card p-8 text-center space-y-6">
              {examResult.isPassed ? (
                <>
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-success-emphasis" />
                  </div>
                  <h2 className="text-success-emphasis">
                    مبروك! اجتزت الاختبار
                  </h2>
                  <h2 className="text-primary">
                    {examResult.score}/100
                  </h2>
                  <p className="text-muted-foreground">
                    أجبت عن {examResult.correct} من {examResult.total} أسئلة
                    بشكل صحيح
                  </p>
                  <Button
                    onClick={() => setCoursePhase("certificate")}
                    className="h-12 px-8"
                  >
                    <Award className="h-5 w-5 ms-2" />
                    عرض الشهادة
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-10 w-10 text-destructive" />
                  </div>
                  <h2 className="text-destructive">لم تجتز الاختبار</h2>
                  <h2 className="text-muted-foreground">
                    {examResult.score}/100
                  </h2>
                  <p className="text-muted-foreground">درجة النجاح: 70/100</p>
                  <p className="text-muted-foreground">
                    أجبت عن {examResult.correct} من {examResult.total} أسئلة
                    بشكل صحيح
                  </p>
                  <Button
                    onClick={handleRetryExam}
                    variant="outline"
                    className="h-12 px-8"
                  >
                    إعادة المحاولة
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="card p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-foreground">اختبار الدورة</h2>
                <p className="text-muted-foreground">
                  {questions.length} سؤال • كل سؤال 10 درجات • درجة النجاح
                  70/100
                </p>
              </div>
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    لم يتم إضافة أسئلة لهذا الاختبار بعد
                  </p>
                  <Button onClick={() => handleIssueCert(100)}>
                    <Award className="h-4 w-4 ms-2" />
                    الحصول على الشهادة
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q: any, qi: number) => (
                    <div
                      key={q.id}
                      className="border border-border rounded-xl p-4 md:p-5 space-y-3"
                    >
                      <p className="font-semibold text-foreground text-right">
                        سؤال {qi + 1}: {q.question}
                      </p>
                      <div className="space-y-3">
                        {q.options.map((opt: string, oi: number) => (
                          <Button variant="ghost"
                            key={oi}
                            onClick={() =>
                              setExamAnswers(prev => ({ ...prev, [qi]: oi }))
                            }
                            className={cn(
                              "w-full flex flex-col items-start gap-1.5 p-3.5 rounded-lg border transition-all text-sm text-right whitespace-normal min-w-0 min-h-[72px] md:min-h-auto",
                              examAnswers[qi] === oi
                                ? "bg-primary/10 border-primary text-primary font-medium"
                                : "border-border hover:bg-muted/50 text-foreground"
                            )}
                          >
                            <span className="text-right break-words whitespace-normal leading-relaxed">
                              {opt}
                            </span>
                            <span className="font-bold text-right text-xs opacity-70 mt-1">
                              {String.fromCharCode(65 + oi)}.
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={handleSubmitExam}
                    disabled={
                      Object.keys(examAnswers).length < questions.length ||
                      submitExamMutation.isPending
                    }
                    className="w-full h-12 text-base font-bold"
                  >
                    {submitExamMutation.isPending
                      ? "جاري التصحيح..."
                      : "تسليم الاختبار"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </PortalLayout>
    );
  }

  // ===== شاشة الشهادة =====
  if (coursePhase === "certificate" && course) {
    const issueDate = new Date().toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return (
      <PortalLayout role="trainee" title="شهادة إتمام الدورة">
        <div className="space-y-4">
          {/* أزرار التحكم */}
          <div className="flex items-center justify-between print:hidden">
            <Button
              variant="ghost"
              onClick={() => setLocation("/courses")}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              الدورات
            </Button>
            <Button variant="ghost"  onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" />
              طباعة الشهادة
            </Button>
          </div>

          {/* الشهادة - تصميم محسّن */}
          <div
            id="course-certificate"
            className="cert-sheet text-gray-900 shadow-2xl overflow-hidden"
          >
            {/* إطار ذهبي داخلي */}
            <div className="cert-frame" />

            {/* الجزء العلوي الأبيض */}
            <div className="px-16 pt-10 pb-4 text-center">
              {/* الشعار */}
              <div className="flex justify-center mb-4">
                <div className="rounded-xl bg-gradient-to-b from-white to-slate-100 px-4 py-2 shadow-sm ring-1 ring-black/5">
                  <img
                    src="/assets/logo.png"
                    alt="شعار نيولاين"
                    className="h-24 object-contain"
                    onError={e => {
                      e.currentTarget.hidden = true;
                    }}
                  />
                </div>
              </div>

              {/* عنوان مزدوج عربي وإنجليزي */}
              <h1 className="cert-navy mb-1">
                شهادة إتمام برنامج تدريبي
              </h1>
              <p className="cert-gold uppercase mb-5">
                CERTIFICATE OF COMPLETION
              </p>

              {/* نص تقديمي */}
              <p className="text-gray-600 mb-2">
                تُقدِّم شركة نيولاين للخدمات اللوجستية هذه الشهادة إلى
              </p>
              <p className="text-gray-500 mb-3">
                Newline Logistics Company proudly presents this certificate to
              </p>

              {/* اسم المتدرب */}
              <div className="cert-name mb-3">
                {user.name || user.employeeNumber}
              </div>
              <p className="text-gray-500 mb-4">
                الرقم الوظيفي / Employee ID:{" "}
                <span className="font-bold text-gray-700">
                  {user.employeeNumber}
                </span>
              </p>

              {/* اسم الدورة */}
              <p className="text-gray-600 mb-1">
                لإتمامه بنجاح البرنامج التدريبي المعنون بـ:
              </p>
              <h6 className="text-gray-500 mb-2">
                for successfully completing the training program entitled:
              </h6>
              <h2 className="cert-navy mb-3">
                "{course.title}"
              </h2>

              {/* درجة الاختبار */}
              {(examResult || existingAttempt) && (
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-1.5 mb-3">
                  <span className="text-gray-600">
                    درجة الاختبار / Score:
                  </span>
                  <h2
                    className="cert-navy"
                  >
                    {examResult?.score ?? existingAttempt?.score ?? 0}/100
                  </h2>
                </div>
              )}

              <h6 className="text-gray-500 max-w-2xl mx-auto mb-2 px-4">
                صُمِّم هذا البرنامج لتعزيز الكفاءات المهنية وتطوير المهارات
                العملية، وتُمنح هذه الشهادة اعترافاً بالتزامه وحضوره ومشاركته
                الفعّالة وإتمامه جميع متطلبات البرنامج.
              </h6>
              <p className="cert-gold">
                {issueDate}
              </p>
            </div>

            {/* الموجات الزرقاء والذهبية */}
            <div className="cert-waves relative">
              <svg
                viewBox="0 0 1200 170"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,50 C150,90 350,10 600,50 C850,90 1050,10 1200,50 L1200,170 L0,170 Z"
                  fill="#C9A227"
                  opacity="0.35"
                />
                <path
                  d="M0,70 C200,110 400,30 600,70 C800,110 1000,30 1200,70 L1200,170 L0,170 Z"
                  fill="#C9A227"
                  opacity="0.55"
                />
                <path
                  d="M0,90 C200,130 400,50 600,90 C800,130 1000,50 1200,90 L1200,170 L0,170 Z"
                  fill="#1E3A6E"
                  opacity="0.6"
                />
                <path
                  d="M0,115 C200,155 400,75 600,115 C800,155 1000,75 1200,115 L1200,170 L0,170 Z"
                  fill="#1E3A6E"
                />

                {/* تاريخ الإصدار - يسار */}
                <text
                  x="90"
                  y="140"
                  fill="#C9A227"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Arial"
                >
                  Issued on {issueDate}
                </text>
                <text
                  x="90"
                  y="157"
                  fill="#C9A227"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Arial"
                >
                  {certCode ?? "---"}
                </text>

                {/* الختم الذهبي - وسط */}
                <circle cx="600" cy="138" r="36" fill="#C9A227" />
                <circle cx="600" cy="138" r="30" fill="#B8901F" />
                <circle cx="600" cy="138" r="24" fill="#C9A227" />
                <text
                  x="600"
                  y="132"
                  fill="#1E3A6E"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Arial"
                >
                  CERTIFICATE
                </text>
                <text
                  x="600"
                  y="141"
                  fill="#1E3A6E"
                  fontSize="6.5"
                  textAnchor="middle"
                  fontFamily="Arial"
                >
                  OF COMPLETION
                </text>
                <text
                  x="600"
                  y="150"
                  fill="#1E3A6E"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Arial"
                >
                  NEWLINE
                </text>

                {/* لوغو نيولاين بدل التوقيع - يمين */}
                <rect
                  x="1010"
                  y="102"
                  width="180"
                  height="62"
                  rx="12"
                  fill="white"
                  opacity="0.95"
                />
                <image
                  href="/assets/logo.png"
                  x="1020"
                  y="110"
                  width="160"
                  height="50"
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>
          </div>

          <style>{`
            @media print {
              body { background: white; }
              #course-certificate { box-shadow: none; border-radius: 0; }
            }
          `}</style>
        </div>
      </PortalLayout>
    );
  }

  if (courseLoading || lessonsLoading) {
    return (
      <PortalLayout role="trainee" title="تحميل...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!course) {
    return (
      <PortalLayout role="trainee" title="غير موجود">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">الدورة غير موجودة</p>
          <Button variant="ghost"  onClick={() => setLocation("/courses")} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للدورات
          </Button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <>
      {/* نافذة تسجيل المتدرب */}
      {showRegistration && (
        <TraineeRegistrationModal
          userId={userId}
          onComplete={handleRegistrationComplete}
        />
      )}

      <PortalLayout role="trainee" title={course.title}>
        <div className="space-y-6">
          {/* رأس الصفحة */}
          <div className="flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/courses")}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowRight className="h-4 w-4" />
                الدورات
              </Button>
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground truncate max-w-xs">
                {course.title}
              </span>
            </div>

            {/* بيانات المتدرب */}
            {user && (
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">
                  {user.name || user.employeeNumber}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">
                  {user.employeeNumber}
                </span>
                <Button variant="ghost" size="sm" 
                  onClick={() => setShowRegistration(true)}
                  className="text-primary hover:underline text-xs ms-1"
                >
                  تعديل
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* مشغل الفيديو والمحتوى */}
            <div className="lg:col-span-2 space-y-5 animate-in fade-in slide-in-from-bottom-4">
              {/* مشغل الفيديو */}
              {currentLesson ? (
                user.name && user.employeeNumber ? (
                  <VideoPlayer
                    lesson={{ ...currentLesson, courseId }}
                    userId={userId}
                    onCompleted={handleLessonCompleted}
                    initialWatched={
                      courseWatchProgress?.find(
                        (p: any) => Number(p.lessonId) === currentLesson.id
                      )?.watchedSeconds ?? 0
                    }
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Lock className="h-12 w-12 text-primary/50 mx-auto" />
                      <p className="text-muted-foreground font-medium">
                        يرجى تسجيل بياناتك أولاً
                      </p>
                      <Button onClick={() => setShowRegistration(true)}>
                        تسجيل البيانات
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 text-primary/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      لم يتم إضافة دروس بعد
                    </p>
                  </div>
                </div>
              )}

              {/* معلومات الدرس الحالي */}
              {currentLesson && (
                <div className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          درس {activeLesson + 1} من {totalLessons}
                        </Badge>
                        {completedLessonIds.has(currentLesson.id) && (
                          <Badge variant="success" className="text-xs gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            مكتمل
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-foreground mb-1">
                        {currentLesson.title}
                      </h2>
                      {currentLesson.description && (
                        <p className="text-muted-foreground">
                          {currentLesson.description}
                        </p>
                      )}
                    </div>
                    {currentLesson.duration && (
                      <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(currentLesson.duration)}</span>
                      </div>
                    )}
                  </div>

                  {/* التنقل بين الدروس */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setActiveLesson(Math.max(0, activeLesson - 1))
                      }
                      disabled={activeLesson === 0}
                      className="gap-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                      السابق
                    </Button>
                    <span className="text-muted-foreground">
                      {activeLesson + 1} / {totalLessons}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setActiveLesson(
                          Math.min(totalLessons - 1, activeLesson + 1)
                        )
                      }
                      disabled={activeLesson === totalLessons - 1}
                      className="gap-2"
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* معلومات الدورة */}
              <div className="card p-5">
                <h3 className="text-foreground mb-3">عن الدورة</h3>
                {course.description && (
                  <p className="text-muted-foreground mb-4">
                    {course.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  {course.duration && (
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {Math.floor(course.duration / 60)}س{" "}
                        {course.duration % 60}د
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <Play className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {totalLessons} درس
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              {/* إجمالي التقدم */}
              <div className="card p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h5 className="text-foreground"> 
                    تقدمك في الدورة
                  </h5>
                  <strong className="text-2xl font-bold leading-none text-primary">
                    {overallProgress}%
                  </strong>
                </div>
                <Progress value={overallProgress} className="h-2 mb-2" />
                <p className="text-center text-sm text-muted-foreground">
                  {completedCount} من {totalLessons} درس مكتمل
                </p>
                {overallProgress === 100 && (
                  <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg text-center">
                    <Award className="h-6 w-6 text-success-emphasis mx-auto mb-1" />
                    <h6 className="text-success-emphasis">
                      أكملت الدورة! تحقق من المسار للحصول على شهادتك
                    </h6>
                  </div>
                )}
              </div>

              {/* قائمة الدروس */}
              <div className="card overflow-hidden">
                <div className="border-b border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-foreground">محتوى الدورة</h3>
                    <span className="text-xs text-muted-foreground">
                      {totalLessons} دروس
                    </span>
                  </div>
                </div>
                <div className="max-h-[420px] divide-y divide-border overflow-y-auto">
                  {lessons?.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground">
                        لم يتم إضافة دروس بعد
                      </p>
                    </div>
                  ) : (
                    lessons?.map((lesson, index) => {
                      const isCompleted = completedLessonIds.has(lesson.id);
                      const isActive = index === activeLesson;

                      return (
                        <Button
                          variant="ghost"
                          key={lesson.id}
                          onClick={() => setActiveLesson(index)}
                          className={cn(
                            "h-auto w-full justify-start rounded-none p-3.5 text-start transition-all sm:p-4",
                            isActive
                              ? "border-s-2 border-primary bg-primary/10"
                              : "border-s-2 border-transparent hover:bg-muted/50",
                            "cursor-pointer"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-success-emphasis" />
                            ) : isActive ? (
                              <Play className="h-4 w-4 text-primary fill-primary" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                "truncate text-sm font-semibold",
                                isActive ? "text-primary" : "text-foreground"
                              )}
                            >
                              {lesson.title}
                            </p>
                            {lesson.duration && (
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </div>
                        </Button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* تنبيه القواعد */}
              <div className="space-y-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/15">
                    <Shield className="size-4 text-warning-emphasis" />
                  </div>
                  <h5 className="text-warning-emphasis">
                    قواعد الاعتماد
                  </h5>
                </div>
                <ul className="space-y-2 text-xs leading-6 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-warning-emphasis">•</span>
                    يجب مشاهدة كل فيديو كاملاً
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-warning-emphasis">•</span>
                    لا يُسمح بتسريع الفيديو
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-warning-emphasis">•</span>
                    لا يُحتسب التخطي في الإنجاز
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-warning-emphasis">•</span>
                    الشهادة تُمنح عند إكمال المسار 100%
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </PortalLayout>
    </>
  );
}
