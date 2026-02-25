import { useEffect, useState, useMemo } from 'react';
import {
  FaGraduationCap,
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaEdit,
  FaTrashAlt,
  FaTimes
} from 'react-icons/fa';
import {
  getTrainingAssignments,
  createTrainingAssignment,
  updateTrainingAssignmentStatus,
  deleteTrainingAssignment,
  getTrainings,
  getEmployees
} from '../api';
import { TRAINING_ASSIGNMENT_STATUSES } from '../models/TrainingAssignment';
import type { TrainingAssignment } from '../models/TrainingAssignment';
import type { Training } from '../models/Training';
import type { Employee } from '../models/Employee';
import { useSelectedStore } from '../auth/useSelectedStore';
import AssignTrainingModal from '../components/AssignTrainingModal';
import ChangeStatusModal from '../components/ChangeStatusModal';

const PAGE_SIZE = 10;

export default function TrainingAssignments() {
  const { selectedStore } = useSelectedStore();
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTraining, setFilterTraining] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [statusModalAssignment, setStatusModalAssignment] = useState<TrainingAssignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainingAssignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAssignments = async () => {
    if (selectedStore == null) {
      setAssignments([]);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getTrainingAssignments({
        trainingid: filterTraining || undefined,
        employeeid: filterEmployee || undefined,
        status: filterStatus || undefined
      });
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Failed to load training assignments.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [tData, eData] = await Promise.all([getTrainings({ active: true }), getEmployees(true)]);
      setTrainings(Array.isArray(tData) ? tData : []);
      setEmployees(Array.isArray(eData) ? eData : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedStore, filterTraining, filterEmployee, filterStatus]);

  useEffect(() => {
    if (selectedStore != null) loadOptions();
  }, [selectedStore]);

  const filteredList = useMemo(() => [...assignments], [assignments]);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const existingPairs = useMemo(
    () => assignments.map(a => ({ trainingid: a.trainingid, employeeid: a.employeeid })),
    [assignments]
  );

  const handleAssignSave = async (data: Parameters<typeof createTrainingAssignment>[0]) => {
    await createTrainingAssignment(data);
    setShowAssignModal(false);
    await loadAssignments();
  };

  const handleStatusSave = async (assignmentId: string, status: string) => {
    await updateTrainingAssignmentStatus(assignmentId, { status });
    setStatusModalAssignment(null);
    await loadAssignments();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.trainingassignmentid) return;
    setDeleting(true);
    try {
      await deleteTrainingAssignment(deleteTarget.trainingassignmentid);
      setDeleteTarget(null);
      await loadAssignments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete assignment.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assignments...</p>
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
          <FaGraduationCap className="text-3xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-semibold">Training Assignments</h2>
            <p className="text-sm text-gray-600">Assign and manage training for employees</p>
          </div>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          disabled={selectedStore == null}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <FaPlus className="w-4 h-4" />
          Assign Training
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fa-training" className="block text-sm font-medium text-gray-700 mb-1">
              Training
            </label>
            <select
              id="fa-training"
              value={filterTraining}
              onChange={e => {
                setFilterTraining(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {trainings.map(t => (
                <option key={t.trainingid} value={t.trainingid}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fa-employee" className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              id="fa-employee"
              value={filterEmployee}
              onChange={e => {
                setFilterEmployee(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {employees.map(emp => (
                <option key={emp.employeeid} value={emp.employeeid}>
                  {emp.firstname} {emp.lastname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fa-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="fa-status"
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {TRAINING_ASSIGNMENT_STATUSES.map(s => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments</h3>
          <p className="text-gray-600">No training assignments match your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Training Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.map(a => (
                  <tr key={a.trainingassignmentid ?? `${a.trainingid}-${a.employeeid}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {a.training?.title ?? a.trainingid}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {a.employee
                        ? `${a.employee.firstname} ${a.employee.lastname}`
                        : a.employeeid}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(a.dueon)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(a.completedon)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(a.createdon)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                      <button
                        type="button"
                        onClick={() => setStatusModalAssignment(a)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Change Status
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(a)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {currentPage} of {totalPages} ({filteredList.length} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAssignModal && selectedStore != null && (
        <AssignTrainingModal
          existingPairs={existingPairs}
          onSave={handleAssignSave}
          onCancel={() => setShowAssignModal(false)}
          selectedStore={selectedStore}
        />
      )}

      {statusModalAssignment && (
        <ChangeStatusModal
          assignment={statusModalAssignment}
          onSave={handleStatusSave}
          onCancel={() => setStatusModalAssignment(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Assignment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this training assignment?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? <FaSpinner className="animate-spin w-4 h-4" /> : <FaTrashAlt className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
