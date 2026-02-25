import { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { getTrainings } from '../api/training';
import { getEmployees } from '../api/employee';
import { Training } from '../models/Training';
import { Employee } from '../models/Employee';
import { CreateTrainingAssignmentRequest } from '../models/TrainingAssignment';

interface AssignTrainingModalProps {
  existingPairs: { trainingid: string; employeeid: string }[];
  onSave: (data: CreateTrainingAssignmentRequest) => Promise<void>;
  onCancel: () => void;
  selectedStore: number;
}

export default function AssignTrainingModal({
  existingPairs,
  onSave,
  onCancel,
  selectedStore
}: AssignTrainingModalProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainingid, setTrainingid] = useState('');
  const [employeeid, setEmployeeid] = useState('');
  const [dueon, setDueon] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [tData, eData] = await Promise.all([
          getTrainings({ active: true }),
          getEmployees(true)
        ]);
        setTrainings(Array.isArray(tData) ? tData : []);
        setEmployees(Array.isArray(eData) ? eData : []);
      } catch (err) {
        console.error(err);
        setError('Failed to load trainings or employees.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isDuplicate = trainingid && employeeid && existingPairs.some(
    p => p.trainingid === trainingid && p.employeeid === employeeid
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingid || !employeeid) {
      setError('Please select both Training and Employee.');
      return;
    }
    if (isDuplicate) {
      setError('This training is already assigned to this employee.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSave({
        storenumber: selectedStore,
        trainingid,
        employeeid,
        ...(dueon ? { dueon } : {})
      });
    } catch (err) {
      console.error(err);
      setError('Failed to assign training.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Assign Training</h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            <>
              <div>
                <label htmlFor="assign-training" className="block text-sm font-medium text-gray-700 mb-2">
                  Training
                </label>
                <select
                  id="assign-training"
                  value={trainingid}
                  onChange={e => setTrainingid(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select training</option>
                  {trainings.map(t => (
                    <option key={t.trainingid} value={t.trainingid}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="assign-employee" className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  id="assign-employee"
                  value={employeeid}
                  onChange={e => setEmployeeid(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp.employeeid} value={emp.employeeid}>
                      {emp.firstname} {emp.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="assign-dueon" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (optional)
                </label>
                <input
                  id="assign-dueon"
                  type="date"
                  value={dueon}
                  onChange={e => setDueon(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {isDuplicate && (
                <p className="text-sm text-amber-600">This assignment already exists.</p>
              )}
            </>
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
              disabled={loading || submitting || !!isDuplicate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <FaSave className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
