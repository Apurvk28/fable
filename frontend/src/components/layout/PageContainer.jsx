import React from 'react';

export const PageContainer = ({ children, className = '' }) => {
  return (
    <main className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 ${className}`}>
      {children}
    </main>
  );
};
