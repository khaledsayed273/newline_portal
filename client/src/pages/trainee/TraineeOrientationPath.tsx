import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { TONE_STYLES, TONE_BADGE, type Tone } from "@/lib/toneStyles";
import {
  BookOpen,
  Shield,
  Car,
  Globe,
  FileText,
  Award,
  ClipboardList,
  Heart,
  Download,
  Eye,
  X,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OrientationFile {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  tone: Tone;
  url: string;
  category: string;
  badge?: string;
}

const orientationFiles: OrientationFile[] = [
  {
    id: "employee_guide",
    title: "دليل الموظفين",
    subtitle: "المرجع الشامل للموظف الجديد",
    description:
      "دليل شامل يحتوي على جميع السياسات والإجراءات وحقوق وواجبات الموظف في نيولاين",
    icon: <BookOpen className="w-8 h-8" />,
    tone: "info" as const,
    url: "/manus-storage/employee_guide_b3b3bfa7.pdf",
    category: "الأدلة الأساسية",
    badge: "مهم",
  },
  {
    id: "employee_instructions",
    title: "دليل إرشادات الموظف",
    subtitle: "التعليمات والإرشادات اليومية",
    description: "إرشادات عملية للتعامل مع بيئة العمل والزملاء والمهام اليومية",
    icon: <ClipboardList className="w-8 h-8" />,
    tone: "primary" as const,
    url: "/manus-storage/employee_instructions_dfd9f019.pdf",
    category: "الأدلة الأساسية",
  },
  {
    id: "attendance_system",
    title: "نظام الحضور والانصراف",
    subtitle: "سياسة الدوام الرسمي",
    description:
      "شرح تفصيلي لنظام الحضور والانصراف وأوقات الدوام والإجراءات المتبعة",
    icon: <ClipboardList className="w-8 h-8" />,
    tone: "success" as const,
    url: "/manus-storage/attendance_system_7954f4c1.pdf",
    category: "الأنظمة والسياسات",
    badge: "محدّث يوليو 2026",
  },
  {
    id: "quality_policy",
    title: "سياسة الجودة",
    subtitle: "معايير الجودة والتميز",
    description:
      "سياسة الجودة المعتمدة في نيولاين ومعايير التميز في تقديم الخدمات",
    icon: <Award className="w-8 h-8" />,
    tone: "warning" as const,
    url: "/manus-storage/quality_policy_92036e0c.pdf",
    category: "الأنظمة والسياسات",
  },
  {
    id: "drivers_guide",
    title: "دليل السائقين",
    subtitle: "إرشادات وأنظمة قيادة المركبات",
    description:
      "دليل شامل لسائقي نيولاين يتضمن قواعد السلامة والإجراءات التشغيلية وسياسات الشركة",
    icon: <Car className="w-8 h-8" />,
    tone: "success" as const,
    url: "/manus-storage/drivers_guide_94658136.pdf",
    category: "الأدلة المتخصصة",
  },
  {
    id: "jisr_guide_ar",
    title: "شرح برنامج جسر (عربي)",
    subtitle: "دليل استخدام منصة جسر",
    description: "شرح تفصيلي لاستخدام منصة جسر للموارد البشرية باللغة العربية",
    icon: <Globe className="w-8 h-8" />,
    tone: "secondary" as const,
    url: "/manus-storage/jisr_guide_ar_38d75421.pdf",
    category: "منصة جسر",
  },
  {
    id: "jisr_guide_en",
    title: "شرح برنامج جسر (إنجليزي)",
    subtitle: "Jisr Platform Guide - English",
    description: "Detailed guide for using the Jisr HR platform in English",
    icon: <Globe className="w-8 h-8" />,
    tone: "info" as const,
    url: "/manus-storage/jisr_guide_en_15e1d4c3.pdf",
    category: "منصة جسر",
  },
  {
    id: "jisr_guide_ur",
    title: "شرح برنامج جسر (أردو)",
    subtitle: "جسر پلیٹ فارم گائیڈ - اردو",
    description: "منصة جسر للموارد البشرية - دليل الاستخدام باللغة الأردية",
    icon: <Globe className="w-8 h-8" />,
    tone: "destructive" as const,
    url: "/manus-storage/jisr_guide_ur_a0ac4a32.pdf",
    category: "منصة جسر",
  },
  {
    id: "initiatives_booklet",
    title: "كتيّب مبادرات كفاءة",
    subtitle: "مبادرات تطوير الكفاءة التشغيلية",
    description:
      "كتيّب يشرح مبادرات كفاءة وبرامج التطوير التشغيلي المعتمدة في الشركة",
    icon: <Shield className="w-8 h-8" />,
    tone: "warning" as const,
    url: "/manus-storage/initiatives_booklet_450b1016.pdf",
    category: "المبادرات والتطوير",
  },
  {
    id: "cooperative_hospitals",
    title: "دليل مستشفيات التعاونية",
    subtitle: "التأمين الصحي والرعاية الطبية",
    description:
      "دليل الموظفين لمستشفيات التعاونية يتضمن التغطية الطبية والخدمات الصحية المتاحة",
    icon: <Heart className="w-8 h-8" />,
    tone: "destructive" as const,
    url: "/manus-storage/cooperative_hospitals_guide_2b49debc.pdf",
    category: "الرعاية الصحية",
  },
];

const categories = [
  "الكل",
  "الأدلة الأساسية",
  "الأنظمة والسياسات",
  "الأدلة المتخصصة",
  "منصة جسر",
  "المبادرات والتطوير",
  "الرعاية الصحية",
];

//======= بيانات الهيكل التنظيمي =======
const orgDepartments = [
  {
    id: "executive",
    num: "01",
    name: "الإدارة التنفيذية",
    color: "#1e3a8a",
    bg: "#dbeafe",
    units: ["وحدة الدعم الفني والإداري", "وحدة السكرتارية التنفيذية"],
    staff: [
      "رئيس مجلس الإدارة",
      "نائب رئيس مجلس الإدارة",
      "الرئيس التنفيذي",
      "نائب الرئيس التنفيذي",
      "مدير مكتب الرئيس التنفيذي",
      "أخصائي دعم فني",
      "أخصائي دعم إداري",
      "سكرتير تنفيذي",
      "مساعد إداري",
    ],
    goals: [
      "تحقيق الرؤية والاستراتيجية الشاملة للشركة",
      "ضمان الحوكمة والامتثال للسياسات والأنظمة",
      "متابعة الأداء العام واتخاذ القرارات الاستراتيجية",
      "تعزيز ثقافة الجودة والشفافية والابتكار",
    ],
  },
  {
    id: "operations",
    num: "02",
    name: "إدارة التشغيل",
    color: "#1d4ed8",
    bg: "#dbeafe",
    units: ["قسم الحركة", "قسم المشاريع", "قسم الجودة"],
    staff: [
      "مدير إدارة التشغيل",
      "رئيس قسم الحركة",
      "نائب رئيس قسم الحركة",
      "مشرف حركة أسطول",
      "مراقب حركة أسطول",
      "منسق حركة أسطول",
      "سائق 4",
      "سائق 3",
      "سائق 2",
      "سائق 1",
      "رئيس قسم المشاريع",
      "نائب رئيس قسم المشاريع",
      "أخصائي أول مشاريع",
      "أخصائي مشاريع",
      "مراقب مشاريع",
      "منسق مشاريع",
      "رئيس قسم الجودة",
      "أخصائي جودة أول",
      "أخصائي جودة",
      "مراقب جودة",
    ],
    goals: [
      "تقديم خدمات تشغيلية آمنة وفعالة تلبي متطلبات العملاء",
      "تحسين كفاءة العمليات التشغيلية وتقليل التكاليف",
      "ضمان الالتزام بمعايير الجودة والسلامة",
      "تحقيق أعلى مستويات الجاهزية والإنتاجية للأسطول والعمليات",
    ],
  },
  {
    id: "sales",
    num: "03",
    name: "إدارة المبيعات",
    color: "#0369a1",
    bg: "#e0f2fe",
    units: ["قسم المبيعات", "قسم خدمة العملاء"],
    staff: [
      "مدير إدارة المبيعات",
      "رئيس قسم المبيعات",
      "مشرف المبيعات",
      "أخصائي المبيعات",
      "مندوب المبيعات",
      "رئيس قسم خدمة العملاء",
      "أخصائي خدمة العملاء",
      "مراقب خدمة العملاء",
      "منسق خدمة العملاء",
    ],
    goals: [
      "تحقيق نمو مستدام في الإيرادات وتوسيع قاعدة العملاء",
      "تطوير خطط تسويقية ومبيعات فعالة لرفع الحصة السوقية",
      "تقديم تجربة مميزة للعملاء وتعزيز الولاء",
      "تحقيق أهداف المبيعات بأعلى مستويات الربحية",
    ],
  },
  {
    id: "maintenance",
    num: "04",
    name: "إدارة الصيانة والمرافق",
    color: "#0f766e",
    bg: "#ccfbf1",
    units: ["قسم الصيانة", "قسم المرافق", "قسم الموردين"],
    staff: [
      "مدير إدارة الصيانة",
      "رئيس قسم الصيانة",
      "مشرف أول الصيانة",
      "مشرف الصيانة",
      "مراقب الصيانة",
      "منسق الصيانة",
      "ميكانيكي",
      "مساعد ميكانيكي",
      "كهربائي",
      "بنشري",
      "فني",
      "مشرف سكن",
      "أمين مستودع",
      "أخصائي علاقات موردين",
      "منسق علاقات موردين",
    ],
    goals: [
      "ضمان جاهزية الأصول والمرافق واستمرارية العمل بكفاءة",
      "تنفيذ خطط الصيانة الوقائية والعلاجية بكفاءة",
      "توفير بيئة عمل آمنة ومريحة للعاملين",
      "إدارة الموردين والمخزون لضمان التوافر والجودة",
    ],
  },
  {
    id: "shared",
    num: "05",
    name: "إدارة الخدمات المشتركة",
    color: "#6d28d9",
    bg: "#ede9fe",
    units: ["قسم الموارد البشرية", "قسم التقنية"],
    staff: [
      "مدير إدارة الخدمات المشتركة",
      "رئيس قسم الموارد البشرية",
      "مشرف موارد بشرية",
      "أخصائي أول موارد بشرية",
      "أخصائي موارد بشرية",
      "منسق موارد بشرية",
      "مسؤول السلامة",
      "رئيس قسم التقنية",
      "خبير تقنية معلومات",
      "أخصائي تقنية معلومات",
      "فني تقنية معلومات",
    ],
    goals: [
      "تمكين الإدارات الأخرى من خلال خدمات إدارية وتقنية فعالة",
      "إدارة الموارد البشرية وتنمية الكفاءات وتحسين بيئة العمل",
      "توفير بنية تقنية معلومات موثوقة وآمنة تدعم الأعمال",
      "ضمان سلامة الموظفين والالتزام بمعايير السلامة",
    ],
  },
  {
    id: "finance",
    num: "06",
    name: "الإدارة المالية",
    color: "#b45309",
    bg: "#fef3c7",
    units: ["قسم المحاسبة", "قسم المالية"],
    staff: [
      "مدير الإدارة المالية",
      "رئيس قسم المحاسبة",
      "نائب رئيس قسم المحاسبة",
      "محاسب أول",
      "محاسب رئيسي",
      "محاسب",
      "مساعد محاسب",
      "رئيس قسم المالية",
      "نائب رئيس قسم المالية",
      "مدقق مالي",
      "محاسب تكاليف",
      "منسق مالي",
    ],
    goals: [
      "إدارة الموارد المالية بكفاءة وشفافية لتحقيق الاستدامة",
      "ضمان دقة التقارير المالية والامتثال للمعايير",
      "تحسين التدفقات النقدية وضبط التكاليف",
      "دعم متخذ القرار بالبيانات المالية الدقيقة والتحليلات",
    ],
  },
];

export default function TraineeOrientationPath() {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [previewFile, setPreviewFile] = useState<OrientationFile | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"files" | "org">("files");

  const filtered =
    activeCategory === "الكل"
      ? orientationFiles
      : orientationFiles.filter(f => f.category === activeCategory);

  return (
    <PortalLayout role="trainee" title="المسار التوجيهي">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-blue-700 to-blue-900 py-10 px-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl text-white">
              المسار التوجيهي
            </h1>
            <p className="text-white/85 text-xs leading-6 md:text-sm">
              دليلك الشامل للانطلاق في نيولاين
            </p>
          </div>
        </div>
        <p className="text-white/85 text-sm max-w-2xl mt-4">
          مجموعة من الأدلة والوثائق الرسمية التي تساعدك على فهم بيئة العمل،
          الأنظمة، والسياسات المعتمدة في شركة نيولاين للخدمات اللوجستية.
        </p>
        <div className="flex gap-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {orientationFiles.length}
            </div>
            <div className="text-white/80 text-xs">وثيقة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {categories.length - 1}
            </div>
            <div className="text-white/80 text-xs">قسم</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">6</div>
            <div className="text-white/80 text-xs">إدارة</div>
          </div>
        </div>
      </div>

      <div>
        {/* تبديل بين الملفات والهيكل */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "files" ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-primary"}`}
          >
            <FileText className="w-4 h-4" />
            الوثائق والأدلة
          </button>
          <button
            onClick={() => setActiveTab("org")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "org" ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-primary"}`}
          >
            <Building2 className="w-4 h-4" />
            الهيكل الداخلي
          </button>
        </div>

        {/* تبويب الملفات */}
        {activeTab === "files" && (
          <div>
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-primary"}`}
                >
                  {cat}
                  {cat !== "الكل" && (
                    <span
                      className={`ms-1 text-xs ${activeCategory === cat ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      ({orientationFiles.filter(f => f.category === cat).length}
                      )
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(file => (
                <div
                  key={file.id}
                  className={`bg-card rounded-2xl border-2 ${TONE_STYLES[file.tone].line} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group`}
                >
                  <div className={`p-5 ${TONE_STYLES[file.tone].panel}`}>
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center ${TONE_STYLES[file.tone].chip} group-hover:scale-110 transition-transform duration-300`}
                      >
                        {file.icon}
                      </div>
                      {file.badge && (
                        <Badge
                          variant={TONE_BADGE[file.tone]}
                          size="sm"
                          className="shadow-sm"
                        >
                          {file.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3">
                      <h3 className="text-base font-semibold md:text-lg text-foreground leading-tight">
                        {file.title}
                      </h3>
                      <p
                        className={`text-sm font-medium mt-0.5 ${TONE_STYLES[file.tone].text}`}
                      >
                        {file.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {file.description}
                    </p>
                    <div className="flex items-center gap-1 mb-4">
                      <Badge variant={TONE_BADGE[file.tone]} size="sm">
                        {file.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 ${TONE_STYLES[file.tone].line} ${TONE_STYLES[file.tone].text} font-medium text-sm transition-colors duration-200 hover:bg-muted`}
                      >
                        <Eye className="w-4 h-4" />
                        معاينة
                      </button>
                      <button
                        onClick={() => window.open(file.url, "_blank")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${TONE_STYLES[file.tone].solid}`}
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>لا توجد ملفات في هذا القسم</p>
              </div>
            )}
          </div>
        )}

        {/*تبويب الهيكل الداخلي*/}
        {activeTab === "org" && (
          <div className="space-y-4">
            {/*صورة الهيكل الكاملة*/}
            <div className="bg-card rounded-2xl overflow-hidden border border-primary/20 shadow-sm">
              <div className="bg-primary/10 px-5 py-3 flex items-center justify-between border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    الهيكل التنظيمي الكامل – 2026/2029
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/assets/org-structure.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تحميل PDF الهيكلة الإدارية
                  </a>
                  <a
                    href="/assets/org-structure.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-primary/20 text-primary text-xs font-bold hover:bg-muted transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    معاينة
                  </a>
                </div>
              </div>
              <div className="p-4">
                <img
                  src="/assets/org-structure.png"
                  alt="الهيكل التنظيمي لشركة نيولاين"
                  className="w-full rounded-xl"
                  style={{ maxHeight: "700px", objectFit: "contain" }}
                />
              </div>
            </div>

            {/* بطاقات الإدارات */}
            <div className="grid grid-cols-1 gap-3">
              {orgDepartments.map(dept => (
                <div
                  key={dept.id}
                  className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-start hover:bg-muted transition-colors"
                    onClick={() =>
                      setExpandedDept(expandedDept === dept.id ? null : dept.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: dept.color }}
                      >
                        {dept.num}
                      </div>
                      <div className="text-start">
                        <div className="text-sm font-medium text-foreground">
                          {dept.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {dept.units.join(" • ")}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedDept === dept.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {expandedDept === dept.id && (
                    <div className="px-4 pb-4 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <div
                            className="text-xs font-bold mb-2 px-2 py-1 rounded-lg inline-block"
                            style={{ background: dept.bg, color: dept.color }}
                          >
                            الوظائف والمسميات
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {dept.staff.map((s, i) => (
                              <span
                                key={i}
                                className="text-xs px-2.5 py-1 rounded-full font-medium"
                                style={{
                                  background: dept.bg,
                                  color: dept.color,
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-xs font-bold mb-2 px-2 py-1 rounded-lg inline-block"
                            style={{ background: dept.bg, color: dept.color }}
                          >
                            الأهداف
                          </div>
                          <ul className="space-y-1.5">
                            {dept.goals.map((g, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ background: dept.color }}
                                />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* القيم الأساسية */}
            <div className="bg-gradient-to-l from-blue-700 to-blue-900 rounded-2xl p-5">
              <h3 className="text-white text-center mb-4">قيمنا الأساسية</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {["سلامة", "جودة", "موثوقية", "ابتكار", "الالتزام"].map(v => (
                  <div
                    key={v}
                    className="bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-full"
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-border"
            onClick={e => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 flex items-center justify-between ${TONE_STYLES[previewFile.tone].panel}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center ${TONE_STYLES[previewFile.tone].chip}`}
                >
                  {previewFile.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold md:text-lg text-foreground">
                    {previewFile.title}
                  </h3>
                  <p
                    className={`text-xs ${TONE_STYLES[previewFile.tone].text}`}
                  >
                    {previewFile.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(previewFile.url, "_blank")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${TONE_STYLES[previewFile.tone].solid}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  تحميل
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="w-8 h-8 rounded-lg bg-card/70 hover:bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`${previewFile.url}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full"
                style={{ minHeight: "70vh" }}
                title={previewFile.title}
              />
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
