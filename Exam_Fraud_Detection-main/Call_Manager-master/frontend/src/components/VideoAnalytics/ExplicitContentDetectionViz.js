import React from 'react';
import BaseVisualization from './BaseVisualization';

/**
 * Component to visualize explicit content detection results from Video Intelligence API
 */
const ExplicitContentDetectionViz = ({ jsonData, videoInfo, onShotClicked }) => {
  const handleShotClick = (seconds) => {
    onShotClicked({ seconds });
  };

  return (
    <BaseVisualization title="Explicit Content Detection">
      <p>Explicit content detection visualization component - under development.</p>
      <p>This component will display explicit content warnings with timestamps.</p>
    </BaseVisualization>
  );
};

export default ExplicitContentDetectionViz; 