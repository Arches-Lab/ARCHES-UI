export const TRAINING_ASSIGNMENT_STATUSES = [
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
] as const;

export type TrainingAssignmentStatus = (typeof TRAINING_ASSIGNMENT_STATUSES)[number];

export interface TrainingAssignment {
  trainingassignmentid?: string;
  storenumber: number;
  trainingid: string;
  employeeid: string;
  status: TrainingAssignmentStatus;
  dueon?: string;
  completedon?: string;
  createdby: string;
  createdon: string;
  employee?: {
    firstname: string;
    lastname: string;
    email: string | null;
  };
  creator?: {
    firstname: string;
    lastname: string;
    email: string | null;
  };
  training?: {
    title: string;
  };
}

export interface CreateTrainingAssignmentRequest {
  storenumber: number;
  trainingid: string;
  employeeid: string;
  dueon?: string;
}

export interface UpdateTrainingAssignmentStatusRequest {
  status: TrainingAssignmentStatus | string;
}
