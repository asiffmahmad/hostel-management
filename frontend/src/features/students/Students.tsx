import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Filter, UserCheck, MoreVertical, Eye, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useHostel } from '@/app/HostelContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/services/api';
import type { Student } from '@/types';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { useQueryClient } from '@tanstack/react-query';

export default function Students() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedHostelId } = useHostel();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);
  
  // Reset pagination when hostel changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedHostelId]);

  // Queries
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['students', selectedHostelId],
    queryFn: async () => {
      const { data } = await api.get('/students', {
        params: { hostelId: selectedHostelId || undefined }
      });
      return data;
    },
  });

  const filteredStudents = students?.filter((s) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-card rounded-2xl p-6 glass-panel border shadow-sm h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage admissions and student profiles.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button className="gap-2" onClick={() => { setSelectedStudent(undefined); setIsModalOpen(true); }}>
            <Plus size={16} /> Add Student
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-md shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto bg-background/50 rounded-md border">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : filteredStudents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents?.map((student) => (
                  <TableRow key={student.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                          <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {student.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-muted-foreground" />
                          {student.phone}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail size={14} />
                          {student.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1 pt-1 border-t border-muted/50">
                          <span className="text-[10px] font-semibold uppercase">Parent:</span>
                          <Phone size={12} />
                          <span className="text-xs">
                            {student.fatherPhone || student.motherPhone || student.guardianPhone || student.parentPhone || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{student.monthlyRent?.toLocaleString('en-IN') || '0'}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {student.address || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        student.status === 'ACTIVE' 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400'
                          : 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400'
                      }`}>
                        {student.status === 'ACTIVE' && <UserCheck size={12} />}
                        {student.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="gap-2 text-muted-foreground" onClick={() => { setSelectedStudent(student); setIsDetailsOpen(true); }}>
                            <Eye size={14} /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-muted-foreground" onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}>
                            <Edit size={14} /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this student?')) {
                              await api.delete(`/students/${student.id}`);
                              window.location.reload();
                            }
                          }}>
                            <Trash2 size={14} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4 p-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground p-8">Loading students...</div>
          ) : filteredStudents?.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">No students found.</div>
          ) : (
            filteredStudents?.map((student) => (
              <div key={student.id} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                      <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-xs text-muted-foreground">ID: STD-{student.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    student.status === 'ACTIVE' 
                      ? 'bg-green-500/10 text-green-600 border-green-500/20'
                      : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                  }`}>
                    {student.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Contact</span>
                    <span className="truncate">{student.phone}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Rent</span>
                    <span className="font-medium">₹{student.monthlyRent?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <span className="truncate">{student.email || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-xs text-muted-foreground">Parent</span>
                    <span className="truncate">{student.fatherPhone || student.motherPhone || student.guardianPhone || student.parentPhone || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t mt-1">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => { setSelectedStudent(student); setIsDetailsOpen(true); }}>
                    <Eye size={12} /> View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}>
                    <Edit size={12} /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-[0.5] h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this student?')) {
                      await api.delete(`/students/${student.id}`);
                      window.location.reload();
                    }
                  }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <StudentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={selectedStudent} 
      />
      <StudentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
}
