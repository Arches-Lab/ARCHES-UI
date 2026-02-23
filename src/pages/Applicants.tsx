import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaSpinner, FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa';
import { useSelectedStore } from '../auth/useSelectedStore';
import { getApplicants, createApplicant } from '../api/applicant';
import { Applicant, APPLICANT_STATUSES } from '../models/Applicant';
import ApplicantTable from '../components/ApplicantTable';
import ApplicantForm from '../components/ApplicantForm';

const PAGE_SIZE = 10;

export default function Applicants() {
  const navigate = useNavigate();
  const { selectedStore } = useSelectedStore();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(APPLICANT_STATUSES[0] ?? 'Applied');
  const [filterPosition, setFilterPosition] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadApplicants = async () => {
    if (selectedStore == null) {
      setApplicants([]);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getApplicants({
        status: filterStatus || undefined,
        positionapplied: filterPosition || undefined,
        search: search || undefined
      });
      setApplicants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading applicants:', err);
      setError('Failed to load applicants.');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [selectedStore, filterStatus, filterPosition, search]);

  const sortedApplicants = useMemo(() => {
    const list = [...applicants];
    list.sort((a, b) => {
      const da = (a.applieddate ? new Date(a.applieddate) : new Date(0)).getTime();
      const db = (b.applieddate ? new Date(b.applieddate) : new Date(0)).getTime();
      return db - da;
    });
    return list;
  }, [applicants]);

  const filteredBySearch = useMemo(() => {
    if (!search.trim()) return sortedApplicants;
    const q = search.trim().toLowerCase();
    return sortedApplicants.filter(
      (a) =>
        (a.firstname ?? '').toLowerCase().includes(q) ||
        (a.lastname ?? '').toLowerCase().includes(q) ||
        (a.email ?? '').toLowerCase().includes(q)
    );
  }, [sortedApplicants, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBySearch.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBySearch.slice(start, start + PAGE_SIZE);
  }, [filteredBySearch, currentPage]);

  const handleRowClick = (applicant: Applicant) => {
    if (applicant.applicantid) navigate(`/applicants/${applicant.applicantid}`);
  };

  const handleSaveNewApplicant = async (data: Parameters<typeof createApplicant>[0]) => {
    setFormSubmitting(true);
    try {
      await createApplicant(data);
      await loadApplicants();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving applicant:', err);
      throw err;
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FaUserPlus className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold">Applicants</h2>
            <p className="text-sm text-gray-600">Manage job applicants</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label htmlFor="applicant-status" className="sr-only">
              Status
            </label>
            <select
              id="applicant-status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="block min-w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {APPLICANT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={selectedStore == null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="w-4 h-4" />
            Add Applicant
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <ApplicantTable
          applicants={paginatedApplicants}
          onRowClick={handleRowClick}
          emptyMessage="No applicants found."
        />
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <span>
              Page {currentPage} of {totalPages} ({filteredBySearch.length} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedStore != null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaUserPlus className="text-2xl text-blue-600" />
                <h2 className="text-xl font-semibold">New Applicant</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ApplicantForm
                storeNumber={selectedStore}
                onSubmit={handleSaveNewApplicant}
                onCancel={() => setShowModal(false)}
                isSubmitting={formSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
