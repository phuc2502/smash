import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  email: string;
  phone: string;
  status: string;
  statusColor: string;
  activity: string;
}

export interface Class {
  id: string;
  title: string;
  status: string;
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
  type: string;
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
  iconName: string;
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

export interface AccountProfile {
  id: string;
  name: string;
  role: string;
  roleTitle: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

export interface AccountPreferences {
  darkMode: boolean;
  emailReports: boolean;
  soundNotifications: boolean;
  browserNotifications: boolean;
  autoLockSession: boolean;
  language: 'vi' | 'en';
}

export interface AccountActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: 'mint' | 'slate';
}

interface AppState {
  users: User[];
  userRequests: UserRequest[];
  classes: Class[];
  assignments: Assignment[];
  materials: Material[];
}

interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
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

  isAuthenticated: boolean;
  currentAccount: AccountProfile | null;
  accountPreferences: AccountPreferences;
  accountActivities: AccountActivity[];
  rememberedEmail: string;

  login: (payload: LoginPayload) => { success: boolean; message: string };
  logout: () => void;
  updateAccountProfile: (data: Partial<Pick<AccountProfile, 'name' | 'email' | 'phone' | 'avatarUrl'>>) => void;
  changePassword: (currentPassword: string, nextPassword: string) => { success: boolean; message: string };
  updateAccountPreferences: (data: Partial<AccountPreferences>) => void;

  stats: {
    totalUsers: number;
    totalTeachers: number;
    activeClasses: number;
    pendingGrading: number;
    pendingRequests: number;
  };
}

const LS_KEYS = {
  auth: 'smash.auth',
  account: 'smash.account',
  prefs: 'smash.account.preferences',
  rememberedEmail: 'smash.auth.rememberedEmail',
};

const defaultAccount: AccountProfile = {
  id: 'ADM-001',
  name: 'Trần Văn A',
  role: 'Quản trị',
  roleTitle: 'Quản lý SMASH',
  email: 'admin@smashmath.edu.vn',
  phone: '0988 123 456',
  avatarUrl: 'https://picsum.photos/seed/admin/300/300',
};

const defaultPreferences: AccountPreferences = {
  darkMode: false,
  emailReports: true,
  soundNotifications: false,
  browserNotifications: true,
  autoLockSession: true,
  language: 'vi',
};

const defaultActivities: AccountActivity[] = [
  { id: 'act-1', title: 'Chấm điểm bài tập Toán 9', description: 'Đã hoàn thành 5/20 bài', time: '10 phút trước', tone: 'mint' },
  { id: 'act-2', title: 'Thêm thành viên mới', description: 'Tài khoản: Nguyễn Thu Hà (Học sinh)', time: '1 giờ trước', tone: 'mint' },
  { id: 'act-3', title: 'Cập nhật tài liệu', description: "Tải lên tệp 'Đề thi thử lớp 10'", time: 'Hôm qua', tone: 'mint' },
  { id: 'act-4', title: 'Đăng nhập hệ thống', description: 'Thiết bị: Chrome trên Windows', time: 'Hôm qua, 08:30', tone: 'slate' },
];

const demoAccounts = [
  { email: 'admin@smashmath.edu.vn', password: 'Smash@123', profile: defaultAccount },
  {
    email: 'teacher@smashmath.edu.vn',
    password: 'Smash@123',
    profile: {
      ...defaultAccount,
      id: 'TCH-109',
      name: 'Trần Văn Cường',
      role: 'Giáo viên',
      roleTitle: 'Giáo viên SMASH',
      email: 'teacher@smashmath.edu.vn',
      avatarUrl: 'https://picsum.photos/seed/teacher/300/300',
    },
  },
];

function loadStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const initialUsers: User[] = [
  { id: 'ST-2023-084', name: 'Nguyễn Thu Hà', role: 'Học sinh', roleColor: 'mint', email: 'ha.nguyen@student.edu.vn', phone: '0912 345 678', status: 'Đang học', statusColor: 'mint', activity: '2 giờ trước' },
  { id: 'TCH-109', name: 'Trần Văn Cường', role: 'Giáo viên', roleColor: 'slate', email: 'cuong.tran@edu.vn', phone: '0988 123 456', status: 'Đang làm việc', statusColor: 'mint', activity: 'Hôm qua' },
  { id: 'PR-552', name: 'Lê Quang Minh', role: 'Phụ huynh', roleColor: 'mint', email: 'minh.le@gmail.com', phone: '0903 765 432', status: 'Khóa', statusColor: 'rose', activity: '1 tuần trước' },
  { id: 'ST-2023-112', name: 'Phạm Thị Lan Anh', role: 'Học sinh', roleColor: 'mint', email: 'anh.pham@student.edu.vn', phone: '0977 444 333', status: 'Nghỉ học', statusColor: 'slate', activity: '2 tháng trước' },
];

const initialClasses: Class[] = [
  { id: 'MATH-06-01', title: 'Toán 6 - Nâng cao', status: 'Đang diễn ra', instructor: 'Thầy Nguyễn Minh', role: 'Giáo viên chính', schedule: 'Thứ 2, 4 (18:00 - 20:00)', location: 'Phòng A101', studentsCount: 15, maxStudents: 20, color: 'mint' },
  { id: 'MATH-07-02', title: 'Toán 7 - Cơ bản', status: 'Sắp bắt đầu', instructor: 'Cô Lê Thị Thu', role: 'Giáo viên', schedule: 'Thứ 3, 5 (18:00 - 20:00)', location: 'Phòng B202', studentsCount: 12, maxStudents: 20, color: 'mint' },
  { id: 'MATH-09-EX', title: 'Toán 9 - Luyện thi vào 10', status: 'Đang diễn ra', instructor: 'Thầy Trần Hùng', role: 'Trưởng bộ môn', schedule: 'Thứ 7, CN (08:00 - 10:30)', location: 'Phòng VIP 1', studentsCount: 25, maxStudents: 25, color: 'rose' },
];

const initialAssignments: Assignment[] = [
  { id: 'ASG-001', type: 'Trắc nghiệm', typeColor: 'mint', status: 'Đang mở', title: 'Kiểm tra 15p - Số học 6 (Chương 2)', classId: 'MATH-06-01', className: 'Toán 6 - N01', progress: 14, total: 15, deadline: '23:59, 25/12' },
  { id: 'ASG-002', type: 'Tự luận', typeColor: 'mint', status: 'Chờ chấm điểm', title: 'Bài tập về nhà: Đại số 9 - Hệ phương trình', classId: 'MATH-09-EX', className: 'Toán 9 - Luyện thi', progress: 20, total: 25, deadline: 'Đã đóng: 20/12', isUrgent: true },
];

const initialMaterials: Material[] = [
  { id: 'M-001', title: 'Tài liệu Toán 6', detail: 'Số học & Hình học cơ bản lớp 6', files: 15, updated: '2 ngày trước', iconName: 'History', color: 'mint' },
  { id: 'M-002', title: 'Bộ đề thi vào 10', detail: 'Tuyển tập đề thi chuyên & công lập', files: 50, updated: '1 ngày trước', iconName: 'Grid3X3', color: 'mint' },
];

const initialUserRequests: UserRequest[] = [
  { id: 'REQ-001', name: 'Lê Minh Tuấn', email: 'tuan.le@gmail.com', role: 'Học sinh', requestedAt: '1 giờ trước', note: 'Em muốn đăng ký lớp Toán 6 nâng cao' },
  { id: 'REQ-002', name: 'Nguyễn Hồng Hạnh', email: 'hanh.nguyen@edu.vn', role: 'Giáo viên', requestedAt: '3 giờ trước', note: 'Ứng tuyển vị trí trợ giảng' },
  { id: 'REQ-003', name: 'Bùi Xuân Toàn', email: 'toan.bui@gmail.com', role: 'Phụ huynh', requestedAt: '5 giờ trước', note: 'Đăng ký tài khoản theo dõi con' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [userRequests, setUserRequests] = useState<UserRequest[]>(initialUserRequests);
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStoredJson<boolean>(LS_KEYS.auth, false));
  const [currentAccount, setCurrentAccount] = useState<AccountProfile | null>(() => {
    if (!loadStoredJson<boolean>(LS_KEYS.auth, false)) return null;
    return loadStoredJson<AccountProfile>(LS_KEYS.account, defaultAccount);
  });
  const [accountPreferences, setAccountPreferences] = useState<AccountPreferences>(() => ({
    ...defaultPreferences,
    ...loadStoredJson<Partial<AccountPreferences>>(LS_KEYS.prefs, defaultPreferences),
  }));
  const [accountActivities, setAccountActivities] = useState<AccountActivity[]>(defaultActivities);
  const [rememberedEmail, setRememberedEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(LS_KEYS.rememberedEmail) ?? '';
  });

  const addUser = (user: User) => setUsers(prev => [user, ...prev]);
  const updateUser = (id: string, updatedUser: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updatedUser } : u)));
  };
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const approveRequest = (requestId: string) => {
    const request = userRequests.find(r => r.id === requestId);
    if (!request) return;

    const prefix = request.role.toLowerCase().includes('giáo') ? 'TCH' : request.role.toLowerCase().includes('phụ') ? 'PR' : 'ST';
    const newUser: User = {
      id: `${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 999)}`,
      name: request.name,
      email: request.email,
      phone: 'Chưa cập nhật',
      role: request.role,
      roleColor: request.role.toLowerCase().includes('giáo') ? 'slate' : 'mint',
      status: request.role.toLowerCase().includes('học') ? 'Đang học' : 'Đang làm việc',
      statusColor: 'mint',
      activity: 'Vừa đăng ký qua duyệt',
    };

    setUsers(prev => [newUser, ...prev]);
    setUserRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const rejectRequest = (requestId: string) => {
    setUserRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const addClass = (cls: Class) => setClasses(prev => [cls, ...prev]);
  const updateClass = (id: string, updatedClass: Partial<Class>) => {
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...updatedClass } : c)));
  };

  const addAssignment = (asgn: Assignment) => setAssignments(prev => [asgn, ...prev]);

  const appendActivity = (title: string, description: string, tone: AccountActivity['tone'] = 'mint') => {
    setAccountActivities(prev => [{ id: `act-${Date.now()}`, title, description, time: 'Vừa xong', tone }, ...prev].slice(0, 20));
  };

  const login = ({ email, password, remember }: LoginPayload) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = demoAccounts.find(item => item.email.toLowerCase() === normalizedEmail && item.password === password);

    if (!account) {
      return { success: false, message: 'Email hoặc mật khẩu chưa đúng.' };
    }

    setIsAuthenticated(true);
    setCurrentAccount(account.profile);
    saveJson(LS_KEYS.auth, true);
    saveJson(LS_KEYS.account, account.profile);

    if (remember) {
      if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEYS.rememberedEmail, normalizedEmail);
      setRememberedEmail(normalizedEmail);
    } else {
      if (typeof window !== 'undefined') window.localStorage.removeItem(LS_KEYS.rememberedEmail);
      setRememberedEmail('');
    }

    appendActivity('Đăng nhập hệ thống', 'Thiết bị: Chrome trên Windows', 'slate');
    return { success: true, message: 'Đăng nhập thành công.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentAccount(null);
    saveJson(LS_KEYS.auth, false);
    if (typeof window !== 'undefined') window.localStorage.removeItem(LS_KEYS.account);
  };

  const updateAccountProfile = (data: Partial<Pick<AccountProfile, 'name' | 'email' | 'phone' | 'avatarUrl'>>) => {
    setCurrentAccount(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      saveJson(LS_KEYS.account, next);
      appendActivity('Cập nhật hồ sơ', 'Bạn vừa thay đổi thông tin cá nhân.');
      return next;
    });
  };

  const changePassword = (currentPassword: string, nextPassword: string) => {
    if (!currentPassword.trim() || !nextPassword.trim()) {
      return { success: false, message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.' };
    }
    if (nextPassword.length < 8) {
      return { success: false, message: 'Mật khẩu mới cần ít nhất 8 ký tự.' };
    }
    if (currentPassword === nextPassword) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu cũ.' };
    }

    appendActivity('Đổi mật khẩu', 'Mật khẩu tài khoản đã được cập nhật.');
    return { success: true, message: 'Đổi mật khẩu thành công.' };
  };

  const updateAccountPreferences = (data: Partial<AccountPreferences>) => {
    setAccountPreferences(prev => {
      const next = { ...prev, ...data };
      saveJson(LS_KEYS.prefs, next);
      appendActivity('Cập nhật cài đặt', 'Tùy chọn hiển thị đã được thay đổi.');
      return next;
    });
  };

  const stats = useMemo(() => ({
    totalUsers: users.length,
    totalTeachers: users.filter(u => u.role === 'Giáo viên').length,
    activeClasses: classes.filter(c => c.status === 'Đang diễn ra').length,
    pendingGrading: assignments.filter(a => a.status === 'Chờ chấm điểm').length,
    pendingRequests: userRequests.length,
  }), [users, classes, assignments, userRequests]);

  return (
    <AppContext.Provider
      value={{
        users,
        userRequests,
        classes,
        assignments,
        materials,
        addUser,
        updateUser,
        deleteUser,
        approveRequest,
        rejectRequest,
        addClass,
        updateClass,
        addAssignment,
        isAuthenticated,
        currentAccount,
        accountPreferences,
        accountActivities,
        rememberedEmail,
        login,
        logout,
        updateAccountProfile,
        changePassword,
        updateAccountPreferences,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
