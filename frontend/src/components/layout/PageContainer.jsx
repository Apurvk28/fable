import React from 'react';

export const PageContainer = ({ children, className = '', maxWidth = 'max-w-7xl' }) => {
  return (
    <main className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </main>
  );
};
