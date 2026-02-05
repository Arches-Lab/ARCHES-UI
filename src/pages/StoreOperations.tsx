import { useState, useEffect, useMemo, useCallback } from 'react';
import { FaStore, FaSpinner, FaExclamationTriangle, FaSave, FaTimes, FaMoneyBillWave, FaStickyNote } from 'react-icons/fa';
import { useStore } from '../auth/StoreContext';
import { useAuth } from '../auth/AuthContext';
import { getStoreOperations, createStoreOperation, getStoreOperationById } from '../api/storeOperations';
import { StoreOperation } from '../models';

interface StoreOperationFormData {
  operationdate: string;
  posa: number;
  posb: number;
  posc: number;
  posacash: number;
  posbcash: number;
  posccash: number;
  reservecash: number;
  reservecoins: number;
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
  const [showSummary, setShowSummary] = useState(false);
  const [latestOpenOperationId, setLatestOpenOperationId] = useState<string | null>(null);
  const [latestCloseOperationId, setLatestCloseOperationId] = useState<string | null>(null);

  const getCurrentLocalDate = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getLocalDateString = (dateValue: string) => {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue.split('T')[0] || dateValue;
    }
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSafeNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const defaultFormData: StoreOperationFormData = useMemo(() => ({
    operationdate: getCurrentLocalDate(),
    posa: 200,
    posb: 200,
    posc: 200,
    posacash: 0,
    posbcash: 0,
    posccash: 0,
    reservecash: 140,
    reservecoins: 70,
    hundreds: 0,
    fifties: 0,
    twenties: 0,
    tens: 0,
    fives: 0,
    twos: 0,
    ones: 0,
    note: '',
  }), [getCurrentLocalDate]);

  const [formData, setFormData] = useState<StoreOperationFormData>(defaultFormData);
  const showReserveFields = operationType === 'OPEN' || operationType === 'CLOSE';

  const billOptions = useMemo(() => Array.from({ length: 101 }, (_, index) => index), []);

  const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0);

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
    const total = formData.posacash + formData.posbcash + formData.posccash;
    return roundCurrency(total);
  }, [formData.posacash, formData.posbcash, formData.posccash]);

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

  useEffect(() => {
    if (operations.length === 0) {
      setLatestOpenOperationId(null);
      setLatestCloseOperationId(null);
      return;
    }

    const today = getCurrentLocalDate();
    let latestOpenOperation: StoreOperation | null = null;
    let latestCloseOperation: StoreOperation | null = null;
    operations.forEach((operation) => {
      const operationDate = operation.operationdate;
      if (operationDate !== today) {
        return;
      }

      if (operation.operation === 'OPEN') {
        latestOpenOperation = operation;
      }

      if (operation.operation === 'CLOSE') {
        latestCloseOperation = operation;
      }
    });

    setLatestOpenOperationId(latestOpenOperation?.storeoperationid ?? null);
    setLatestCloseOperationId(latestCloseOperation?.storeoperationid ?? null);
  }, [operations, getCurrentLocalDate]);

  useEffect(() => {
    let isActive = true;

    const prefillFormData = async () => {
      if (!operationType) return;

      const operationId = operationType === 'OPEN' ? latestOpenOperationId : latestCloseOperationId;

      if (!operationId) {
        setFormData(defaultFormData);
        return;
      }

      try {
        const operationData = await getStoreOperationById(operationId);

        if (!isActive || !operationData) return;

        setFormData({
          operationdate: operationData.operationdate
            ? getLocalDateString(operationData.operationdate)
            : getCurrentLocalDate(),
          posa: getSafeNumber(operationData.posa),
          posb: getSafeNumber(operationData.posb),
          posc: getSafeNumber(operationData.posc),
          posacash: getSafeNumber(operationData.posacash ?? operationData.posaCash),
          posbcash: getSafeNumber(operationData.posbcash),
          posccash: getSafeNumber(operationData.posccash),
          reservecash: getSafeNumber(operationData.reservecash),
          reservecoins: getSafeNumber(operationData.reservecoins),
          hundreds: getSafeNumber(operationData.hundreds),
          fifties: getSafeNumber(operationData.fifties),
          twenties: getSafeNumber(operationData.twenties),
          tens: getSafeNumber(operationData.tens),
          fives: getSafeNumber(operationData.fives),
          twos: getSafeNumber(operationData.twos),
          ones: getSafeNumber(operationData.ones),
          note: operationData.note ?? '',
        });
      } catch (err) {
        if (isActive) {
          console.error('Error fetching store operation details:', err);
        }
      }
    };

    prefillFormData();

    return () => {
      isActive = false;
    };
  }, [defaultFormData, latestCloseOperationId, latestOpenOperationId, operationType]);

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
        posacash: formData.posacash || 0,
        posbcash: formData.posbcash || 0,
        posccash: formData.posccash || 0,
        reservecash: formData.reservecash || 0,
        reservecoins: formData.reservecoins || 0,
        hundreds: formData.hundreds,
        fifties: formData.fifties,
        twenties: formData.twenties,
        tens: formData.tens,
        fives: formData.fives,
        twos: formData.twos,
        ones: formData.ones,
        // cash: totalCash,
        // coins: 0,
        collectedcash: totalCash,
        postotalcash: posTotal,
        overshort: overShort,
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
    setShowSummary(false);
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
                {operationType === 'CLOSE' && (
                  <button
                    type="button"
                    onClick={() => setShowSummary(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 border border-green-200 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    Summarize
                  </button>
                )}
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

              {showReserveFields && (
                <>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reserve Cash</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.reservecash}
                      onChange={(e) => handleInputChange('reservecash', parseFloat(e.target.value) || 0)}
                      className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reserve Coins</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.reservecoins}
                      onChange={(e) => handleInputChange('reservecoins', parseFloat(e.target.value) || 0)}
                      className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {operationType === 'CLOSE' && (
              <>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">POS-A Cash</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.posacash}
                      onChange={(e) => handleInputChange('posacash', parseFloat(e.target.value) || 0)}
                      className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">POS-B Cash</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.posbcash}
                      onChange={(e) => handleInputChange('posbcash', parseFloat(e.target.value) || 0)}
                      className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">POS-C Cash</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.posccash}
                      onChange={(e) => handleInputChange('posccash', parseFloat(e.target.value) || 0)}
                      className="no-spinner block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
                      required
                    />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">POS Total Cash Collected</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cash Collected</label>
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POS Cash</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Cash</th>
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
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.reservecash}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.reservecoins}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.postotalcash}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{operation.collectedcash}</td>
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

      {showSummary && operationType === 'CLOSE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <style>
            {`@media print {
              body * { visibility: hidden; }
              .summary-print-area, .summary-print-area * { visibility: visible; }
              .summary-print-area { position: absolute; inset: 0; width: 100%; }
            }`}
          </style>
          <div className="summary-print-area w-full max-w-3xl rounded-lg bg-white shadow-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Close Summary</h3>
                <p className="text-sm text-gray-500">Review the close operation details before saving.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                aria-label="Close summary"
              >
                <FaTimes className="h-4 w-4" />
                Close
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">{formData.operationdate}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Associate Name</p>
                  <p className="text-sm font-medium text-gray-900">{user?.email || 'Unknown'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase text-gray-500">POS A Amount</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(formData.posa)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">POS B Amount</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(formData.posb)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">POS C Amount</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(formData.posc)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Reserve Cash</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(formData.reservecash)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Reserve Coins</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(formData.reservecoins)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase text-gray-500">POS A Cash</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(formData.posacash)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">POS B Cash</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(formData.posbcash)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">POS C Cash</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(formData.posccash)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">POS Total Cash</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(posTotal)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Total Cash</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(totalCash)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Over / Short</p>
                  <p className={`text-sm font-medium ${overShort > 0 ? 'text-green-600' : overShort < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatCurrency(overShort)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Cash Denominations</p>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
                  <div>#100 Bills: <span className="font-medium text-gray-900">{formData.hundreds}</span></div>
                  <div>#50 Bills: <span className="font-medium text-gray-900">{formData.fifties}</span></div>
                  <div>#20 Bills: <span className="font-medium text-gray-900">{formData.twenties}</span></div>
                  <div>#10 Bills: <span className="font-medium text-gray-900">{formData.tens}</span></div>
                  <div>#5 Bills: <span className="font-medium text-gray-900">{formData.fives}</span></div>
                  <div>#2 Bills: <span className="font-medium text-gray-900">{formData.twos}</span></div>
                  <div>#1 Bills: <span className="font-medium text-gray-900">{formData.ones}</span></div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Note</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{formData.note || '—'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Print
              </button>
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
