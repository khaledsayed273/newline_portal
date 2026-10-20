import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEVEL_LABELS: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  beginner: { label: "مبتدئ", variant: "success" },
  intermediate: { label: "متوسط", variant: "warning" },
  advanced: { label: "متقدم", variant: "destructive" },
};

const CONTENT_TYPE_ICONS: Record<string, string> = {
  video: "🎬 فيديو",
  pdf: "📄 PDF",
  course: "📚 دورة",
  article: "📰 مقال",
  tool: "🛠️ أداة",
  platform: "🌐 منصة",
};

export default function TrainingLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [page, setPage] = useState(1);

  const { data: stats } = trpc.library.getStats.useQuery();
  const { data: categories = [] } = trpc.library.getCategories.useQuery();
  const { data: sources = [] } = trpc.library.getSources.useQuery();
  const { data, isLoading } = trpc.library.getAll.useQuery({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    source: selectedSource !== "all" ? selectedSource : undefined,
    search: search || undefined,
    page,
    limit: 24,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleSourceChange = (value: string) => {
    setSelectedSource(value);
    setPage(1);
  };

  return (
    <PortalLayout role="trainee" title="المكتبة التدريبية">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-900 to-emerald-700 py-10 px-6">
        <h1 className="mb-2 text-white">📚 المكتبة التدريبية العربية</h1>
        <p className="text-white/85">
          مصادر تدريبية عربية مجانية مصنفة من أفضل المنصات
        </p>
        {stats && (
          <div className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4">
            {[
              { label: "إجمالي المصادر", value: stats.total, icon: "📚" },
              { label: "مجانية", value: stats.freeCount, icon: "🎁" },
              { label: "المصادر", value: stats.sources, icon: "🔗" },
              { label: "التصنيفات", value: stats.categories, icon: "📂" },
            ].map(s => (
              <div key={s.label} className="card p-3 text-center">
                <div className="text-2xl">{s.icon}</div>
                <h2 className="text-card-foreground">
                  {s.value}
                </h2>
                <h6 className="text-muted-foreground">{s.label}</h6>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
          <Input
            placeholder="🔍 ابحث في المكتبة..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-72"
          />
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.category} value={c.category}>
                  {c.category} ({c.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSource} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="المصدر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المصادر</SelectItem>
              {sources.map(s => (
                <SelectItem key={s.source} value={s.source}>
                  {s.source} ({s.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(selectedCategory !== "all" ||
            selectedSource !== "all" ||
            search) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSource("all");
                setSearch("");
                setPage(1);
              }}
            >
              مسح الفلاتر ✕
            </Button>
          )}
          {data && (
            <span className="text-muted-foreground ms-auto">
              {data.total}مصدر
            </span>
          )}
        </div>

        {/* Category Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.slice(0, 10).map(c => (
            <Button variant="ghost" 
              key={c.category}
              onClick={() =>
                handleCategoryChange(
                  selectedCategory === c.category ? "all" : c.category
                )
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCategory === c.category ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}
            >
              {c.category} <span className="opacity-70">({c.count})</span>
            </Button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            جاري التحميل...
          </div>
        ) : !data?.items.length ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-muted-foreground">لا توجد نتائج مطابقة</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {data.items.map(item => {
                const levelInfo = LEVEL_LABELS[item.level] || {
                  label: item.level,
                  variant: "secondary" as const,
                };
                const tags = (() => {
                  try {
                    return JSON.parse(item.tags || "[]");
                  } catch {
                    return [];
                  }
                })();
                return (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold text-card-foreground leading-relaxed group-hover:text-primary transition-colors">
                          {item.title}
                        </CardTitle>
                        {item.isFree ? (
                          <Badge variant="success" className="text-xs shrink-0">
                            مجاني
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs shrink-0">
                            مدفوع
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {item.description && (
                        <h6 className="text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </h6>
                      )}
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant={levelInfo.variant}>
                          {levelInfo.label}
                        </Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                        {item.contentType && (
                          <Badge variant="info">
                            {CONTENT_TYPE_ICONS[item.contentType] ||
                              item.contentType}
                          </Badge>
                        )}
                        {item.duration > 0 && (
                          <Badge variant="outline">⏱ {item.duration} د</Badge>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-medium">
                          🔗 {item.source}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full hover:bg-primary/90 transition-colors"
                        >
                          زيارة المصدر ←
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  السابق
                </Button>
                <span className="flex items-center px-4 text-muted-foreground">
                  صفحة {page} من {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === data.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
}
