"use client";

import React, { useState } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

/**
 * Test component to demonstrate scroll prevention
 * This component can be used to test that background scrolling is disabled when modals are open
 */
export default function ScrollTestModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scrolling when modal is open
  useScrollLock(isOpen);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Scroll Prevention Test</h2>
      
      {/* Long content to enable scrolling */}
      <div className="space-y-4 mb-6">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Content Block {i + 1}</h3>
            <p>This is some content to make the page scrollable. Try scrolling the background when the modal is open - it should be disabled.</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Open Modal (Test Scroll Prevention)
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Test Modal</h3>
            <p className="mb-4">
              This modal should prevent background scrolling. Try scrolling the page behind this modal - it should not work.
            </p>
            <p className="mb-6 text-sm text-gray-600">
              The background content should be locked in place while this modal is open.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close Modal
              </button>
              <button
                onClick={() => {
                  // Add more content to test scrolling within modal
                  const newDiv = document.createElement('div');
                  newDiv.className = 'p-4 bg-gray-100 rounded mb-2';
                  newDiv.innerHTML = '<p>Additional modal content added dynamically</p>';
                  const container = document.querySelector('.bg-white.rounded-lg.p-6');
                  if (container) {
                    container.appendChild(newDiv);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
