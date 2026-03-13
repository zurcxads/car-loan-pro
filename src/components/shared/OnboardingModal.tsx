"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Props {
  show: boolean;
  onComplete: () => void;
  steps: OnboardingStep[];
}

export default function OnboardingModal({ show, onComplete, steps }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!show) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-6 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
              <h2 className="text-xl font-semibold mb-1">Welcome to Auto Loan Pro</h2>
              <p className="text-sm text-blue-100">Let&apos;s get you set up in just a few steps</p>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {steps[currentStep].icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip for now
              </button>
              <div className="flex gap-2">
                <div className="text-xs text-gray-400 flex items-center">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
