import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { data: users, isLoading } = trpc.users.all.useQuery();
  const utils = trpc.useUtils();

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.all.invalidate();
      toast.success("تم تحديث الدور");
    },
  });

  return (
    <PortalLayout role="admin" title="إدارة المتدربين">
      <div className="space-y-5">
        <p className="text-xs leading-6 md:text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-4">
          {users?.length ?? 0} مستخدم مسجّل
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {users?.map((user: any) => (
              <div key={user.id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                  {(user.name ?? "?").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-foreground">{user.name ?? "مجهول"}</h4>
                    <Badge
                      variant={user.role === "admin" ? "secondary" : "outline"}
                    >
                      {user.role === "admin" ? "مدير" : "متدرب"}
                    </Badge>
                  </div>
                  {user.email && (
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    آخر دخول:{" "}
                    {new Date(user.lastSignedIn).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateRoleMutation.mutate({
                      userId: user.id,
                      role: user.role === "admin" ? "user" : "admin",
                    })
                  }
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold flex-shrink-0"
                  title={
                    user.role === "admin"
                      ? "إزالة صلاحية المدير"
                      : "منح صلاحية المدير"
                  }
                >
                  <Shield className="h-3.5 w-3.5" />
                  {user.role === "admin" ? "إزالة المدير" : "ترقية لمدير"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
