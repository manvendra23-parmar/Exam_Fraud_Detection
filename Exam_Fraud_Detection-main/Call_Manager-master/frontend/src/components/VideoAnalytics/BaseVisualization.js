import React from 'react';

/**
 * Base component for all video intelligence visualizations
 * Provides common functionality and layout
 */
const BaseVisualization = ({ title, children }) => {
  return (
    <div className="visualization-container">
      <h3>{title}</h3>
      <div className="visualization-content">
        {children}
      </div>
    </div>
  );
};

export default BaseVisualization; 