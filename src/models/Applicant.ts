export const APPLICANT_STATUSES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
  'Withdrawn'
] as const;

export type ApplicantStatus = (typeof APPLICANT_STATUSES)[number];

export interface Applicant {
  applicantid?: string;
  storenumber: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  positionapplied: string;
  source?: string;
  status: string;
  resumeurl?: string;
  interviewdate?: string;
  hireddate?: string;
  applieddate?: string;
  lastupdated?: string;
  createdby: string;
  createdon: string;
  convertedtoemployeeid?: string;
  creator?: {
    firstname?: string;
    lastname?: string;
    email?: string;
  }
}

export interface CreateApplicantRequest {
  storenumber: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string | null;
  positionapplied: string;
  source?: string | null;
  status: ApplicantStatus | string;
  resumeurl?: string | null;
  interviewdate?: string | null;
  hireddate?: string | null;
}

export interface UpdateApplicantRequest {
  storenumber?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string | null;
  positionapplied?: string;
  source?: string | null;
  status?: ApplicantStatus | string;
  resumeurl?: string | null;
  interviewdate?: string | null;
  hireddate?: string | null;
  convertedtoemployeeid?: string | null;
}
