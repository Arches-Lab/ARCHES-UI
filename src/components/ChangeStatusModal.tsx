import { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { TRAINING_ASSIGNMENT_STATUSES, type TrainingAssignment, type TrainingAssignmentStatus } from '../models/TrainingAssignment';

interface ChangeStatusModalProps {
  assignment: TrainingAssignment;
  onSave: (assignmentId: string, status: string) => Promise<void>;
  onCancel: () => void;
}

export default function ChangeStatusModal({ assignment, onSave, onCancel }: ChangeStatusModalProps) {
  const [status, setStatus] = useState(assignment.status);
  const [submitting, setSubmitting] = useState(false);
  const [confirmCompleted, setConfirmCompleted] = useState(false);
  const isCompleting = status === 'COMPLETED' && assignment.status !== 'COMPLETED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment.trainingassignmentid) return;
    if (isCompleting && !confirmCompleted) {
      setConfirmCompleted(true);
      return;
    }
    setSubmitting(true);
    try {
      await onSave(assignment.trainingassignmentid, status);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Change Status</h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status-select"
              value={status}
              onChange={e => {
                setStatus(e.target.value as TrainingAssignmentStatus);
                setConfirmCompleted(false);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TRAINING_ASSIGNMENT_STATUSES.map(s => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {isCompleting && !confirmCompleted && (
            <p className="text-sm text-amber-600">
              Mark this assignment as completed? Click Save again to confirm.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              {submitting ? 'Saving...' : isCompleting && !confirmCompleted ? 'Confirm' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
