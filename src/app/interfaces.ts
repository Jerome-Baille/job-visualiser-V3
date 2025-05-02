// Statistics returned by /stats endpoint
export interface OpportunitiesStats {
  applicationsPerMonth: Record<string, number>; // { 'YYYY-MM': count, ... }
  decisionOutcomes: {
    positive: number;
    negative: number;
    'in progress': number;
    expired: number;
    unknown: number;
  };
  funnel: {
    totalApplications: number;
    totalResponses: number;
    totalInterviews: number;
  };
  conversionRates: {
    applicationsToResponses: number;
    responsesToInterviews: number;
  };
}
export interface UserData {
    id?: number;
    username: string;
    email?: string;
    password: string;
    confirmPassword?: string;
}

export interface JobData {
    [key: string]: unknown;
    _id?: string;
    id?: string | number;
    userId?: string;
    name?: string;
    company?: string;
    location?: string;
    type?: string;
    link?: string;
    applicationDate?: string;
    applicationYear?: number;
    interview?: boolean;
    interviewDate?: string;
    decision?: string;
    decisionDate?: string;
    favorite?: boolean;
}

interface Update {
    userId: number;
    update: string;
}

export interface TaskData {
    [key: string]: unknown;
    id?: number;
    description?: string;
    status?: 'Backlog' | 'In Progress' | 'Done';
    priority?: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    jobId?: number[];
    userUpdates?: Update[];
    userIds?: number[];
}

// Angular doesn't use setState-style props, so remove those
export interface TaskMenuProps {
    task: TaskData;
    tasks: TaskData[];
}

export interface TaskDataProps {
    tasks: TaskData[];
}

export interface ProfileData {
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    profilePicture?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phoneNumber?: string;
    lastLoginAt?: string;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
}

export interface JobDataProps {
    data?: JobData;
    isEmpty?: boolean;
}

export interface JobState {
    jobs: JobData[];
    jobFiltered?: JobData[];
}

export interface TableProps {
    data: JobData;
    isEmpty?: boolean;
}

export interface StorageKeys {
    JT_accessToken: string;
    JT_accessTokenExpireDate: string;
    JT_refreshToken: string;
    JT_refreshTokenExpireDate: string;
    userId?: string;
    userIdExpireDate?: string;
}

// Remove React.FormEvent and setter functions
export interface LoginFormProps {
    username: string;
    password: string;
    errorMessage: string;
}

// Define the type for a column
export interface Column {
    label: string;
    accessor: string;
    sortable: boolean;
}

// Define the type for the props
export interface TableHeadProps {
    columns: Column[];
    // In Angular, sorting would be handled via Output event
}

export interface Status {
    label: string;
    value: string;
}

export interface TableBodyProps {
    jobs: JobData[];
    columns: Column[];
}

export interface AuthState {
    isAuthenticated: boolean;
}

export interface FormValues {
    [key: string]: string | number | undefined | 'Remote' | 'Hybrid' | 'On site' | 'positive' | 'negative' | 'in progress' | 'expired' | 'unknown';
    name: string;
    company: string;
    location: string;
    type: 'Remote' | 'Hybrid' | 'On site';
    link: string;
    applicationDate: string;
    applicationYear: string;
    interviewDate?: string;
    decisionDate?: string;
    decision: 'positive' | 'negative' | 'in progress' | 'expired' | 'unknown';
}

// Remove FontAwesome IconProp, use string for icon names in Angular
export interface SidebarLinkProps {
    to: string;
    text: string;
    label: string;
    icon: string;
    isSidebarClosed?: boolean;
}

export interface DashboardProps {
    [key: string]: unknown;
    jobs: JobData[];
}

export interface DataPointMonth {
    month: string;
    count: number;
}

export interface BarChartData {
    day: string;
    count: number;
}

export interface LineChartProps {
    data: DataPointMonth[];
    monthOrder: string[];
    width: number;
    height: number;
}

export interface BarChartProps {
    data: BarChartData[];
    width: number;
    height: number;
}