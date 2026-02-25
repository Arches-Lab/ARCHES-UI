import { useEffect, useState, useMemo } from 'react';
import {
  FaGraduationCap,
  FaPlus,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaTrashAlt,
  FaTimes
} from 'react-icons/fa';
import { getTrainings, createTraining, updateTraining, deleteTraining } from '../api/training';
import { Training } from '../models/Training';
import { CreateTrainingRequest, UpdateTrainingRequest } from '../models/Training';
import { useSelectedStore } from '../auth/useSelectedStore';
import TrainingModal from '../components/TrainingModal';

const PAGE_SIZE = 10;

export default function Trainings() {
  const { selectedStore } = useSelectedStore();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Training | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const loadTrainings = async () => {
    if (selectedStore == null) {
      setTrainings([]);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getTrainings({
        search: search || undefined,
        category: filterCategory || undefined,
        active: filterActive
      });
      setTrainings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading trainings:', err);
      setError('Failed to load trainings.');
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, [selectedStore, search, filterCategory, filterActive]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    trainings.forEach(t => t.category && set.add(t.category));
    return Array.from(set).sort();
  }, [trainings]);

  const filteredList = useMemo(() => {
    let list = [...trainings];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(t => (t.title ?? '').toLowerCase().includes(q));
    }
    if (filterCategory) {
      list = list.filter(t => t.category === filterCategory);
    }
    if (filterActive !== null) {
      list = list.filter(t => t.isactive === filterActive);
    }
    return list;
  }, [trainings, search, filterCategory, filterActive]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const handleAdd = () => {
    setEditingTraining(null);
    setShowModal(true);
  };

  const handleEdit = (t: Training) => {
    setEditingTraining(t);
    setShowModal(true);
  };

  const handleSave = async (data: CreateTrainingRequest | UpdateTrainingRequest) => {
    try {
      if (editingTraining) {
        await updateTraining(editingTraining.trainingid, data as UpdateTrainingRequest);
        alert('Training updated successfully.');
      } else {
        await createTraining(data as CreateTrainingRequest);
        alert('Training created successfully.');
      }
      setShowModal(false);
      setEditingTraining(null);
      await loadTrainings();
    } catch (err) {
      console.error('Error saving training:', err);
      throw err;
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await deleteTraining(deactivateTarget.trainingid);
      setDeactivateTarget(null);
      await loadTrainings();
    } catch (err) {
      console.error('Error deactivating training:', err);
      alert('Failed to deactivate training.');
    } finally {
      setDeactivating(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading trainings...</p>
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
            <h2 className="text-2xl font-semibold">Training</h2>
            <p className="text-sm text-gray-600">Manage training courses</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={selectedStore == null}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <FaPlus className="w-4 h-4" />
          Add Training
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="training-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search (title)
            </label>
            <input
              id="training-search"
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by title"
            />
          </div>
          <div>
            <label htmlFor="training-category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="training-category-filter"
              value={filterCategory}
              onChange={e => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="training-active-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Active
            </label>
            <select
              id="training-active-filter"
              value={filterActive === null ? 'all' : filterActive ? 'yes' : 'no'}
              onChange={e => {
                const v = e.target.value;
                setFilterActive(v === 'all' ? null : v === 'yes');
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FaGraduationCap className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trainings</h3>
          <p className="text-gray-600">No trainings match your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Minutes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
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
                {paginated.map(t => (
                  <tr key={t.trainingid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{t.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.category ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.estimatedminutes}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.isactive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {t.isactive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(t.createdon)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(t)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      {t.isactive && (
                        <button
                          type="button"
                          onClick={() => setDeactivateTarget(t)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Deactivate
                        </button>
                      )}
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

      {showModal && selectedStore != null && (
        <TrainingModal
          training={editingTraining}
          onSave={handleSave}
          onCancel={() => {
            setShowModal(false);
            setEditingTraining(null);
          }}
          selectedStore={selectedStore}
        />
      )}

      {deactivateTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Training</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to deactivate &quot;{deactivateTarget.title}&quot;? This will remove it from active
              use.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeactivateTarget(null)}
                disabled={deactivating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivateConfirm}
                disabled={deactivating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deactivating ? (
                  <FaSpinner className="animate-spin w-4 h-4" />
                ) : (
                  <FaTrashAlt className="w-4 h-4" />
                )}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
