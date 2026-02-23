import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaUserPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaCalendar,
  FaFileAlt,
  FaExternalLinkAlt,
  FaTimes,
  FaUserCheck
} from 'react-icons/fa';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getApplicant, deleteApplicant, updateApplicant, convertToEmployee } from '../api/applicant';
import { getEmployee } from '../api/employee';
import { Applicant, CreateApplicantRequest } from '../models/Applicant';
import ApplicantStatusBadge from '../components/ApplicantStatusBadge';
import ActivitiesList from '../components/ActivitiesList';
import ApplicantForm from '../components/ApplicantForm';

export default function ApplicantDetail() {
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();
  const { selectedStore } = useSelectedStore();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [activitiesRefreshKey, setActivitiesRefreshKey] = useState(0);
  const [convertedEmployeeName, setConvertedEmployeeName] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!applicantId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getApplicant(applicantId);
        setApplicant(data);
      } catch (err) {
        console.error('Error loading applicant:', err);
        setError('Failed to load applicant.');
        setApplicant(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [applicantId]);

  useEffect(() => {
    const load = async () => {
      if (!applicant?.convertedtoemployeeid) {
        setConvertedEmployeeName(null);
        return;
      }
      try {
        const emp = await getEmployee(applicant.convertedtoemployeeid);
        const name = [emp.firstname, emp.lastname].filter(Boolean).join(' ') || emp.email || 'Employee';
        setConvertedEmployeeName(name);
      } catch {
        setConvertedEmployeeName(null);
      }
    };
    load();
  }, [applicant?.convertedtoemployeeid]);

  /** Format date string as mm/dd/yyyy without timezone conversion (for applied/interview/hired dates). */
  const formatDateOnly = (dateStr: string) => {
    const s = dateStr.trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return dateStr;
    const [y, m, d] = s.split('-');
    return `${m}/${d}/${y}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleDelete = async () => {
    if (!applicantId) return;
    try {
      await deleteApplicant(applicantId);
      setShowDeleteConfirm(false);
      navigate('/applicants');
    } catch (err) {
      console.error('Error deleting applicant:', err);
      alert('Failed to delete applicant.');
    }
  };

  const handleSaveEdit = async (data: CreateApplicantRequest) => {
    if (!applicantId || !applicant) return;
    setFormSubmitting(true);
    try {
      await updateApplicant(applicantId, data);
      const updated = await getApplicant(applicantId);
      setApplicant(updated);
      setShowEditModal(false);
      setActivitiesRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Error saving applicant:', err);
      throw err;
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConvertToEmployee = async () => {
    if (!applicantId || !applicant) return;
    setConverting(true);
    try {
      await convertToEmployee(applicantId);
      const updated = await getApplicant(applicantId);
      setApplicant(updated);
      if (updated.convertedtoemployeeid) {
        const emp = await getEmployee(updated.convertedtoemployeeid);
        const name = [emp.firstname, emp.lastname].filter(Boolean).join(' ') || emp.email || 'Employee';
        setConvertedEmployeeName(name);
      }
    } catch (err) {
      console.error('Error converting to employee:', err);
      alert('Failed to convert to employee.');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading applicant...</p>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error || 'Applicant not found.'}</p>
          <button
            onClick={() => navigate('/applicants')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Back to Applicants
          </button>
        </div>
      </div>
    );
  }

  const isHired = applicant.status === 'Hired';
  const hasResume = !!applicant.resumeurl?.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaUserPlus className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold">
              {applicant.firstname} {applicant.lastname}
            </h2>
            <p className="text-sm text-gray-600">{applicant.positionapplied}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/applicants')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Applicants
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <FaEdit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FaTrash className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <FaEnvelope className="w-4 h-4 text-gray-400 shrink-0" />
              <a href={`mailto:${applicant.email}`} className="text-blue-600 hover:underline truncate">
                {applicant.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FaPhone className="w-4 h-4 text-gray-400 shrink-0" />
              {applicant.phone ? (
                <a href={`tel:${applicant.phone}`} className="text-blue-600 hover:underline">
                  {applicant.phone}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-start">
              <ApplicantStatusBadge status={applicant.status} />
              {isHired && !applicant.convertedtoemployeeid && (
                <button
                  type="button"
                  onClick={handleConvertToEmployee}
                  disabled={converting || selectedStore == null}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded w-fit"
                >
                  <FaUserCheck className="w-4 h-4" />
                  {converting ? 'Converting...' : 'Convert to Employee'}
                </button>
              )}
              {isHired && applicant.convertedtoemployeeid && convertedEmployeeName && (
                <Link
                  to={`/employees/${applicant.convertedtoemployeeid}`}
                  className="text-sm text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded w-fit inline-flex items-center gap-1 no-underline"
                >
                  <FaUserCheck className="w-4 h-4 shrink-0" />
                  <span>Employee: {convertedEmployeeName}</span>
                </Link>
              )}
              {isHired && applicant.convertedtoemployeeid && !convertedEmployeeName && (
                <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded w-fit">
                  Employee: —
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FaBriefcase className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{applicant.positionapplied}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FaCalendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Applied: {applicant.applieddate ? formatDateOnly(applicant.applieddate) : '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              {applicant.source ? (
                <>
                  <span className="text-gray-500 shrink-0">Source:</span>
                  <span>{applicant.source}</span>
                </>
              ) : (
                applicant.lastupdated && (
                  <span className="text-gray-500 text-xs">
                    Last updated: {formatDate(applicant.lastupdated)}
                  </span>
                )
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FaCalendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Interview: {applicant.interviewdate ? formatDateOnly(applicant.interviewdate) : '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FaCalendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Hired: {applicant.hireddate ? formatDateOnly(applicant.hireddate) : '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              {(applicant.createdby || applicant.createdon) && (
                <span className="text-gray-500 text-xs">
                  Created
                  {applicant.creator
                    ? ` by ${[applicant.creator.firstname, applicant.creator.lastname].filter(Boolean).join(' ') || applicant.creator.email || applicant.createdby}`
                    : applicant.createdby
                      ? ` by ${applicant.createdby}`
                      : ''}
                  {applicant.createdon ? ` on ${formatDate(applicant.createdon)}` : ''}
                </span>
              )}
            </div>
          </div>
          {hasResume && (
            <div className="pt-2">
              <a
                href={applicant.resumeurl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <FaFileAlt className="w-4 h-4" />
                View resume
                <FaExternalLinkAlt className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {applicant.applicantid && (
        <ActivitiesList
          parentType="APPLICANT"
          parentId={applicant.applicantid}
          title="Activities"
          storeNumber={selectedStore ?? 0}
          refreshTrigger={activitiesRefreshKey}
        />
      )}

      {showEditModal && applicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaUserPlus className="text-2xl text-blue-600" />
                <h2 className="text-xl font-semibold">Edit Applicant</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ApplicantForm
                key={applicant.applicantid ?? 'edit'}
                applicant={applicant}
                storeNumber={selectedStore ?? applicant.storenumber}
                onSubmit={handleSaveEdit}
                onCancel={() => setShowEditModal(false)}
                isSubmitting={formSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete applicant?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This cannot be undone. All activities and notes will be removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
