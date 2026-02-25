import { useEffect, useState } from 'react';
import { FaGraduationCap, FaSpinner, FaExclamationTriangle, FaPlay, FaForward, FaCheck } from 'react-icons/fa';
import { getTrainingAssignmentsForEmployee, updateTrainingAssignmentStatus } from '../api/trainingAssignment';
import { TRAINING_ASSIGNMENT_STATUSES } from '../models/TrainingAssignment';
import type { TrainingAssignment } from '../models/TrainingAssignment';
import { useAuth } from '../auth/AuthContext';

export default function EmployeeTraining() {
  const { employeeId } = useAuth();
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAssignments = async () => {
    if (!employeeId) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getTrainingAssignmentsForEmployee(employeeId);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading my trainings:', err);
      setError('Failed to load your training assignments.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [employeeId]);

  const handleStatusUpdate = async (assignment: TrainingAssignment, newStatus: string) => {
    const id = assignment.trainingassignmentid;
    if (!id) return;
    setUpdatingId(id);
    try {
      await updateTrainingAssignmentStatus(id, { status: newStatus });
      await loadAssignments();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
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

  const getActionButton = (a: TrainingAssignment) => {
    const status = a.status?.toUpperCase?.() ?? '';
    const isUpdating = !!a.trainingassignmentid && updatingId === a.trainingassignmentid;

    if (status === 'COMPLETED') {
      return (
        <span className="text-gray-400 text-sm">Completed</span>
      );
    }
    if (status === 'ASSIGNED') {
      return (
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleStatusUpdate(a, 'IN_PROGRESS')}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isUpdating ? <FaSpinner className="animate-spin w-3 h-3" /> : <FaPlay className="w-3 h-3" />}
          Start
        </button>
      );
    }
    if (status === 'IN_PROGRESS') {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleStatusUpdate(a, 'IN_PROGRESS')}
            className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-800 disabled:opacity-50"
          >
            {isUpdating ? <FaSpinner className="animate-spin w-3 h-3" /> : <FaForward className="w-3 h-3" />}
            Continue
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => {
              if (window.confirm('Mark this training as completed?')) {
                handleStatusUpdate(a, 'COMPLETED');
              }
            }}
            className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
          >
            <FaCheck className="w-3 h-3" />
            Mark Complete
          </button>
        </div>
      );
    }
    return null;
  };

  if (!employeeId) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center text-gray-600">
          <p>You must be logged in as an employee to view your trainings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your trainings...</p>
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
      <div className="flex items-center gap-3">
        <FaGraduationCap className="text-3xl text-blue-600" />
        <div>
          <h2 className="text-2xl font-semibold">My Training</h2>
          <p className="text-sm text-gray-600">View and complete your assigned trainings</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trainings Assigned</h3>
          <p className="text-gray-600">You have no training assignments at this time.</p>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map(a => (
                  <tr key={a.trainingassignmentid ?? `${a.trainingid}-${a.employeeid}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {a.training?.title ?? a.trainingid}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          a.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : a.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800'
                              : a.status === 'ASSIGNED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {a.status?.replace('_', ' ') ?? a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(a.dueon)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(a.completedon)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {getActionButton(a)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
