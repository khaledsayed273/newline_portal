import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

function QuizRunner({
  quiz,
  onFinish,
}: {
  quiz: {
    id: number;
    title: string;
    questions: QuizQuestion[];
    passingScore?: number | null;
    timeLimit?: number | null;
  };
  onFinish: () => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const submitMutation = trpc.quizzes.submit.useMutation({
    onSuccess: () => {
      toast.success("تم تسليم الاختبار بنجاح!");
    },
  });

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const correctCount = answers.filter(
      (a, i) => a === quiz.questions[i]?.correctAnswer
    ).length;
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    const isPassed = finalScore >= (quiz.passingScore ?? 60);
    setScore(finalScore);
    setSubmitted(true);
    submitMutation.mutate({
      quizId: quiz.id,
      answers: answers.map(a => a ?? -1),
      score: finalScore,
      isPassed,
    });
  };

  const question = quiz.questions[currentQ];
  const passingScore = quiz.passingScore ?? 60;
  const isPassed = score >= passingScore;

  if (submitted) {
    return (
      <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4">
        <div
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl",
            isPassed ? "bg-success/10" : "bg-destructive/10"
          )}
        >
          {isPassed ? (
            <Trophy className="h-12 w-12 text-success-emphasis" />
          ) : (
            <XCircle className="h-12 w-12 text-destructive" />
          )}
        </div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground mb-2">
          {isPassed ? "أحسنت! اجتزت الاختبار" : "لم تجتز الاختبار"}
        </h2>
        <p className="text-muted-foreground mb-6">
          حصلت على{" "}
          <span
            className={cn(
              "font-bold text-xl",
              isPassed ? "text-success-emphasis" : "text-destructive"
            )}
          >
            {score}%
          </span>{" "}
          من {quiz.questions.length} سؤال
        </p>
        <div className="card p-6 mb-6 text-start">
          {quiz.questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={q.id} className="flex items-start gap-3 mb-4 last:mb-0">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-success-emphasis flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {q.question}
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-success-emphasis mt-1">
                      الإجابة الصحيحة: {q.options[q.correctAnswer]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Button onClick={onFinish} className="font-bold">
          العودة للاختبارات
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      {/* رأس الاختبار */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold md:text-xl text-foreground">
            {quiz.title}
          </h2>
          {quiz.timeLimit && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              {quiz.timeLimit} دقيقة
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">
            السؤال {currentQ + 1} من {quiz.questions.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${((currentQ + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* السؤال */}
      {question && (
        <div className="card p-6 mb-5">
          <h3 className="text-foreground mb-6 leading-relaxed">
            {question.question}
          </h3>
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={cn(
                  "w-full text-start p-4 rounded-xl border-2 transition-all font-medium text-sm",
                  answers[currentQ] === i
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground"
                )}
              >
                <span
                  className={cn(
                    "inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold me-3",
                    answers[currentQ] === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          السابق
        </Button>

        <span className="text-xs text-muted-foreground">
          {answers.filter(a => a !== null).length} / {quiz.questions.length}{" "}
          مجاب
        </span>

        {currentQ === quiz.questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={answers.some(a => a === null) || submitMutation.isPending}
            className="font-bold gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            تسليم الاختبار
          </Button>
        ) : (
          <Button
            onClick={() =>
              setCurrentQ(Math.min(quiz.questions.length - 1, currentQ + 1))
            }
            disabled={answers[currentQ] === null}
            className="font-bold"
          >
            التالي
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TraineeQuizzes() {
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);

  const { data: departments } = trpc.departments.list.useQuery();
  const { data: quizzes, isLoading } = trpc.quizzes.list.useQuery({
    departmentId: selectedDept,
  });
  const { data: activeQuizData } = trpc.quizzes.byId.useQuery(
    { id: activeQuiz! },
    { enabled: !!activeQuiz }
  );

  if (activeQuiz && activeQuizData?.questions) {
    const questions = activeQuizData.questions as QuizQuestion[];
    return (
      <PortalLayout role="trainee" title={activeQuizData.title}>
        <div>
          <button
            onClick={() => setActiveQuiz(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium mb-6"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للاختبارات
          </button>
          <QuizRunner
            quiz={{ ...activeQuizData, questions }}
            onFinish={() => setActiveQuiz(null)}
          />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout role="trainee" title="الاختبارات العملية">
      <div className="space-y-6">
        {/* فلتر الإدارات */}
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={() => setSelectedDept(undefined)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all",
              !selectedDept
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            الكل
          </button>
          {departments?.map(dept => (
            <button
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
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : quizzes?.length === 0 ? (
          <div className="flex flex-col items-center text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-foreground mb-2">لا توجد اختبارات</h3>
            <p className="text-xs leading-6 md:text-sm text-muted-foreground">
              لم يتم إضافة اختبارات بعد
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes?.map((quiz, i) => (
              <div
                key={quiz.id}
                className={cn(
                  "card p-5 cursor-pointer transition-all hover:-translate-y-0.5",
                  `animate-in fade-in slide-in-from-bottom-4 fill-mode-both delay-${Math.min(i + 1, 6) * 50}`
                )}
                onClick={() => setActiveQuiz(quiz.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold md:text-lg text-foreground mb-1.5">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="text-xs leading-6 md:text-sm text-muted-foreground line-clamp-2 mb-3">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {quiz.passingScore && (
                        <Badge variant="success" size="sm">
                          <Trophy className="h-3 w-3 me-1" />
                          {quiz.passingScore}% للنجاح
                        </Badge>
                      )}
                      {quiz.timeLimit && (
                        <Badge variant="info" size="sm">
                          <Clock className="h-3 w-3 me-1" />
                          {quiz.timeLimit} دقيقة
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <Button className="w-full font-bold">بدء الاختبار</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
