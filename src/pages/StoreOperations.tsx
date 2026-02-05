import { useState, useEffect, useMemo } from 'react';
import { FaStore, FaSpinner, FaExclamationTriangle, FaSave, FaTimes, FaMoneyBillWave, FaStickyNote } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import { useAuth } from '../auth/AuthContext';
import { getStoreOperations, createStoreOperation } from '../api/storeOperations';
import { StoreOperation } from '../models';

interface StoreOperationFormData {
  operationdate: string;
  posa: number;
  posb: number;
  posc: number;
  posACash: number;
  posBCash: number;
  posCCash: number;
  hundreds: number;
  fifties: number;
  twenties: number;
  tens: number;
  fives: number;
  twos: number;
  ones: number;
  note: string;
}

export default function StoreOperations() {
  const { selectedStore } = useStore();
  const { user } = useAuth();
  const [operationType, setOperationType] = useState<'OPEN' | 'CLOSE' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operations, setOperations] = useState<StoreOperation[]>([]);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [operationsError, setOperationsError] = useState<string | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);
  const [notePosition, setNotePosition] = useState({ x: 0, y: 0 });

  const getCurrentLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultFormData: StoreOperationFormData = {
    operationdate: getCurrentLocalDate(),
    posa: 0,
    posb: 0,
    posc: 0,
    posACash: 0,
    posBCash: 0,
    posCCash: 0,
    hundreds: 0,
    fifties: 0,
    twenties: 0,
    tens: 0,
    fives: 0,
    twos: 0,
    ones: 0,
    note: '',
  };

  const [formData, setFormData] = useState<StoreOperationFormData>(defaultFormData);

  const billOptions = useMemo(() => Array.from({ length: 101 }, (_, index) => index), []);

  const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

  const totalCash = useMemo(() => {
    const total = (formData.hundreds * 100)
      + (formData.fifties * 50)
      + (formData.twenties * 20)
      + (formData.tens * 10)
      + (formData.fives * 5)
      + (formData.twos * 2)
      + (formData.ones * 1);
    return roundCurrency(total);
  }, [
    formData.fifties,
    formData.fives,
    formData.hundreds,
    formData.ones,
    formData.tens,
    formData.twenties,
    formData.twos,
  ]);

  const posTotal = useMemo(() => {
    const total = formData.posACash + formData.posBCash + formData.posCCash;
    return roundCurrency(total);
  }, [formData.posACash, formData.posBCash, formData.posCCash]);

  const overShort = useMemo(() => {
    return roundCurrency(totalCash - posTotal);
  }, [posTotal, totalCash]);

  // Fetch operations list
  useEffect(() => {
    const fetchOperations = async () => {
      if (!selectedStore) return;

      try {
        setOperationsLoading(true);
        setOperationsError(null);
        
        console.log(`🔄 Fetching store operations for store: ${selectedStore}`);
        
        const operationsData = await getStoreOperations(selectedStore);
        console.log('Store operations data:', operationsData);
        
        setOperations(Array.isArray(operationsData) ? operationsData : []);
      } catch (err) {
        console.error('Error fetching store operations:', err);
        setOperationsError('Failed to load store operations. Please try again later.');
      } finally {
        setOperationsLoading(false);
      }
    };

    fetchOperations();
  }, [selectedStore]);

  const handleOperationSelect = (type: 'OPEN' | 'CLOSE') => {
    setOperationType(type);
    setFormData(defaultFormData);
  };

  const handleInputChange = (field: keyof StoreOperationFormData, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!');
    console.log('operationType:', operationType);
    console.log('selectedStore:', selectedStore);
    console.log('user:', user);
    
    if (!operationType || !selectedStore || !user) {
      console.log('Validation failed:', { operationType, selectedStore, user });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const operationData = {
        storenumber: selectedStore,
        operation: operationType,
        operationdate: getCurrentLocalDate(),
        posa: formData.posa || 0,
        posb: formData.posb || 0,
        posc: formData.posc || 0,
        posACash: formData.posACash || 0,
        posBCash: formData.posBCash || 0,
        posCCash: formData.posCCash || 0,
        hundreds: formData.hundreds,
        fifties: formData.fifties,
        twenties: formData.twenties,
        tens: formData.tens,
        fives: formData.fives,
        twos: formData.twos,
        ones: formData.ones,
        cash: totalCash,
        coins: 0,
        totalCash,
        posTotal,
        overShort,
        note: formData.note || null,
        createdby: user.id || user.email || 'Unknown',
      };

      console.log('Submitting operation:', operationData);
      
      // Use actual API call
      const result = await createStoreOperation(operationData);
      console.log('Operation created successfully:', result);
      
      // Refresh operations list
      const operationsData = await getStoreOperations(selectedStore);
      setOperations(Array.isArray(operationsData) ? operationsData : []);
      
      // Reset form
      setOperationType(null);
      setFormData(defaultFormData);
      
      // Show success message (optional)
      console.log('Store operation created successfully!');
      
    } catch (err) {
      console.error('Error submitting operation:', err);
      setError('Failed to submit operation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOperationType(null);
    setFormData(defaultFormData);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const getOperationTypeColor = (type: string) => {
    return type === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaStore className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Selected</h3>
          <p className="text-gray-500">Please select a store to perform operations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaStore className="text-3xl text-green-600" />
          <h2 className="text-2xl font-semibold">Store Operations</h2>
        </div>
      </div>

      {!operationType ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          {/* <div className="text-center mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Operation Type</h3>
            <p className="text-gray-600">Choose whether you're opening or closing the store</p>
          </div> */}
          
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleOperationSelect('OPEN')}
              className="flex items-center gap-3 px-8 py-4 text-lg font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <FaStore className="w-6 h-6" />
              OPEN STORE
            </button>
            
            <button
              onClick={() => handleOperationSelect('CLOSE')}
              className="flex items-center gap-3 px-8 py-4 text-lg font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <FaStore className="w-6 h-6" />
              CLOSE STORE
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {operationType === 'OPEN' ? 'Opening Store' : 'Closing Store'}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => console.log('Save button clicked!')}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin w-4 h-4" />
                  ) : (
                    <FaSave className="w-4 h-4" />
                  )}
                  {loading ? 'Saving...' : `Save ${operationType}`}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-end">
              {/* A */}
              <div className="flex-1 min-w-[80px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">POS-A</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.posa}
                  onChange={(e) => handleInputChange('posa', parseFloat(e.target.value) || 0)}
                  className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                  required
                />
              </div>

              {/* B */}
              <div className="flex-1 min-w-[80px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">POS-B</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.posb}
                  onChange={(e) => handleInputChange('posb', parseFloat(e.target.value) || 0)}
                  className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                  required
                />
              </div>

              {/* C */}
              <div className="flex-1 min-w-[80px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">POS-C</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.posc}
                  onChange={(e) => handleInputChange('posc', parseFloat(e.target.value) || 0)}
                  className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                  required
                />
              </div>
            </div>

            {operationType === 'CLOSE' && (
              <>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">POS-A Cash</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.posACash}
                      onChange={(e) => handleInputChange('posACash', parseFloat(e.target.value) || 0)}
                      className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">POS-B Cash</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.posBCash}
                      onChange={(e) => handleInputChange('posBCash', parseFloat(e.target.value) || 0)}
                      className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">POS-C Cash</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.posCCash}
                      onChange={(e) => handleInputChange('posCCash', parseFloat(e.target.value) || 0)}
                      className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">POS Total</label>
                    <input
                      type="text"
                      value={posTotal.toFixed(2)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 h-10"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaMoneyBillWave className="w-4 h-4" />
                    Cash Denominations
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">#100 Bills</label>
                      <select
                        value={formData.hundreds}
                        onChange={(e) => handleInputChange('hundreds', parseInt(e.target.value, 10) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      >
                        {billOptions.map((option) => (
                          <option key={`hundreds-${option}`} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">#50 Bills</label>
                      <select
                        value={formData.fifties}
                        onChange={(e) => handleInputChange('fifties', parseInt(e.target.value, 10) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      >
                        {billOptions.map((option) => (
                          <option key={`fifties-${option}`} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">#20 Bills</label>
                      <select
                        value={formData.twenties}
                        onChange={(e) => handleInputChange('twenties', parseInt(e.target.value, 10) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      >
                        {billOptions.map((option) => (
                          <option key={`twenties-${option}`} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">#10 Bills</label>
                      <select
                        value={formData.tens}
                        onChange={(e) => handleInputChange('tens', parseInt(e.target.value, 10) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      >
                        {billOptions.map((option) => (
                          <option key={`tens-${option}`} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">#5 Bills</label>
                      <select
                        value={formData.fives}
                        onChange={(e) => handleInputChange('fives', parseInt(e.target.value, 10) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      >
                        {billOptions.map((option) => (
                          <option key={`fives-${option}`} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">#2 Bills</label>
                      <select
                        value={formData.twos}
                        onChange={(e) => handleInputChange('twos', parseInt(e.target.value, 10) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      >
                        {billOptions.map((option) => (
                          <option key={`twos-${option}`} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">#1 Bills</label>
                      <select
                        value={formData.ones}
                        onChange={(e) => handleInputChange('ones', parseInt(e.target.value, 10) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      >
                        {billOptions.map((option) => (
                          <option key={`ones-${option}`} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Cash</label>
                      <input
                        type="text"
                        value={totalCash.toFixed(2)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 h-10"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Over / Short</label>
                      <input
                        type="text"
                        value={overShort.toFixed(2)}
                        className={`block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-10 ${
                          overShort > 0 ? 'text-green-600' : overShort < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}
                        readOnly
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (Optional)
                      </label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => handleInputChange('note', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        rows={1}
                        placeholder="Add any additional notes about this operation..."
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Note field - Full width (for OPEN operations) */}
            {operationType === 'OPEN' && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={1}
                  placeholder="Add any additional notes about this operation..."
                />
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
            </div>
          </form>
        </div>
      )}

      {/* Operations History List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Last 7 Days Operations</h3>
        </div> */}
        
        {operationsLoading ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-2xl text-gray-400" />
          </div>
        ) : operationsError ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <FaExclamationTriangle className="text-4xl mr-2" />
            <p>{operationsError}</p>
          </div>
        ) : operations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <FaStore className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Operations Found</h3>
              <p className="text-gray-500">No store operations found for the last 7 days.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POS-A</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POS-B</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POS-C</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CASH</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COIN</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOTE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By/On</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations.map((operation) => (
                  <tr key={operation.storeoperationid} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                      {operation.operationdate}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full ${getOperationTypeColor(operation.operation)}`}>
                        {operation.operation}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.posa}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.posb}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.posc}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.cash}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.coins}</td>
                    <td className="px-4 py-2 text-xs text-gray-900 max-w-[200px]">
                      {operation.note ? (
                        <div 
                          className="inline-flex items-center cursor-pointer text-blue-600 hover:text-blue-800"
                          onMouseEnter={(e) => {
                            setHoveredNote(operation.note);
                            setNotePosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={() => setHoveredNote(null)}
                        >
                          <FaStickyNote className="w-4 h-4 mr-1" />
                          {/* <span className="truncate max-w-[150px]" title={operation.note}>
                            {operation.note.length > 20 ? operation.note.substring(0, 20) + '...' : operation.note}
                          </span> */}
                        </div>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                      {operation.creator ? `${operation.creator.firstname} ${operation.creator.lastname}` : operation.createdby}
                      {/* <br /> */}
                      <span className="text-gray-400">({formatDate(operation.createdon)})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note Overlay */}
      {hoveredNote && (
        <div 
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md"
          style={{
            left: notePosition.x + 10,
            top: notePosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-start gap-2">
            <FaStickyNote className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-900 whitespace-pre-wrap">
              {hoveredNote}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
