import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Simple thank-you page displayed after a successful admission submission.
 * Uses a subtle animation to enhance the premium feel.
 */
const AdmissionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = location.state?.firstName || '';

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-10 shadow-xl text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Application Submitted 🎉</h1>
        <p className="mb-6">Thanks for submit the form {firstName}</p>
        <button
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          onClick={() => navigate('/admission')}
        >
          Go to Home
        </button>
      </div>
    </motion.div>
  );
};

export default AdmissionSuccess;
