export interface Hostel {
  id: number;
  name: string;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  currentCollection: number;
  pendingCollection: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

export interface Room {
  id: number;
  hostelId: number;
  roomNumber: string;
  capacity: number;
  type: string;
  occupiedBeds: number;
}

export interface Bed {
  id: number;
  roomId: number;
  bedNumber: string;
  status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
  studentId?: number;
}

export interface Student {
  id: number;
  studentId: string;
  name: string;
  photo?: string;
  phone: string;
  parentPhone?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  guardianRelation?: string;
  guardianName?: string;
  guardianPhone?: string;
  notes?: string;
  email?: string;
  aadhaarNumber?: string;
  address?: string;
  joiningDate?: string;
  bedId?: number;
  roomId?: number;
  hostelId?: number;
  monthlyRent: number;
  advanceDeposit: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'GRADUATED';
}

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  month: string;
  year: string;
  status: 'PAID' | 'PENDING' | 'PENDING DUE' | 'OVERDUE';
  expectedAmount?: number;
  dueAmount?: number;
  dueDate: string;
  utrNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalHostels: number;
  totalStudents: number;
  occupiedStudents: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  occupancyRate: number;
  monthlyRevenue: number;
  revenueData: { name: string; total: number }[];
  occupancyData: { name: string; occupied: number; vacant: number }[];
  recentAdmissions: any[];
  recentActivities: any[];
}

export interface AdmissionRequestCreateDTO {
  studentName?: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  fatherName?: string;
  aadhaarNumber?: string;
  address?: string;
  hostelCode?: string;
  roomNumber?: string;
  bedName?: string;
}

export interface AdmissionRequestResponseDTO extends AdmissionRequestCreateDTO {
  id?: number;
  status?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: number;
  hostelId?: number;
  category: string;
  amount: number;
  expenseDate: string;
  description?: string;
  receiptUrl?: string;
  recordedBy: number;
}
