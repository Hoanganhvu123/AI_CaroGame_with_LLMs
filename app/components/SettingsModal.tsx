import React from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <p>Đây là các tùy chọn cài đặt của bạn.</p>
                <button 
                    onClick={onClose} 
                    className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
