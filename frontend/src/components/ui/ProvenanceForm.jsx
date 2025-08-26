import React, { useState } from 'react';
import { History, Save, X } from 'lucide-react';

const ProvenanceForm = ({ artifactId, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        history: '',
        eventDate: new Date().toISOString().split('T')[0],
        previousOwner: '',
        newOwner: ''
    });

    const [charCount, setCharCount] = useState(0);
    const [error, setError] = useState('');
    const MAX_HISTORY_LENGTH = 2000;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate history length
        if (formData.history.length > MAX_HISTORY_LENGTH) {
            setError(`History is too long. Maximum ${MAX_HISTORY_LENGTH} characters allowed.`);
            return;
        }

        // Validate required fields
        if (!formData.history.trim() || !formData.previousOwner.trim() || !formData.newOwner.trim()) {
            setError('Please fill in all required fields.');
            return;
        }

        setError(''); // Clear any previous errors

        try {
            const response = await fetch(`/api/artifacts/${artifactId}/provenance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSave();
            } else {
                throw new Error('Failed to create provenance record');
            }
        } catch (error) {
            console.error('Provenance creation error:', error);
            setError('Failed to create provenance record. Please try again.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <History className="w-5 h-5 mr-2 text-blue-500" />
                    Add Provenance Record
                </h3>
                <button
                    onClick={onCancel}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Event Date*
                        </label>
                        <input
                            type="date"
                            value={formData.eventDate}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            When this ownership/possession change occurred
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Previous Owner*
                        </label>
                        <input
                            type="text"
                            value={formData.previousOwner}
                            onChange={(e) => setFormData({ ...formData, previousOwner: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Name of previous owner or institution"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Who owned/possessed the artifact before
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Owner*
                    </label>
                    <input
                        type="text"
                        value={formData.newOwner}
                        onChange={(e) => setFormData({ ...formData, newOwner: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Name of new owner or institution"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Who owns/possesses the artifact now
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        History*
                    </label>
                    <textarea
                        value={formData.history}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, history: value });
                            setCharCount(value.length);
                        }}
                        maxLength={MAX_HISTORY_LENGTH}
                        rows={6}
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${charCount > MAX_HISTORY_LENGTH
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                        placeholder="Describe the circumstances of this ownership change, how it was acquired, any relevant historical context, and the significance of this transfer..."
                        required
                    />
                    <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-gray-500">
                            <strong>Include:</strong> How acquired, historical context, significance
                        </div>
                        <div className={`text-xs ${charCount > MAX_HISTORY_LENGTH
                                ? 'text-red-500'
                                : charCount > MAX_HISTORY_LENGTH * 0.8
                                    ? 'text-yellow-500'
                                    : 'text-gray-500'
                            }`}>
                            {charCount}/{MAX_HISTORY_LENGTH}
                        </div>
                    </div>
                    <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                            <strong>Example:</strong> "Artifact discovered during archaeological excavation at Huye site in 2020. Excavated by Dr. Uwimana's team. Donated to Ethnographic Museum by local community. Significant as it represents traditional 16th century Rwandan pottery techniques."
                        </p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <div className="flex space-x-3 pt-4">
                    <button
                        type="submit"
                        disabled={formData.history.length > MAX_HISTORY_LENGTH}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center ${formData.history.length > MAX_HISTORY_LENGTH
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Provenance Record
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProvenanceForm;







