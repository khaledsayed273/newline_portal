import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminUsers() {
  const { data: users, isLoading } = trpc.users.all.useQuery();
  const { data: departments = [] } = trpc.departments.list.useQuery();
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmployeeNumber, setCEmployeeNumber] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState<"user" | "admin">("user");
  const [cDepartmentId, setCDepartmentId] = useState("");
  const [cJobTitle, setCJobTitle] = useState("");

  const [editUser, setEditUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [eName, setEName] = useState("");
  const [eEmployeeNumber, setEEmployeeNumber] = useState("");
  const [ePassword, setEPassword] = useState("");
  const [eRole, setERole] = useState<"user" | "admin">("user");
  const [eDepartmentId, setEDepartmentId] = useState("");
  const [eJobTitle, setEJobTitle] = useState("");

  const invalidate = () => utils.users.all.invalidate();

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setCName("");
      setCEmployeeNumber("");
      setCPassword("");
      setCRole("user");
      setCDepartmentId("");
      setCJobTitle("");
      toast.success("تم إنشاء المستخدم");
    },
    onError: (err) => toast.error(err.message || "فشل إنشاء المستخدم"),
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      invalidate();
      setEditUser(null);
      toast.success("تم تحديث المستخدم");
    },
    onError: (err) => toast.error(err.message || "فشل تحديث المستخدم"),
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success("تم حذف المستخدم");
    },
    onError: (err) => toast.error(err.message || "فشل حذف المستخدم"),
  });

  const handleDelete = (user: any) => {
    setDeleteTarget(user);
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setEName(user.name ?? "");
    setEEmployeeNumber(user.employeeNumber ?? "");
    setEPassword("");
    setERole(user.role === "admin" ? "admin" : "user");
    setEDepartmentId(user.departmentId ? String(user.departmentId) : "");
    setEJobTitle(user.jobTitle ?? "");
  };

  const filteredUsers =
    users?.filter((u: any) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
       return (
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.employeeNumber ?? "").toLowerCase().includes(q) ||
        (u.jobTitle ?? "").toLowerCase().includes(q)
      );
    }) ?? [];

  return (
    <PortalLayout role="admin" title="جدول الموظفين">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h6 className="text-sm text-muted-foreground">
            {filteredUsers.length} من {users?.length ?? 0} مستخدم
          </h6>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
               placeholder="بحث بالاسم أو الرقم الوظيفي أو المسمى"
              className="flex-1 min-w-[180px] bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Select
              value={roleFilter}
              onValueChange={v => setRoleFilter(v as "all" | "user" | "admin")}
            >
              <SelectTrigger size="sm" className="w-[110px]">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                 <SelectItem value="user">موظف</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost"  onClick={() => setCreateOpen(true)} className="gap-2 font-bold">
              <Plus className="h-4 w-4" />
              مستخدم جديد
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-16 animate-pulse" />
            ))}
          </div>
        ) : (
           <div className="overflow-x-auto rounded-xl bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4">
             <Table className="min-w-[980px]">
               <TableHeader className="bg-muted">
                  <TableRow className="border-border-muted">
                    <TableHead className="text-start w-[150px]">الرقم الوظيفي</TableHead>
                    <TableHead className="text-start min-w-[260px]">اسم الموظف</TableHead>
                    <TableHead className="text-start min-w-[220px]">المسمى الوظيفي</TableHead>
                    <TableHead className="text-start min-w-[180px]">الإدارة</TableHead>
                    <TableHead className="text-start w-[140px]">نوع الحساب</TableHead>
                    <TableHead className="text-start w-[190px]">الإجراءات</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
              {filteredUsers.map((user: any, index: number) => (
                <TableRow key={user.id} className={`${index % 2 === 0 ? "bg-card" : "bg-muted/50"} border-border-muted`}>
                  <TableCell className="text-start text-muted-foreground" >{user.employeeNumber ?? "-"}</TableCell>
                  <TableCell className="font-medium text-foreground">{user.name ?? "مجهول"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.jobTitle ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{departments.find((d: any) => d.id === user.departmentId)?.name ?? user.department ?? "-"}</TableCell>
                 <TableCell>
                   <Badge variant={user.role === "admin" ? "secondary" : "outline"}>
                     {user.role === "admin" ? "مدير" : "موظف"}
                   </Badge>
                 </TableCell>
                 <TableCell>
                   <div className="flex items-center gap-1">
                     <Button variant="ghost" size="sm" onClick={() => openEdit(user)} className="gap-1 text-xs text-primary">
                       <Pencil className="h-3.5 w-3.5" /> تعديل
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => handleDelete(user)} className="gap-1 text-xs text-destructive">
                       <Trash2 className="h-3.5 w-3.5" /> حذف
                     </Button>
                   </div>
                 </TableCell>
               </TableRow>
             ))}
               </TableBody>
             </Table>
             {filteredUsers.length === 0 && (
               <div className="p-6 text-center text-muted-foreground">
                 لا توجد نتائج
               </div>
             )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مستخدم جديد</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              createMutation.mutate({
                employeeNumber: cEmployeeNumber.trim(),
                name: cName,
                password: cPassword,
                role: cRole,
                departmentId: cDepartmentId ? Number(cDepartmentId) : undefined,
                jobTitle: cJobTitle.trim() || undefined,
              });
            }}
            className="space-y-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="cName">الاسم *</FieldLabel>
                <Input
                  id="cName"
                  value={cName}
                  onChange={e => setCName(e.target.value)}
                  required
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="اسم المستخدم"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cEmployeeNumber">الرقم الوظيفي *</FieldLabel>
                <Input
                  id="cEmployeeNumber"
                  type="text"
                  value={cEmployeeNumber}
                  onChange={e => setCEmployeeNumber(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="999"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cPassword">كلمة المرور *</FieldLabel>
                <Input
                  id="cPassword"
                  type="password"
                  value={cPassword}
                  onChange={e => setCPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="6 أحرف على الأقل"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cRole">الدور</FieldLabel>
                <Select value={cRole} onValueChange={v => setCRole(v as "user" | "admin")}>
                  <SelectTrigger id="cRole" className="w-full">
                    <SelectValue placeholder="الدور" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="user">موظف</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="cDepartment">الإدارة</FieldLabel>
                <Select value={cDepartmentId || "__none__"} onValueChange={v => setCDepartmentId(v === "__none__" ? "" : v)}>
                  <SelectTrigger id="cDepartment" className="w-full"><SelectValue placeholder="اختر الإدارة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">بدون إدارة</SelectItem>
                    {departments.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="cJobTitle">المسمى الوظيفي</FieldLabel>
                <Input id="cJobTitle" value={cJobTitle} onChange={e => setCJobTitle(e.target.value)} placeholder="المسمى الوظيفي" />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" variant="default" disabled={createMutation.isPending} className="font-bold">
                {createMutation.isPending ? "جارٍ الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editUser} onOpenChange={o => { if (!o) setEditUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!editUser) return;
              updateMutation.mutate({
                userId: editUser.id,
                name: eName,
                employeeNumber: eEmployeeNumber.trim(),
                role: eRole,
                password: ePassword ? ePassword : undefined,
                departmentId: eDepartmentId ? Number(eDepartmentId) : null,
                jobTitle: eJobTitle.trim() || null,
              });
            }}
            className="space-y-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="eName">الاسم *</FieldLabel>
                <Input
                  id="eName"
                  value={eName}
                  onChange={e => setEName(e.target.value)}
                  required
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="eEmployeeNumber">الرقم الوظيفي *</FieldLabel>
                <Input
                  id="eEmployeeNumber"
                  type="text"
                  value={eEmployeeNumber}
                  onChange={e => setEEmployeeNumber(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="eRole">الدور</FieldLabel>
                <Select value={eRole} onValueChange={v => setERole(v as "user" | "admin")}>
                  <SelectTrigger id="eRole" className="w-full">
                    <SelectValue placeholder="الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">متدرب</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="eDepartment">الإدارة</FieldLabel>
                <Select value={eDepartmentId || "__none__"} onValueChange={v => setEDepartmentId(v === "__none__" ? "" : v)}>
                  <SelectTrigger id="eDepartment" className="w-full"><SelectValue placeholder="اختر الإدارة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">بدون إدارة</SelectItem>
                    {departments.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="eJobTitle">المسمى الوظيفي</FieldLabel>
                <Input id="eJobTitle" value={eJobTitle} onChange={e => setEJobTitle(e.target.value)} placeholder="المسمى الوظيفي" />
              </Field>
              <Field>
                <FieldLabel htmlFor="ePassword">كلمة مرور جديدة (اختياري)</FieldLabel>
                <Input
                  id="ePassword"
                  type="password"
                  value={ePassword}
                  onChange={e => setEPassword(e.target.value)}
                  minLength={6}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="اتركه فارغًا للإبقاء"
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" variant="default" disabled={updateMutation.isPending} className="font-bold">
                {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              حذف {deleteTarget?.name ?? "المستخدم"} نهائياً؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate({ userId: deleteTarget.id });
                setDeleteTarget(null);
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalLayout>
  );
}
