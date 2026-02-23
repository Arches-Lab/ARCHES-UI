import { Applicant } from '../models/Applicant';
import ApplicantStatusBadge from './ApplicantStatusBadge';

interface ApplicantTableProps {
  applicants: Applicant[];
  onRowClick: (applicant: Applicant) => void;
  emptyMessage?: string;
}

/** Format date string as mm/dd/yyyy without timezone conversion (display the actual date only). */
function formatDateOnly(dateStr: string): string {
  const s = dateStr.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return dateStr;
  const [y, m, d] = s.split('-');
  return `${m}/${d}/${y}`;
}

export default function ApplicantTable({
  applicants,
  onRowClick,
  emptyMessage = 'No applicants found.'
}: ApplicantTableProps) {
  if (applicants.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Interview
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hired
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applicants.map((applicant, index) => (
            <tr
              key={applicant.applicantid ?? index}
              onClick={() => applicant.applicantid != null && onRowClick(applicant)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {applicant.firstname} {applicant.lastname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {applicant.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {applicant.positionapplied}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ApplicantStatusBadge status={applicant.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {applicant.applieddate ? formatDateOnly(applicant.applieddate) : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {applicant.interviewdate ? formatDateOnly(applicant.interviewdate) : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {applicant.hireddate ? formatDateOnly(applicant.hireddate) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
