import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Student } from '@/types';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
}

export const StudentDetailsModal = ({ isOpen, onClose, student }: StudentDetailsModalProps) => {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{student.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{student.studentId}</Badge>
                <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>{student.status}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</h3>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{student.email || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{student.address || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Family / Guardian Details</h3>
              {student.fatherName && (
                <div className="flex flex-col text-sm">
                  <span className="font-medium">Father: {student.fatherName}</span>
                  <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {student.fatherPhone || 'N/A'}</span>
                </div>
              )}
              {student.motherName && (
                <div className="flex flex-col text-sm mt-2">
                  <span className="font-medium">Mother: {student.motherName}</span>
                  <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {student.motherPhone || 'N/A'}</span>
                </div>
              )}
              {student.guardianRelation && (
                <div className="flex flex-col text-sm mt-2">
                  <span className="font-medium">Guardian ({student.guardianRelation}): {student.guardianName || 'N/A'}</span>
                  <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {student.guardianPhone || 'N/A'}</span>
                </div>
              )}
              {!student.fatherName && !student.motherName && !student.guardianRelation && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{student.parentPhone || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hostel Info</h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined: {student.joiningDate || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span>Bed ID: {student.bedId || 'Unassigned'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Financial</h3>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Rent: ₹{student.monthlyRent}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Deposit: ₹{student.advanceDeposit}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
