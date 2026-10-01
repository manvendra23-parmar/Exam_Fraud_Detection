import React, { useState, useEffect } from 'react';
import BaseVisualization from './BaseVisualization';

/**
 * Component to visualize person detection results from Video Intelligence API
 */
const PersonDetectionViz = ({ jsonData, videoInfo, onSegmentClicked }) => {
  const [personAnnotations, setPersonAnnotations] = useState([]);
  
  useEffect(() => {
    // Extract person detection annotations from the API response
    if (jsonData && jsonData.annotation_results) {
      const annotations = [];
      
      jsonData.annotation_results.forEach(result => {
        if (result.person_detection_annotations) {
          annotations.push(...result.person_detection_annotations);
        }
      });
      
      setPersonAnnotations(annotations);
    }
  }, [jsonData]);

  const handleSegmentClick = (seconds) => {
    onSegmentClicked({ seconds });
  };

  // Calculate confidence color (green for high, red for low)
  const getConfidenceColor = (confidence) => {
    // Convert confidence to a color from red to green
    const red = Math.floor(255 * (1 - confidence));
    const green = Math.floor(255 * confidence);
    return `rgb(${red}, ${green}, 0)`;
  };

  // Group person detections by tracks
  const renderPersonTracks = () => {
    if (personAnnotations.length === 0) {
      return <p>No person detection data available in this video.</p>;
    }
    
    return personAnnotations.map((person, personIndex) => (
      <div key={`person-${personIndex}`} className="detection-item">
        <h4>Person #{personIndex + 1}</h4>
        {person.tracks && person.tracks.map((track, trackIndex) => (
          <div key={`track-${personIndex}-${trackIndex}`}>
            <div 
              className="clickable-segment"
              onClick={() => handleSegmentClick(track.segment.start_time_offset?.seconds || 0)}
            >
              <span className="timestamp">
                {track.segment.start_time_offset?.seconds || 0}s
              </span> to <span className="timestamp">
                {track.segment.end_time_offset?.seconds || 0}s
              </span>
              {' '}- Confidence: {(track.confidence * 100).toFixed(1)}%
              <div 
                className="confidence-bar" 
                style={{ 
                  width: `${track.confidence * 100}%`,
                  backgroundColor: getConfidenceColor(track.confidence)
                }}
              />
            </div>
            <div>
              {track.timestamped_objects && track.timestamped_objects.length > 0 && (
                <div>
                  <small>
                    Detected in {track.timestamped_objects.length} frames
                    {track.timestamped_objects[0].attributes && (
                      <span> with attributes: {
                        track.timestamped_objects[0].attributes
                          .map(attr => `${attr.name} (${(attr.confidence * 100).toFixed(0)}%)`)
                          .join(', ')
                      }</span>
                    )}
                  </small>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Display detected actions if available */}
        {person.actions && person.actions.length > 0 && (
          <div className="person-actions">
            <h5>Detected Actions:</h5>
            <ul>
              {person.actions.map((action, actionIndex) => (
                <li key={`action-${personIndex}-${actionIndex}`} className="clickable-segment" 
                    onClick={() => handleSegmentClick(action.segment.start_time_offset?.seconds || 0)}>
                  {action.type || 'Unknown action'}: 
                  {' '}<span className="timestamp">{action.segment.start_time_offset?.seconds || 0}s</span> to 
                  {' '}<span className="timestamp">{action.segment.end_time_offset?.seconds || 0}s</span>
                  {' '}- Confidence: {(action.confidence * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ));
  };

  return (
    <BaseVisualization title="Person Detection">
      <div className="person-detection-container">
        <p>
          This visualization shows people detected in the video with timestamps. 
          Click on any segment to jump to that point in the video.
        </p>
        {renderPersonTracks()}
      </div>
    </BaseVisualization>
  );
};

export default PersonDetectionViz; 