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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type DepartmentForm = {
  name: string;
  nameEn: string;
  description: string;
  color: string;
  icon: string;
  order: string;
};

const emptyForm: DepartmentForm = {
  name: "",
  nameEn: "",
  description: "",
  color: "#2563eb",
  icon: "",
  order: "0",
};

export default function AdminDepartments() {
  const { data: departments = [], isLoading } = trpc.departments.list.useQuery();
  const utils = trpc.useUtils();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState<DepartmentForm>(emptyForm);

  const invalidate = () => utils.departments.list.invalidate();

  const createMutation = trpc.departments.create.useMutation({
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      toast.success("تم إضافة الإدارة");
    },
    onError: error => toast.error(error.message || "فشل إضافة الإدارة"),
  });

  const updateMutation = trpc.departments.update.useMutation({
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setEditing(null);
      toast.success("تم تحديث الإدارة");
    },
    onError: error => toast.error(error.message || "فشل تحديث الإدارة"),
  });

  const deleteMutation = trpc.departments.delete.useMutation({
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("تم حذف الإدارة");
    },
    onError: error => toast.error(error.message || "فشل حذف الإدارة"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (department: any) => {
    setEditing(department);
    setForm({
      name: department.name ?? "",
      nameEn: department.nameEn ?? "",
      description: department.description ?? "",
      color: department.color ?? "#2563eb",
      icon: department.icon ?? "",
      order: String(department.order ?? 0),
    });
    setFormOpen(true);
  };

  const updateField = (field: keyof DepartmentForm, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const data = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || undefined,
      description: form.description.trim() || undefined,
      color: form.color || undefined,
      icon: form.icon.trim() || undefined,
      order: Number(form.order) || 0,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <PortalLayout role="admin" title="إدارة الإدارات">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <h6 className="text-muted-foreground">
            {departments.length} إدارة
          </h6>
          <Button variant="ghost" onClick={openCreate} className="gap-2 font-bold">
            <Plus className="h-4 w-4" />
            إضافة إدارة
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="card h-16 animate-pulse" />
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="card flex flex-col items-center py-16 text-center">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="mb-2 text-foreground">لا توجد إدارات</h3>
            <h6 className="text-muted-foreground">ابدأ بإضافة أول إدارة</h6>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <Table className="min-w-[850px]">
              <TableHeader className="bg-muted">
                <TableRow className="border-border-muted">
                  <TableHead className="text-start w-20">الترتيب</TableHead>
                  <TableHead className="text-start min-w-[230px]">الإدارة</TableHead>
                  <TableHead className="text-start min-w-[180px]">الاسم بالإنجليزي</TableHead>
                  <TableHead className="text-start min-w-[280px]">الوصف</TableHead>
                  <TableHead className="text-start w-28">الحالة</TableHead>
                  <TableHead className="text-start w-44">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department: any, index: number) => (
                  <TableRow
                    key={department.id}
                    className={`${index % 2 === 0 ? "bg-card" : "bg-muted/50"} border-border-muted`}
                  >
                    <TableCell className="text-muted-foreground">{department.order ?? 0}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: department.color || "var(--primary)" }}
                        >
                          {department.icon || <Building2 className="h-4 w-4" />}
                        </span>
                        {department.name}
                      </div>
                    </TableCell>
                    <TableCell dir="ltr" className="text-start text-muted-foreground">
                      {department.nameEn || "-"}
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-muted-foreground">
                      {department.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">نشطة</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(department)} className="gap-1 text-xs text-primary">
                          <Pencil className="h-3.5 w-3.5" /> تعديل
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(department)} className="gap-1 text-xs text-destructive">
                          <Trash2 className="h-3.5 w-3.5" /> حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل الإدارة" : "إضافة إدارة"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="departmentName">اسم الإدارة *</FieldLabel>
                <Input id="departmentName" value={form.name} onChange={event => updateField("name", event.target.value)} required placeholder="مثال: الخدمات المشتركة" />
              </Field>
              <Field>
                <FieldLabel htmlFor="departmentNameEn">الاسم بالإنجليزي</FieldLabel>
                <Input id="departmentNameEn" value={form.nameEn} onChange={event => updateField("nameEn", event.target.value)} dir="ltr" placeholder="Shared Services" />
              </Field>
              <Field>
                <FieldLabel htmlFor="departmentDescription">الوصف</FieldLabel>
                <Textarea id="departmentDescription" value={form.description} onChange={event => updateField("description", event.target.value)} placeholder="وصف مختصر للإدارة" rows={3} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="departmentColor">اللون</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input id="departmentColor" type="color" value={form.color} onChange={event => updateField("color", event.target.value)} className="h-10 w-14 cursor-pointer p-1" />
                    <Input value={form.color} onChange={event => updateField("color", event.target.value)} dir="ltr" />
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="departmentIcon">الأيقونة</FieldLabel>
                  <Input id="departmentIcon" value={form.icon} onChange={event => updateField("icon", event.target.value)} placeholder="🏢" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="departmentOrder">الترتيب</FieldLabel>
                  <Input id="departmentOrder" type="number" value={form.order} onChange={event => updateField("order", event.target.value)} min={0} />
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" disabled={isSaving || !form.name.trim()} className="font-bold">
                {isSaving ? "جارٍ الحفظ..." : editing ? "حفظ التعديلات" : "إضافة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإدارة</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد حذف إدارة {deleteTarget?.name ?? ""}؟ قد يؤثر ذلك على الموظفين والدورات المرتبطة بها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalLayout>
  );
}
