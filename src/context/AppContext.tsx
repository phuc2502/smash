import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Types ---

export interface User {
  id: string;
  name: string;
  role: 'Học sinh' | 'Giáo viên' | 'Phụ huynh' | 'Quản trị';
  roleColor: string;
  email: string;
  phone: string;
  status: 'Đang học' | 'Đang làm việc' | 'Khóa' | 'Nghỉ học';
  statusColor: string;
  activity: string;
}

export interface Class {
  id: string;
  title: string;
  status: 'Đang diễn ra' | 'Sắp bắt đầu' | 'Đã kết thúc';
  instructor: string;
  role: string;
  schedule: string;
  location?: string;
  studentsCount: number;
  maxStudents: number;
  color: string;
}

export interface Assignment {
  id: string;
  type: "Trắc nghiệm" | "Tự luận";
  typeColor: string;
  status: string;
  title: string;
  classId: string;
  className: string;
  progress: number;
  total: number;
  deadline: string;
  isUrgent?: boolean;
}

export interface Material {
  id: string;
  title: string;
  detail: string;
  files: number;
  updated: string;
  iconName: string; // Mapping to icon in component
  color: string;
}

export interface UserRequest {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  requestedAt: string;
  note?: string;
}

interface AppState {
  users: User[];
  userRequests: UserRequest[];
  classes: Class[];
  assignments: Assignment[];
  materials: Material[];
}

interface AppContextType extends AppState {
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;

  addClass: (cls: Class) => void;
  updateClass: (id: string, cls: Partial<Class>) => void;

  addAssignment: (asgn: Assignment) => void;

  // Derived Stats
  stats: {
    totalUsers: number;
    totalTeachers: number;
    activeClasses: number;
    pendingGrading: number;
    pendingRequests: number;
  };
}

// --- Initial Data ---

const initialUsers: User[] = [
  { id: "ST-2023-084", name: "Nguyễn Thu Hà", role: "Học sinh", roleColor: "mint", email: "ha.nguyen@student.edu.vn", phone: "0912 345 678", status: "Đang học", statusColor: "mint", activity: "2 giờ trước" },
  { id: "TCH-109", name: "Trần Văn Cường", role: "Giáo viên", roleColor: "slate", email: "cuong.tran@edu.vn", phone: "0988 123 456", status: "Đang làm việc", statusColor: "mint", activity: "Hôm qua" },
  { id: "PR-552", name: "Lê Quang Minh", role: "Phụ huynh", roleColor: "mint", email: "minh.le@gmail.com", phone: "0903 765 432", status: "Khóa", statusColor: "rose", activity: "1 tuần trước" },
  { id: "ST-2023-112", name: "Phạm Thị Lan Anh", role: "Học sinh", roleColor: "mint", email: "anh.pham@student.edu.vn", phone: "0977 444 333", status: "Nghỉ học", statusColor: "slate", activity: "2 tháng trước" },
];

const initialClasses: Class[] = [
  { id: "MATH-06-01", title: "Toán 6 - Nâng cao", status: "Đang diễn ra", instructor: "Thầy Nguyễn Minh", role: "Giáo viên chính", schedule: "Thứ 2, 4 (18:00 - 20:00)", location: "Phòng A101", studentsCount: 15, maxStudents: 20, color: "mint" },
  { id: "MATH-07-02", title: "Toán 7 - Cơ bản", status: "Sắp bắt đầu", instructor: "Cô Lê Thị Thu", role: "Giáo viên", schedule: "Thứ 3, 5 (18:00 - 20:00)", location: "Phòng B202", studentsCount: 12, maxStudents: 20, color: "mint" },
  { id: "MATH-09-EX", title: "Toán 9 - Luyện thi vào 10", status: "Đang diễn ra", instructor: "Thầy Trần Hùng", role: "Trưởng bộ môn", schedule: "Thứ 7, CN (08:00 - 10:30)", location: "Phòng VIP 1", studentsCount: 25, maxStudents: 25, color: "rose" },
];

const initialAssignments: Assignment[] = [
  { id: "ASG-001", type: "Trắc nghiệm", typeColor: "mint", status: "Đang mở", title: "Kiểm tra 15p - Số học 6 (Chương 2)", classId: "MATH-06-01", className: "Toán 6 - N01", progress: 14, total: 15, deadline: "23:59, 25/12" },
  { id: "ASG-002", type: "Tự luận", typeColor: "mint", status: "Chờ chấm điểm", title: "Bài tập về nhà: Đại số 9 - Hệ phương trình", classId: "MATH-09-EX", className: "Toán 9 - Luyện thi", progress: 20, total: 25, deadline: "Đã đóng: 20/12", isUrgent: true },
];

const initialMaterials: Material[] = [
  { id: "M-001", title: "Tài liệu Toán 6", detail: "Số học & Hình học cơ bản lớp 6", files: 15, updated: "2d ago", iconName: 'History', color: "mint" },
  { id: "M-002", title: "Bộ đề thi vào 10", detail: "Tuyển tập đề thi chuyên & công lập", files: 50, updated: "1d ago", iconName: 'Grid3X3', color: "mint" },
];

const initialUserRequests: UserRequest[] = [
  { id: "REQ-001", name: "Lê Minh Tuấn", email: "tuan.le@gmail.com", role: "Học sinh", requestedAt: "1 giờ trước", note: "Em muốn đăng ký lớp Toán 6 nâng cao" },
  { id: "REQ-002", name: "Nguyễn Hồng Hạnh", email: "hanh.nguyen@edu.vn", role: "Giáo viên", requestedAt: "3 giờ trước", note: "Ứng tuyển vị trí trợ giảng" },
  { id: "REQ-003", name: "Bùi Xuân Toàn", email: "toan.bui@gmail.com", role: "Phụ huynh", requestedAt: "5 giờ trước", note: "Đăng ký tài khoản theo dõi con" },
];

// --- Context ---

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [userRequests, setUserRequests] = useState<UserRequest[]>(initialUserRequests);
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);

  const addUser = (user: User) => setUsers(prev => [user, ...prev]);
  const updateUser = (id: string, updatedUser: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedUser } : u));
  };
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const approveRequest = (requestId: string) => {
    const request = userRequests.find(r => r.id === requestId);
    if (request) {
      const prefix = request.role === 'Học sinh' ? 'ST' : request.role === 'Giáo viên' ? 'TCH' : request.role === 'Phụ huynh' ? 'PR' : 'ADM';
      const newUser: User = {
        id: `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 999)}`,
        name: request.name,
        email: request.email,
        phone: "Chưa cập nhật",
        role: request.role,
        roleColor: request.role === 'Học sinh' ? 'mint' : request.role === 'Giáo viên' ? 'slate' : request.role === 'Phụ huynh' ? 'mint' : 'rose',
        status: request.role === 'Học sinh' ? 'Đang học' : 'Đang làm việc',
        statusColor: 'mint',
        activity: "Vừa đăng ký qua duyệt"
      };
      setUsers(prev => [newUser, ...prev]);
      setUserRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const rejectRequest = (requestId: string) => {
    setUserRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const addClass = (cls: Class) => setClasses(prev => [cls, ...prev]);
  const updateClass = (id: string, updatedClass: Partial<Class>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updatedClass } : c));
  };

  const addAssignment = (asgn: Assignment) => setAssignments(prev => [asgn, ...prev]);

  // Derived Stats
  const stats = {
    totalUsers: users.length,
    totalTeachers: users.filter(u => u.role === 'Giáo viên').length,
    activeClasses: classes.filter(c => c.status === 'Đang diễn ra').length,
    pendingGrading: assignments.filter(a => a.status === 'Chờ chấm điểm').length,
    pendingRequests: userRequests.length,
  };

  return (
    <AppContext.Provider value={{
      users, userRequests, classes, assignments, materials,
      addUser, updateUser, deleteUser,
      approveRequest, rejectRequest,
      addClass, updateClass,
      addAssignment,
      stats
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
