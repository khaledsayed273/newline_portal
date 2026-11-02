import PortalLayout from "@/components/PortalLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Award, BarChart3, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

export default function AdminEmployeeStats() {
  const { data: employees = [], isLoading, refetch } = trpc.stats.employees.useQuery();
  const { data: departments = [] } = trpc.departments.list.useQuery();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee: any) => {
      if (departmentId !== "all" && String(employee.departmentId) !== departmentId) return false;
      if (!query) return true;
      return [employee.name, employee.employeeNumber, employee.jobTitle]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query));
    });
  }, [employees, search, departmentId]);

  return (
    <PortalLayout role="admin" title="إحصائيات الموظفين">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>{filtered.length} موظف</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> تحديث
          </Button>
        </div>

        <div className="card flex flex-wrap gap-3 p-4">
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="بحث بالاسم أو الرقم الوظيفي أو المسمى"
            className="min-w-[220px] flex-1"
          />
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="كل الإدارات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الإدارات</SelectItem>
              {departments.map((department: any) => (
                <SelectItem key={department.id} value={String(department.id)}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => <div key={index} className="card h-16 animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-card shadow-sm">
               <Table className="min-w-[1160px]">
              <TableHeader className="bg-muted">
                <TableRow className="border-border-muted">
                  <TableHead className="text-start">الرقم الوظيفي</TableHead>
                  <TableHead className="text-start min-w-[220px]">الموظف</TableHead>
                  <TableHead className="text-start min-w-[180px]">الإدارة</TableHead>
                  <TableHead className="text-start min-w-[180px]">المسمى الوظيفي</TableHead>
                  <TableHead className="text-start">المكتملة</TableHead>
                  <TableHead className="text-start">قيد التقدم</TableHead>
                   <TableHead className="text-start">الإنجاز</TableHead>
                   <TableHead className="text-start">الشهادات</TableHead>
                   <TableHead className="text-start">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((employee: any, index: number) => (
                  <TableRow key={employee.id} className={`${index % 2 === 0 ? "bg-card" : "bg-muted/50"} border-border-muted`}>
                    <TableCell dir="ltr" className="text-start text-muted-foreground">{employee.employeeNumber}</TableCell>
                    <TableCell className="font-medium text-foreground">{employee.name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {departments.find((department: any) => department.id === employee.departmentId)?.name ?? employee.department ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.jobTitle || "-"}</TableCell>
                    <TableCell>{employee.completedCourses ?? 0}</TableCell>
                    <TableCell>{employee.inProgress ?? 0}</TableCell>
                    <TableCell><Badge variant={Number(employee.completionRate) >= 70 ? "success" : "secondary"}>{employee.completionRate ?? 0}%</Badge></TableCell>
                   <TableCell>{employee.certificates ?? 0}</TableCell>
                   <TableCell>
                      <Link
                        href={`/admin/employees/${employee.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                      >
                        <Award className="h-3.5 w-3.5" /> تفاصيل الموظف
                      </Link>
                   </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">لا توجد نتائج</div>}
          </div>
        )}
      </div>

    </PortalLayout>
  );
}
