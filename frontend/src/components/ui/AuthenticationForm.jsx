import React, { useState } from 'react';
import { Shield, Save, X } from 'lucide-react';

const AuthenticationForm = ({ artifactId, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
        documentation: ''
    });

    const [charCount, setCharCount] = useState(0);
    const [error, setError] = useState('');
    const MAX_DOCUMENTATION_LENGTH = 255;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate documentation length
        if (formData.documentation.length > MAX_DOCUMENTATION_LENGTH) {
            setError(`Documentation is too long. Maximum ${MAX_DOCUMENTATION_LENGTH} characters allowed.`);
            return;
        }

        setError(''); // Clear any previous errors

        try {
            const response = await fetch(`/api/artifacts/${artifactId}/authentications`, {
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
                throw new Error('Failed to create authentication record');
            }
        } catch (error) {
            console.error('Authentication creation error:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-500" />
                    Add Authentication Record
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
                            Status*
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="PENDING">Pending - Waiting for authentication</option>
                            <option value="Authentic">Authentic - Verified as genuine</option>
                            <option value="Suspected">Suspected - Some concerns about authenticity</option>
                            <option value="Fake">Fake - Determined to be counterfeit</option>
                            <option value="Inconclusive">Inconclusive - Unable to determine</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Choose the final authentication result or "Pending" if still in process
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date*
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            When the authentication was performed or will be performed
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Documentation
                    </label>
                    <textarea
                        value={formData.documentation}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, documentation: value });
                            setCharCount(value.length);
                        }}
                        maxLength={MAX_DOCUMENTATION_LENGTH}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${charCount > MAX_DOCUMENTATION_LENGTH
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                        placeholder="Brief description of authentication process and findings (max 255 characters)"
                    />
                    <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-gray-500">
                            <strong>Keep it concise:</strong> Methods, findings, conclusion
                        </div>
                        <div className={`text-xs ${charCount > MAX_DOCUMENTATION_LENGTH
                                ? 'text-red-500'
                                : charCount > MAX_DOCUMENTATION_LENGTH * 0.8
                                    ? 'text-yellow-500'
                                    : 'text-gray-500'
                            }`}>
                            {charCount}/{MAX_DOCUMENTATION_LENGTH}
                        </div>
                    </div>
                    <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                            <strong>Example:</strong> "Examined by Dr. Uwimana. Radiocarbon dating: 450±30 BP. Material: traditional Rwandan clay. Style: 16th century. Conclusion: Authentic."
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
                        disabled={formData.documentation.length > MAX_DOCUMENTATION_LENGTH}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center ${formData.documentation.length > MAX_DOCUMENTATION_LENGTH
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Authentication Record
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

export default AuthenticationForm;
