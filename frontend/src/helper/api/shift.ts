import { getAxiosInstance } from ".";
import {
  ShiftData,
  ShiftClashCheck,
  PublishShiftsData,
} from "../../types/shift";

export const getShifts = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const api = getAxiosInstance();
  const response = await api.get(`/shifts`, { params });
  return response.data.results;
};

export const getShiftById = async (id: string) => {
  const api = getAxiosInstance();
  const { data } = await api.get(`/shifts/${id}`);
  return data;
};

export const createShifts = async (payload: any) => {
  const api = getAxiosInstance();
  const { data } = await api.post("/shifts", payload);
  return data;
};

export const updateShiftById = async (id: string, payload: any) => {
  const api = getAxiosInstance();
  const { data } = await api.patch(`/shifts/${id}`, payload);
  return data;
};

export const deleteShiftById = async (id: string) => {
  const api = getAxiosInstance();
  const { data } = await api.delete(`/shifts/${id}`);
  return data;
};

export const publishShifts = async (data: PublishShiftsData) => {
  const api = getAxiosInstance();
  const response = await api.post<{ message: string }>(`/shifts/publish`, data);
  return response.data;
};

export interface CheckShiftClashParams {
  date: string;
  startTime: string;
  endTime: string;
  excludeShiftId?: string;
}

export const checkShiftClash = async (
  data: CheckShiftClashParams
): Promise<ShiftClashCheck> => {
  const api = getAxiosInstance();
  const response = await api.post<ShiftClashCheck>(`/shifts/check-clash`, {
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    ...(data.excludeShiftId && { excludeShiftId: data.excludeShiftId }),
  });
  return response.data;
};
