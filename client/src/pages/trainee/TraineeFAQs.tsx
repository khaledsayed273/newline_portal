import { Button } from "@/components/ui/button";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function TraineeFAQs() {
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: departments } = trpc.departments.list.useQuery();
  const { data: faqs, isLoading } = trpc.faqs.list.useQuery({
    departmentId: selectedDept,
  });

  return (
    <PortalLayout role="trainee" title="الأسئلة الشائعة">
      <div className="space-y-6">
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

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-14 animate-pulse" />
            ))}
          </div>
        ) : faqs?.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <HelpCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد أسئلة</h3>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {faqs?.map((faq, i) => (
              <div key={faq.id} className="card overflow-hidden">
                <Button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-start hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-primary flex-shrink-0 ms-3 transition-transform",
                      openFaq === faq.id && "rotate-180"
                    )}
                  />
                </Button>
                {openFaq === faq.id && (
                  <div className="px-4 pb-4 text-muted-foreground border-t border-border pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
