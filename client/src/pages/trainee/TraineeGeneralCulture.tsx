import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TONE_STYLES } from "@/lib/toneStyles";
import {
  FileText,
  Play,
  BookOpen,
  Globe,
  Cpu,
  BarChart2,
  Presentation,
  Users,
  Scale,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";

//===== بيانات المحتوى =====
const SECTIONS = [
  {
    id: "excel",
    label: "Excel",
    icon: BarChart2,
    tone: "success" as const,
    badgeVariant: "success" as const,
    description: "تعلّم برنامج Excel من الصفر حتى الاحتراف",
    videos: [
      {
        id: "lcStF5zE3KQ",
        title: "تعلم Excel من الصفر للاحتراف في 5 ساعات",
        duration: "5 ساعات",
      },
      {
        id: "tBZ6LSil3-0",
        title: "شرح برنامج Excel كامل بكل سهولة 2024",
        duration: "3 ساعات",
      },
      {
        id: "Go1mHUzCr38",
        title: "تعلم Excel بالكامل - خطوة بخطوة للمبتدئين",
        duration: "2 ساعة",
      },
    ],
    pdf: {
      url: "https://cc.uomustansiriyah.edu.iq/cc-Platform/Files/kafaa_excel.pdf",
      title: "دليل Excel الشامل للمبتدئين",
    },
  },
  {
    id: "powerpoint",
    label: "PowerPoint",
    icon: Presentation,
    tone: "warning" as const,
    badgeVariant: "warning" as const,
    description: "صمّم عروضاً تقديمية احترافية ومؤثرة",
    videos: [
      {
        id: "wrNC2GyUtIU",
        title: "شرح PowerPoint كامل بكل سهولة 2024",
        duration: "2.5 ساعة",
      },
      {
        id: "MoidpS7oop0",
        title: "إنشاء بوربوينت احترافي بأزرار تفاعلية متحركة",
        duration: "45 دقيقة",
      },
      {
        id: "_yWJTkE0WBg",
        title: "أساسيات PowerPoint للمبتدئين",
        duration: "1 ساعة",
      },
    ],
    pdf: {
      url: "https://cc.uomustansiriyah.edu.iq/cc-Platform/Files/kafaa_Powerpoint.pdf",
      title: "دليل PowerPoint الاحترافي",
    },
  },
  {
    id: "ai",
    label: "الذكاء الاصطناعي",
    icon: Cpu,
    tone: "secondary" as const,
    badgeVariant: "secondary" as const,
    description: "استخدم أدوات AI وChatGPT في عملك اليومي",
    videos: [
      {
        id: "sJcXdDk-D4A",
        title: "ChatGPT للمبتدئين والطلاب - الجزء الأول",
        duration: "1 ساعة",
      },
      {
        id: "sFVYR_KalBI",
        title: "دليلك الشامل لـ ChatGPT من الصفر",
        duration: "2 ساعة",
      },
      {
        id: "6ew3Irn7h9I",
        title: "تعلم الذكاء الاصطناعي من الصفر - الدرس 1",
        duration: "1.5 ساعة",
      },
    ],
    pdf: {
      url: "https://www.hrdf.org.sa/media/pn1bh3vm/%D9%86%D8%B8%D8%A7%D9%85-%D8%A7%D9%84%D8%B9%D9%85%D9%84.pdf",
      title: "دليل استخدام الذكاء الاصطناعي في بيئة العمل",
    },
  },
  {
    id: "english",
    label: "اللغة الإنجليزية",
    icon: Globe,
    tone: "info" as const,
    badgeVariant: "info" as const,
    description: "طوّر مهاراتك في اللغة الإنجليزية للعمل",
    videos: [
      {
        id: "sAdA8XQhK70",
        title: "أعطيني 3 ساعات وبخليك تتكلم إنجليزي من الصفر",
        duration: "3 ساعات",
      },
      {
        id: "vdt0XH1qMDA",
        title: "أول درس في تعلم تحدث اللغة الإنجليزية من الصفر",
        duration: "1 ساعة",
      },
      {
        id: "mP1viG7l3bA",
        title: "كورس اللغة الإنجليزية للمبتدئين - الأساسيات",
        duration: "2 ساعة",
      },
    ],
    pdf: {
      url: "https://elearning.marsad.dz/wp-content/uploads/2024/01/%D9%85%D9%87%D8%A7%D8%B1%D8%A7%D8%AA-%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84.pdf",
      title: "مهارات التواصل باللغة الإنجليزية",
    },
  },
  {
    id: "vision2030",
    label: "رؤية 2030",
    icon: BookOpen,
    tone: "primary" as const,
    badgeVariant: "default" as const,
    description: "رؤية المملكة 2030 وقطاع اللوجستيات",
    videos: [
      {
        id: "96i_0KDw7Hg",
        title: "القطاع اللوجستي في رؤية 2030",
        duration: "20 دقيقة",
      },
      {
        id: "6-7mZR1_q10",
        title: "السعودية: تحول نوعي للقطاع اللوجستي",
        duration: "15 دقيقة",
      },
      {
        id: "Vpx5bniOqqk",
        title: "59 منطقة لوجستية ضمن مستهدفات رؤية 2030",
        duration: "10 دقائق",
      },
    ],
    pdf: {
      url: "https://exporters.sa/wp-content/uploads/2024/02/%D9%85%D8%AC%D9%84%D8%A9-%D8%AC%D9%85%D8%B9%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%B5%D8%AF%D8%B1%D9%8A%D9%8A%D9%86-%D8%A7%D9%84%D8%B5%D9%86%D8%A7%D8%B9%D9%8A%D9%8A%D9%86-1-1.pdf",
      title: "مجلة المصدرين الصناعيين - اللوجستيات",
    },
  },
  {
    id: "communication",
    label: "مهارات التواصل",
    icon: Users,
    tone: "destructive" as const,
    badgeVariant: "destructive" as const,
    description: "طوّر مهاراتك في التواصل والعمل الجماعي",
    videos: [
      {
        id: "JSe_gC_0Rfo",
        title: "فن التواصل: أنواعه وكيف تطور مهاراتك",
        duration: "30 دقيقة",
      },
      {
        id: "2wOkXGIAyt0",
        title: "مهارات التواصل في بيئة العمل",
        duration: "45 دقيقة",
      },
      {
        id: "e75HmQuDLRk",
        title: "أخلاقيات العمل - الجزء الثاني",
        duration: "25 دقيقة",
      },
    ],
    pdf: {
      url: "https://elearning.marsad.dz/wp-content/uploads/2024/01/%D9%85%D9%87%D8%A7%D8%B1%D8%A7%D8%AA-%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84.pdf",
      title: "دليل مهارات التواصل الفعّال",
    },
  },
  {
    id: "labor",
    label: "نظام العمل",
    icon: Scale,
    tone: "warning" as const,
    badgeVariant: "warning" as const,
    description: "حقوقك وواجباتك في نظام العمل السعودي",
    videos: [
      {
        id: "NdBMYu1UUNc",
        title: "نظام العمل السعودي: دليلك الشامل لحقوقك وواجباتك",
        duration: "1 ساعة",
      },
      {
        id: "1zdVOwUCRzQ",
        title: "هل تأخذ كل حقوقك كموظف؟ نظام العمل السعودي",
        duration: "45 دقيقة",
      },
      {
        id: "2BoYPfrBOAo",
        title: "نظام العمل السعودي: تعريفات ومصطلحات",
        duration: "30 دقيقة",
      },
    ],
    pdf: {
      url: "https://www.hrdf.org.sa/media/pn1bh3vm/%D9%86%D8%B8%D8%A7%D9%85-%D8%A7%D9%84%D8%B9%D9%85%D9%84.pdf",
      title: "نظام العمل السعودي - النص الكامل",
    },
  },
];

export default function TraineeGeneralCulture() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);

  const section = SECTIONS.find(s => s.id === activeSection)!;
  const SectionIcon = section.icon;

  return (
    <PortalLayout role="trainee" title="الثقافة العامة">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          الثقافة العامة
        </h1>
        <p className="text-xs leading-6 md:text-sm text-muted-foreground mt-1">
          مقاطع تعليمية وملفات مرجعية لتطوير مهاراتك المهنية
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const isActive = s.id === activeSection;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                setActiveVideo(null);
                setShowPdf(false);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border",
                isActive
                  ? TONE_STYLES[s.tone].tab
                  : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:shadow-sm"
              )}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right: Videos List */}
        <div className="lg:col-span-1 space-y-3 order-2 lg:order-1">
          {/* Section Header */}
          <div
            className={cn(
              "rounded-2xl border p-4",
              TONE_STYLES[section.tone].panel
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  TONE_STYLES[section.tone].chip
                )}
              >
                <SectionIcon className="h-5 w-5" />
              </div>
              <div>
                <h2
                  className={cn(
                    "text-base font-semibold md:text-lg",
                    TONE_STYLES[section.tone].text
                  )}
                >
                  {section.label}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </div>
          </div>

          {/* Videos */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">
              مقاطع الفيديو
            </p>
            {section.videos.map((video, idx) => (
              <button
                key={video.id}
                onClick={() => {
                  setActiveVideo(video.id);
                  setShowPdf(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border text-start transition-all duration-200",
                  activeVideo === video.id
                    ? cn(TONE_STYLES[section.tone].panel, "shadow-sm")
                    : "bg-card border-border hover:shadow-sm hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                    activeVideo === video.id
                      ? TONE_STYLES[section.tone].chip
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Play className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-snug line-clamp-2",
                      activeVideo === video.id
                        ? TONE_STYLES[section.tone].text
                        : "text-card-foreground"
                    )}
                  >
                    {video.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      الدرس{idx + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {video.duration}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    activeVideo === video.id
                      ? TONE_STYLES[section.tone].text
                      : "text-muted-foreground/50"
                  )}
                />
              </button>
            ))}
          </div>

          {/* PDF */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">
              ملف مرجعي
            </p>
            <button
              onClick={() => {
                setShowPdf(true);
                setActiveVideo(null);
              }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-start transition-all duration-200",
                showPdf
                  ? cn(TONE_STYLES[section.tone].panel, "shadow-sm")
                  : "bg-card border-border hover:shadow-sm hover:border-primary/30"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                  showPdf
                    ? TONE_STYLES[section.tone].chip
                    : "bg-muted text-muted-foreground"
                )}
              >
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold leading-snug line-clamp-2",
                    showPdf
                      ? TONE_STYLES[section.tone].text
                      : "text-card-foreground"
                  )}
                >
                  {section.pdf.title}
                </p>
                <Badge variant={section.badgeVariant} className="mt-1">
                  PDF
                </Badge>
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  showPdf
                    ? TONE_STYLES[section.tone].text
                    : "text-muted-foreground/50"
                )}
              />
            </button>
          </div>
        </div>

        {/* Left: Player / PDF Viewer */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {activeVideo ? (
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%" }}
              >
                <iframe
                  key={activeVideo}
                  src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              {/* Video Info */}
              <div className="p-4 bg-gray-900">
                <p className="text-white font-semibold text-sm">
                  {section.videos.find(v => v.id === activeVideo)?.title}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={section.badgeVariant}>{section.label}</Badge>
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    فتح في YouTube
                  </a>
                </div>
              </div>
            </div>
          ) : showPdf ? (
            <div className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border">
              <div className="flex items-center justify-between p-3 border-b border-border bg-muted">
                <div className="flex items-center gap-2">
                  <FileText
                    className={cn("h-4 w-4", TONE_STYLES[section.tone].text)}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {section.pdf.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={section.pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                      TONE_STYLES[section.tone].solid
                    )}
                  >
                    <ExternalLink className="h-3 w-3" />
                    فتح في نافذة جديدة
                  </a>
                  <button
                    onClick={() => setShowPdf(false)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <iframe
                key={section.pdf.url}
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(section.pdf.url)}&embedded=true`}
                title={section.pdf.title}
                className="w-full"
                style={{ height: "600px" }}
              />
            </div>
          ) : (
            /* Welcome State */
            <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
              <div
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
                  TONE_STYLES[section.tone].solid
                )}
              >
                <SectionIcon className="h-10 w-10" />
              </div>
              <h3 className="text-card-foreground mb-2">{section.label}</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                {section.description}
              </p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => setActiveVideo(section.videos[0].id)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                    TONE_STYLES[section.tone].solid
                  )}
                >
                  <Play className="h-4 w-4" />
                  ابدأ المشاهدة
                </button>
                <button
                  onClick={() => setShowPdf(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-all"
                >
                  <FileText className="h-4 w-4" />
                  عرض الملف المرجعي
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
