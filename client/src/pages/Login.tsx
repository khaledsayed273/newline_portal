import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      const me = await utils.auth.me.fetch();
      toast.success("تم تسجيل الدخول بنجاح");
      navigate(me?.role === "admin" ? "/admin" : "/");
    },
    onError: () => {
      toast.error("بيانات الدخول غير صحيحة");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <img src="/assets/logo.png" alt="نيولاين" className="h-14 w-auto object-contain" />
          <h2 className="text-foreground font-bold">تسجيل الدخول</h2>
          <p className="text-sm text-muted-foreground">بوابة نيولاين للتدريب</p>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            loginMutation.mutate({ employeeNumber: employeeNumber.trim(), password });
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="employeeNumber">الرقم الوظيفي</FieldLabel>
              <Input
                id="employeeNumber"
                type="text"
                value={employeeNumber}
                onChange={e => setEmployeeNumber(e.target.value)}
                required
                dir="ltr"
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="999"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
              />
            </Field>
            <Button variant="ghost" 
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full gap-2 font-bold"
            >
              <LogIn className="h-4 w-4" data-icon="inline-start" />
              {loginMutation.isPending ? "جارٍ الدخول..." : "دخول"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}