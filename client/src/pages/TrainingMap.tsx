import { useState, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEPARTMENTS = [
  { id: 0, name: "جميع الإدارات" },
  { id: 1, name: "إدارة الخدمات المشتركة" },
  { id: 2, name: "إدارة التشغيل" },
  { id: 3, name: "إدارة المبيعات" },
  { id: 4, name: "إدارة المالية" },
  { id: 5, name: "إدارة الصيانة والمرافق" },
];

const LEVEL_LABELS: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  beginner: { label: "مبتدئ", variant: "success" },
  intermediate: { label: "متوسط", variant: "warning" },
  advanced: { label: "متقدم", variant: "destructive" },
};

const CONTENT_TYPE_ICONS: Record<string, string> = {
  video: "🎬",
  pdf: "📄",
  quiz: "❓",
  case: "💼",
};

export default function TrainingMap() {
  const [selectedDept, setSelectedDept] = useState(0);
  const [search, setSearch] = useState("");
  const [filterRequired, setFilterRequired] = useState<
    "all" | "required" | "optional"
  >("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data: stats } = trpc.trainingMap.getStats.useQuery();
  const { data: courses = [], isLoading } = trpc.trainingMap.getAll.useQuery({
    departmentId: selectedDept > 0 ? selectedDept : undefined,
    isRequired:
      filterRequired === "all" ? undefined : filterRequired === "required",
  });

  const filtered = useMemo(() => {
    return courses.filter(c => {
      if (
        search &&
        !c.title.includes(search) &&
        !c.targetRole.includes(search) &&
        !c.category.includes(search)
      )
        return false;
      if (filterLevel !== "all" && c.level !== filterLevel) return false;
      return true;
    });
  }, [courses, search, filterLevel]);

  // تجميع حسب المسار
  const groupedByPath = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(c => {
      const key = `${c.departmentName} - ${c.pathName}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [filtered]);

  return (
    <PortalLayout role="trainee" title="الخارطة التدريبية">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-900 to-blue-700 py-10 px-6">
        <h1 className="mb-2 text-white">🗺️ الخارطة التدريبية لـ NewLine</h1>
        <p className="text-white/85">
          خارطة تدريبية متكاملة بمستوى أكاديميات DHL وMaersk وAmazon
        </p>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            {[
              { label: "إجمالي الدورات", value: stats.total, icon: "📚" },
              { label: "إلزامية", value: stats.mandatory, icon: "📌" },
              { label: "اختيارية", value: stats.optional, icon: "📋" },
              { label: "الإدارات", value: stats.departments, icon: "🏢" },
              { label: "المسارات", value: stats.paths, icon: "🗺️" },
              {
                label: "ساعات التدريب",
                value: Math.round((stats.totalMinutes || 0) / 60),
                icon: "⏱️",
              },
            ].map(s => (
              <div key={s.label} className="card p-3 text-center">
                <div className="text-2xl">{s.icon}</div>
                <div className="text-2xl font-bold text-card-foreground">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
          <Input
            placeholder="🔍 ابحث في الدورات..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            value={String(selectedDept)}
            onValueChange={v => setSelectedDept(Number(v))}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="الإدارة" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(d => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterRequired}
            onValueChange={v =>
              setFilterRequired(v as "all" | "required" | "optional")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="required">إلزامية فقط</SelectItem>
              <SelectItem value="optional">اختيارية فقط</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المستويات</SelectItem>
              <SelectItem value="beginner">مبتدئ</SelectItem>
              <SelectItem value="intermediate">متوسط</SelectItem>
              <SelectItem value="advanced">متقدم</SelectItem>
            </SelectContent>
          </Select>
          <div className="ms-auto flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              شبكة
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              جدول
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length} دورة
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            جاري التحميل...
          </div>
        ) : viewMode === "grid" ? (
          // Grid View - grouped by path
          <div className="space-y-8">
            {Object.entries(groupedByPath).map(([pathKey, pathCourses]) => (
              <div key={pathKey}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 bg-primary rounded" />
                  <h2 className="text-lg font-semibold md:text-xl text-foreground">
                    {pathKey}
                  </h2>
                  <Badge variant="outline">{pathCourses.length} دورة</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pathCourses.map(course => {
                    const contentTypes = (() => {
                      try {
                        return JSON.parse(course.contentTypes);
                      } catch {
                        return [];
                      }
                    })();
                    const levelInfo = LEVEL_LABELS[course.level] || {
                      label: course.level,
                      variant: "secondary" as const,
                    };
                    return (
                      <Card
                        key={course.id}
                        className={`hover:shadow-md transition-shadow ${course.isRequired ? "border-primary/30" : ""}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-semibold text-card-foreground leading-relaxed">
                              {course.title}
                            </CardTitle>
                            {course.isRequired ? (
                              <Badge className="text-xs shrink-0">إلزامي</Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                اختياري
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1 mb-3">
                            <Badge variant={levelInfo.variant}>
                              {levelInfo.label}
                            </Badge>
                            <Badge variant="outline">
                              ⏱ {course.duration} د
                            </Badge>
                            <Badge variant="secondary">{course.category}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>👤 {course.targetRole}</span>
                            <div className="flex gap-1">
                              {contentTypes.map((ct: string) => (
                                <span key={ct} title={ct}>
                                  {CONTENT_TYPE_ICONS[ct] || ct}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-primary font-medium">
                            🔗 {course.source}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="text-start">الدورة</TableHead>
                  <TableHead className="text-start">الإدارة</TableHead>
                  <TableHead className="text-start">المسار</TableHead>
                  <TableHead className="text-start">
                    الوظيفة المستهدفة
                  </TableHead>
                  <TableHead className="text-start">المستوى</TableHead>
                  <TableHead className="text-start">المدة</TableHead>
                  <TableHead className="text-start">النوع</TableHead>
                  <TableHead className="text-start">المصدر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((course, i) => {
                  const levelInfo = LEVEL_LABELS[course.level] || {
                    label: course.level,
                    variant: "secondary" as const,
                  };
                  return (
                    <TableRow
                      key={course.id}
                      className={i % 2 === 0 ? "bg-card" : "bg-muted/50"}
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {course.title}
                        </div>
                        {course.isRequired && (
                          <Badge className="mt-1 text-xs">إلزامي</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {course.departmentName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {course.pathName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {course.targetRole}
                      </TableCell>
                      <TableCell>
                        <Badge variant={levelInfo.variant}>
                          {levelInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {course.duration} د
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {course.category}
                      </TableCell>
                      <TableCell>
                        <a
                          href={course.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {course.source}
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
