import React from 'react';

export default function ConfirmationModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, isDangerous }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm items-center text-center w-full mx-4 animate-in">
        <div className="p-6">
          <div className={`w-10 h-10 rounded-full flex items-center mx-auto justify-center mb-4 ${isDangerous ? 'bg-red-600' : 'bg-blue-100'}`}>
            <span className={`text-lg ${isDangerous ? 'text-red-600' : 'text-blue-600'}`}>
              {isDangerous ? '⚠️' : 'ℹ️'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white font-semibold rounded-lg transition ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
