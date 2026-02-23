import { ApplicantStatus } from '../models/Applicant';

const STATUS_STYLES: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  Screening: 'bg-amber-100 text-amber-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-cyan-100 text-cyan-800',
  Hired: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Withdrawn: 'bg-gray-100 text-gray-800'
};

interface ApplicantStatusBadgeProps {
  status: ApplicantStatus | string;
}

export default function ApplicantStatusBadge({ status }: ApplicantStatusBadgeProps) {
  const className =
    STATUS_STYLES[status] ??
    'bg-gray-100 text-gray-800';
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}
    >
      {status}
    </span>
  );
}
