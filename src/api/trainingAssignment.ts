import api from './index';
import {
  TrainingAssignment,
  CreateTrainingAssignmentRequest,
  UpdateTrainingAssignmentStatusRequest,
  TRAINING_ASSIGNMENT_STATUSES
} from '../models/TrainingAssignment';

export { TRAINING_ASSIGNMENT_STATUSES };

export const getTrainingAssignments = async (params?: {
  trainingid?: string;
  employeeid?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<TrainingAssignment[]> => {
  const searchParams = new URLSearchParams();
  if (params?.trainingid) searchParams.append('trainingid', params.trainingid);
  if (params?.employeeid) searchParams.append('employeeid', params.employeeid);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  const query = searchParams.toString();
  const url = query ? `/trainingassignment?${query}` : '/trainingassignment';
  const { data } = await api.get(url);
  return Array.isArray(data) ? data : [];
};

export const getTrainingAssignmentsForEmployee = async (employeeId: string): Promise<TrainingAssignment[]> => {
  return getTrainingAssignments({ employeeid: employeeId });
};

export const createTrainingAssignment = async (
  payload: CreateTrainingAssignmentRequest
): Promise<TrainingAssignment> => {
  const { data } = await api.post('/trainingassignment', payload);
  return data;
};

export const updateTrainingAssignmentStatus = async (
  assignmentId: string,
  payload: UpdateTrainingAssignmentStatusRequest
): Promise<TrainingAssignment> => {
  const { data } = await api.put(`/trainingassignment/${assignmentId}/status`, payload);
  return data;
};

export const deleteTrainingAssignment = async (assignmentId: string): Promise<void> => {
  await api.delete(`/trainingassignment/${assignmentId}`);
};
