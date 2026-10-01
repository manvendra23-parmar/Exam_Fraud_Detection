import React, { useMemo } from 'react';

const nullable_time_offset_to_seconds = (time_offset) => {
  if (!time_offset) return 0;

  const seconds = time_offset.seconds || 0;
  const nanos = time_offset.nanos ? time_offset.nanos / 1e9 : 0;
  return seconds + nanos;
};

// Component to visualize label detection results
const LabelDetectionViz = ({ jsonData, videoInfo, onSegmentClicked, renderItem }) => {
  // Process and organize the label data
  const labelData = useMemo(() => {
    if (!jsonData.annotation_results) return [];

    let labels = [];
    
    jsonData.annotation_results.forEach(result => {
      // Process shot label annotations
      if (result.shot_label_annotations) {
        result.shot_label_annotations.forEach(label => {
          if (label.segments) {
            label.segments.forEach(segment => {
              const startTime = nullable_time_offset_to_seconds(segment.segment?.start_time_offset);
              const endTime = nullable_time_offset_to_seconds(segment.segment?.end_time_offset);
              const confidence = segment.confidence || 0;
              
              labels.push({
                type: 'shot',
                description: label.entity?.description || 'Unknown',
                confidence,
                startTime,
                endTime
              });
            });
          }
        });
      }
      
      // Process segment label annotations
      if (result.segment_label_annotations) {
        result.segment_label_annotations.forEach(label => {
          if (label.segments) {
            label.segments.forEach(segment => {
              const startTime = nullable_time_offset_to_seconds(segment.segment?.start_time_offset);
              const endTime = nullable_time_offset_to_seconds(segment.segment?.end_time_offset);
              const confidence = segment.confidence || 0;
              
              labels.push({
                type: 'segment',
                description: label.entity?.description || 'Unknown',
                confidence,
                startTime,
                endTime
              });
            });
          }
        });
      }
    });
    
    // Sort labels by confidence (highest first)
    return labels.sort((a, b) => b.confidence - a.confidence);
  }, [jsonData]);

  // Create UI elements for label items
  const labelItems = useMemo(() => {
    return labelData.map((label, index) => (
      <div 
        key={`${label.description}-${index}`}
        className="label-item"
        onClick={() => onSegmentClicked({ 
          seconds: label.startTime,
          description: label.description
        })}
      >
        <div className="segment-header">
          <div className="segment-title">
            <span className="material-icons">label</span>
            {label.description}
          </div>
          <div className="segment-time">
            <span className="material-icons">schedule</span>
            {Math.floor(label.startTime / 60)}:{Math.floor(label.startTime % 60).toString().padStart(2, '0')} - 
            {Math.floor(label.endTime / 60)}:{Math.floor(label.endTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="confidence-indicator">
          <div className="confidence-bar-container">
            <div 
              className="confidence-bar" 
              style={{ width: `${(label.confidence * 100).toFixed(0)}%` }}
            ></div>
          </div>
          <div className="confidence-value">{(label.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>
    ));
  }, [labelData, onSegmentClicked]);

  // If no data found
  if (labelItems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <span className="material-icons">label_off</span>
        </div>
        <h3>No Label Detection Data</h3>
        <p>No labels were detected in this video or the data is not available.</p>
      </div>
    );
  }

  // Use the renderItem prop if provided, otherwise return all items
  return (
    <div className="label-detection-viz">
      {renderItem ? renderItem(labelItems) : labelItems}
    </div>
  );
};

export default LabelDetectionViz;