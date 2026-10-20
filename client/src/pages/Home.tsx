import {
  BookOpen,
  Zap,
  Briefcase,
  AlertTriangle,
  Map,
  Globe,
  MessageCircle,
  Send,
  Lightbulb,
  BarChart3,
  Award,
} from "lucide-react";
import { Link } from "wouter";
import PortalLayout from "@/components/PortalLayout";

// نفس قائمة الخدمات المستخدمة في الشريط الجانبي
export const PORTAL_SERVICES = [
  { icon: BookOpen, label: "الدورات التدريبية", href: "/courses" },
  { icon: Zap, label: "الدورات السريعة", href: "/quick-courses" },
  {
    icon: Briefcase,
    label: "الأوصاف الوظيفية",
    href: "/job-descriptions",
  },
  { icon: AlertTriangle, label: "سجلات التعثرات", href: "/incidents" },
  { icon: Map, label: "المسار التوجيهي", href: "/training-map" },
  { icon: Globe, label: "الثقافة العامة", href: "/general-culture" },
  { icon: MessageCircle, label: "الاستشارات", href: "/consultations" },
  { icon: Send, label: "الطلبات", href: "/training-request" },
  { icon: Lightbulb, label: "الاقتراحات", href: "/suggestions" },
  { icon: BarChart3, label: "الإحصائيات", href: "/stats" },
  { icon: Award, label: "الشهادات", href: "/certificates" },
];

export default function Home() {
  return (
    <PortalLayout role="trainee" title="الصفحة الرئيسية">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ">
        {PORTAL_SERVICES.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-row items-center justify-end gap-3 rounded-xl bg-primary px-4 py-3.5 text-right shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-[400px]:gap-2 max-[400px]:rounded-lg max-[400px]:px-2 max-[400px]:py-2.5"
          >
            <span className="flex-1 text-start font-extrabold text-primary-foreground">
              {label}
            </span>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 max-[400px]:size-10 max-[400px]:rounded-lg">
              <Icon size={22} className="text-primary-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </PortalLayout>
  );
}
