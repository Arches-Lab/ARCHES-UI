import React, { useState, useEffect } from 'react';
import { FaSms, FaPhone, FaUser, FaClock, FaArchive, FaFilter, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { getTexts, archiveText } from '../api/texts';
import { Text } from '../models/Text';
import { useStore } from '../auth/StoreContext';

export default function Texts() {
  console.log('🚀 Texts component rendered!');
  
  // Simple test render to see if component is working
  console.log('🧪 Component is rendering!');
  
  const { selectedStore } = useStore();
  const [texts, setTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string; textId: string } | null>(null);
  const [fromFilter, setFromFilter] = useState<string>('');
  
  // Function to handle archiving a text
  const handleArchive = async (textId: string) => {
    try {
      console.log('Archiving text:', textId);
      
      // Call the API to archive the text
      const archivedText = await archiveText(textId);
      console.log('API response for archived text:', archivedText);
      
      // Update local state with the archived text
      setTexts(prevTexts => 
        prevTexts.map(text => 
          text.textid === textId 
            ? {
                ...text,
                archivedon: archivedText.archivedon,
                archiver: archivedText.archiver || {
                  firstname: 'Current',
                  lastname: 'User',
                  email: null
                }
              }
            : text
        )
      );
      
      // Close modal if archiving from modal
      if (expandedImage && expandedImage.textId === textId) {
        setExpandedImage(null);
      }
      
      console.log('Text archived successfully:', archivedText);
    } catch (error) {
      console.error('Error archiving text:', error);
      // TODO: Show error message to user
    }
  };

  console.log('📱 Texts component - selectedStore:', selectedStore);
  console.log('📱 Texts component - texts state:', texts);
  console.log('📱 Texts component - loading state:', loading);
  console.log('📱 Texts component - error state:', error);

  useEffect(() => {
    console.log('🔄 useEffect triggered - selectedStore:', selectedStore);
    
    const fetchTexts = async () => {
      if (!selectedStore) {
        console.log('⚠️ No selectedStore, skipping fetch');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching texts for store: ${selectedStore}`);
        
        const textsData = await getTexts();
        console.log('Texts data received:', textsData);
        console.log('Texts data type:', typeof textsData);
        console.log('Texts data is array:', Array.isArray(textsData));
        console.log('Texts data length:', textsData?.length);
        console.log('Texts data keys:', textsData ? Object.keys(textsData) : 'no data');
        console.log('Texts data structure:', JSON.stringify(textsData, null, 2));
        
        setTexts(Array.isArray(textsData) ? textsData : []);
        console.log('Texts state updated with:', Array.isArray(textsData) ? textsData : []);

        // // Debug media properties specifically
        // if (Array.isArray(textsData) && textsData.length > 0) {
        //   console.log('🔍 Sample text media properties:');
        //   textsData.slice(0, 3).forEach((text, index) => {
        //     console.log(`  Text ${index}:`, {
        //       textid: text.textid,
        //       media: text.media,
        //       mediaType: typeof text.media,
        //       isArray: Array.isArray(text.media),
        //       mediaLength: text.media ? text.media.length : 'N/A',
        //       mediaItems: text.media ? text.media.map(item => ({
        //         filename: item.filename,
        //         contentType: item.contentType,
        //         contentLength: item.content ? item.content.length : 'N/A'
        //       })) : 'N/A'
        //     });
        //   });
        // }
      } catch (err) {
        console.error('Error fetching texts:', err);
        setError('Failed to load texts. Please try again later.');
      } finally {
        setLoading(false);
        console.log('🔄 Loading finished');
      }
    };

    fetchTexts();
  }, [selectedStore]);

  // Debug effect to monitor texts state changes
  useEffect(() => {
    console.log('🔄 Texts state changed:', texts);
    console.log('🔄 Texts state length:', texts.length);
  }, [texts]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different phone number lengths
    if (cleaned.length === 10) {
      // Standard 10-digit US number: (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // 11-digit number starting with 1: 1 (XXX) XXX-XXXX
      return `1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 7) {
      // 7-digit number: XXX-XXXX
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      // For other formats, return as is or with basic formatting
      return phone;
    }
  };

  // Filter texts based on archived status and from field
  const filteredTexts = texts.filter(text => {
    // Filter by archived status
    const archivedFilter = showArchived 
      ? text.archivedby && text.archivedon
      : !text.archivedby && !text.archivedon;
    
    // Filter by from field (case-insensitive)
    const fromFilterMatch = fromFilter 
      ? text.from.toLowerCase().includes(fromFilter.toLowerCase())
      : true;
    
    return archivedFilter && fromFilterMatch;
  });

  console.log('🔍 Render check - selectedStore:', selectedStore);
  console.log('🔍 Render check - texts length:', texts.length);
  console.log('🔍 Render check - loading:', loading);
  console.log('🔍 Render check - error:', error);
  console.log('🔍 Render check - filteredTexts length:', filteredTexts.length);
  console.log('🔍 Render check - showArchived:', showArchived);
  console.log('🔍 Render check - all texts:', texts);
  console.log('🔍 Render check - filtered texts:', filteredTexts);
  
  if (!selectedStore) {
    console.log('⚠️ No store selected, showing store selection message');
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <FaSms className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Selected</h3>
          <p className="text-gray-500">Please select a store to view texts.</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering main content');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaSms className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-semibold">Texts</h2>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Total:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 font-medium rounded">
              {filteredTexts.length} texts
            </span>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-6">
          {/* <div className="flex items-center gap-4">
            <FaFilter className="text-gray-500" />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Archived Texts</span>
            </label>
          </div> */}
          
          <div className="flex items-center gap-2">
            <FaPhone className="text-gray-500" />
            {/* <span className="text-sm font-medium text-gray-700 mr-2">Filter by Sender:</span> */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFromFilter('')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  fromFilter === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Senders
              </button>
              {Array.from(new Set(texts.map(text => text.from)))
                .sort()
                .map(phoneNumber => (
                  <button
                    key={phoneNumber}
                    onClick={() => setFromFilter(phoneNumber)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      fromFilter === phoneNumber 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatPhoneNumber(phoneNumber)}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FaSpinner className="animate-spin text-2xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading texts...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Texts List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTexts.length === 0 ? (
            <div className="p-8 text-center">
              <FaSms className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showArchived ? 'No Archived Texts' : 'No Texts'}
              </h3>
              <p className="text-gray-500">
                {showArchived 
                  ? 'No archived texts found for this store.'
                  : 'No texts found for this store.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From/To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Media
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTexts.map((text) => (
                    <tr key={text.textid} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FaPhone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              From: {formatPhoneNumber(text.from)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaPhone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              To: {formatPhoneNumber(text.to)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-2/5">
                        <div className="max-w-full">
                          <p className="text-sm text-gray-900 break-words" title={text.body}>
                            {text.body}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                          {(() => {
                            // Function to construct data URL using the working pattern
                            const getImageSrc = () => {

                              if (!text.mediaBase64) return null;

                              const src = `data:image/png;base64,${text.mediaBase64}`;
                              console.log('🔍 Media Base64:', text.mediaBase64);
                              return src;
                            };

                            const imageSrc = getImageSrc();

                            // Debug logging
                            if (text.media) {
                              console.log('🔍 Media debug for text:', text.textid, {
                                media: text.media,
                                media_encoded: text.media_encoded,
                                mediacontenttype: text.mediacontenttype,
                                mediatype: text.mediatype,
                                imageSrc: imageSrc,
                                mediaLength: text.media ? text.media.length : 'N/A'
                              });
                            }

                            return imageSrc ? (
                              <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={imageSrc}
                                  alt={`Media ${text.mediatype || 'content'}`}
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setExpandedImage({ src: imageSrc, alt: `Media ${text.mediatype || 'content'}`, textId: text.textid })}
                                  onError={(e) => {
                                    console.error('❌ Image failed to load for text:', text.textid, {
                                      media: text.media,
                                      media_encoded: text.media_encoded,
                                      mediacontenttype: text.mediacontenttype,
                                      imageSrc: imageSrc,
                                      mediaLength: text.media ? text.media.length : 'N/A'
                                    });
                                    // Fallback to placeholder if image fails to load
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAgNDAgNDAgNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMCAwQzguOTUgMCAwIDguOTUgMCAyMEMwIDMxLjA1IDguOTUgNDAgMjAgNDBDMzEuMDUgNDAgNDAgMzEuMDUgNDAgMjBDNDAgOC45NSAzMS4wNSAwIDIwIDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCAyQzMwLjY5IDIgNDAgMTEuMzEgNDAgMjBDNDAgMjkuNjkgMzAuNjkgMzkgMjAgMzlDOS4zMSAzOSAwIDI5LjY5IDAgMjBDMCAxMS4zMSA5LjMzIDIgMjAgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMCA4QzE2LjY5IDggMTQgMTAuNjkgMTQgMTRDMTQgMTcuMzEgMTYuNjkgMjAgMjAgMjBDMjMuMzEgMjAgMjYgMTcuMzEgMjYgMTRDMjYgMTAuNjkgMjMuMzEgOCAyMCA4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                                  }}
                                />
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No media</span>
                            );
                          })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>{formatTimestamp(text.createdon)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {!text.archivedon && (
                            <button
                              onClick={() => handleArchive(text.textid)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Archive this text"
                            >
                              <FaArchive className="w-4 h-4" />
                            </button>
                          )}
                          {text.archivedon && (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-600">
                                {formatTimestamp(text.archivedon)}
                              </span>
                              {text.archiver && (
                                <span className="text-xs text-gray-500">
                                  by {text.archiver.firstname} {text.archiver.lastname}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              {/* Archive Button */}
              <button
                onClick={() => handleArchive(expandedImage.textId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                title="Archive this text"
              >
                <FaArchive className="w-4 h-4" />
                Archive
              </button>
              
              {/* Close Button */}
              <button
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white text-3xl font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                onClick={() => setExpandedImage(null)}
              >
                ×
              </button>
            </div>
            <img
              src={expandedImage.src}
              alt={expandedImage.alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
} 