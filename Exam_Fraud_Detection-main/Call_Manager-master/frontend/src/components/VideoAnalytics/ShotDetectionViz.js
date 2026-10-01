import React from 'react';
import BaseVisualization from './BaseVisualization';

/**
 * Component to visualize shot detection results from Video Intelligence API
 */
const ShotDetectionViz = ({ jsonData, videoInfo, onShotClicked }) => {
  const handleShotClick = (seconds) => {
    onShotClicked({ seconds });
  };

  return (
    <BaseVisualization title="Shot Detection">
      <p>Shot detection visualization component - under development.</p>
      <p>This component will display scene transitions detected in the video.</p>
    </BaseVisualization>
  );
};

export default ShotDetectionViz; 