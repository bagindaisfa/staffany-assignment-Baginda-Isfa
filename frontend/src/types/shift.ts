// src/types/shift.ts
export interface ShiftData {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  isPublished?: boolean;
  weekId: string;
}

export interface ShiftClashCheck {
  hasClash: boolean;
  conflictingShift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
}

export interface ShiftCreateData {
  name: string;
  startTime: string;
  endTime: string;
}

export interface ShiftUpdateData extends Partial<ShiftCreateData> {
  id: string;
}

export interface PublishShiftsData {
  startDate: string;
  endDate: string;
}
