import api from './index';
import { Applicant, CreateApplicantRequest, UpdateApplicantRequest } from '../models/Applicant';

function normalizeApplicantsList(response: unknown): Applicant[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object') {
    const o = response as Record<string, unknown>;
    if (Array.isArray(o.applicants)) return o.applicants as Applicant[];
    if (Array.isArray(o.data)) return o.data as Applicant[];
    if (Array.isArray(o.rows)) return o.rows as Applicant[];
  }
  return [];
}

export const getApplicants = async (params?: {
  status?: string;
  positionapplied?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<Applicant[]> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.positionapplied) searchParams.append('positionapplied', params.positionapplied);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page != null) searchParams.append('page', String(params.page));
  if (params?.pageSize != null) searchParams.append('pageSize', String(params.pageSize));
  const query = searchParams.toString();
  const url = query ? `/applicants?${query}` : '/applicants';
  const { data } = await api.get(url);
  return normalizeApplicantsList(data);
};

export const getApplicant = async (applicantId: string): Promise<Applicant> => {
  const { data } = await api.get(`/applicants/${applicantId}`);
  return data;
};

export const createApplicant = async (
  payload: CreateApplicantRequest
): Promise<Applicant> => {
  const { data } = await api.post('/applicants', payload);
  return data;
};

export const updateApplicant = async (
  applicantId: string,
  payload: UpdateApplicantRequest
): Promise<Applicant> => {
  const { data } = await api.put(`/applicants/${applicantId}`, payload);
  return data;
};

export const deleteApplicant = async (
  applicantId: string
): Promise<void> => {
  await api.delete(`/applicants/${applicantId}`);
};

export const convertToEmployee = async (applicantId: string): Promise<Applicant> => {
  const { data } = await api.post(`/applicants/${applicantId}/convert-to-employee`);
  if (data && typeof data === 'object' && 'applicant' in data) return (data as { applicant: Applicant }).applicant;
  return data as Applicant;
};
