export interface User {
  id: string;
  discordId: string;
  firstName?: string;
  lastName?: string;
  teacherFirstName?: string;
  teacherLastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  userId: string;
  hour: string;
  subject: string;
  weekday?: string | null;
  createdAt: Date;
}

export interface ExcuseForm {
  id: string;
  userId: string;
  reason: string;
  startDate: Date;
  endDate: Date;
  filePath?: string;
  isProcessed: boolean;
  createdAt: Date;
}

export interface AbsencePeriod {
  start: Date;
  end: Date;
  startTime: string;
  endTime: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  reason: string;
  currentDate: string;
  teacherLastName?: string | null;
  schedule: Schedule[];
  absencePeriods: AbsencePeriod[];
}
