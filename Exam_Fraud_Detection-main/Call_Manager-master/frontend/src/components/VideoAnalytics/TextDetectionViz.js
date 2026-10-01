import React, { useMemo } from 'react';
import BaseVisualization from './BaseVisualization';

const nullable_time_offset_to_seconds = (time_offset) => {
  if (!time_offset) return 0;

  const seconds = time_offset.seconds || 0;
  const nanos = time_offset.nanos ? time_offset.nanos / 1e9 : 0;
  return seconds + nanos;
};

/**
 * Component to visualize text detection results from Video Intelligence API
 */
const TextDetectionViz = ({ jsonData, videoInfo, onSegmentClicked, renderItem }) => {
  // Process and organize the text detection data
  const textData = useMemo(() => {
    if (!jsonData.annotation_results) return [];

    let texts = [];
    
    jsonData.annotation_results.forEach(result => {
      // Process text annotations
      if (result.text_annotations) {
        result.text_annotations.forEach(text => {
          // Get the segments with timestamps
          if (text.segments) {
            text.segments.forEach(segment => {
              const startTime = nullable_time_offset_to_seconds(segment.segment?.start_time_offset);
              const endTime = nullable_time_offset_to_seconds(segment.segment?.end_time_offset);
              const confidence = segment.confidence || 0;
              
              texts.push({
                text: text.text || 'Unknown Text',
                confidence,
                startTime,
                endTime,
                frames: text.frames || []
              });
            });
          }
        });
      }
    });
    
    // Sort texts by start time
    return texts.sort((a, b) => a.startTime - b.startTime);
  }, [jsonData]);

  // Create UI elements for text items
  const textItems = useMemo(() => {
    return textData.map((item, index) => (
      <div 
        key={`text-${index}`}
        className="text-item"
        onClick={() => onSegmentClicked({ 
          seconds: item.startTime,
          description: item.text.substring(0, 30)
        })}
      >
        <div className="segment-header">
          <div className="segment-title">
            <span className="material-icons">text_format</span>
            Detected Text
          </div>
          <div className="segment-time">
            <span className="material-icons">schedule</span>
            {Math.floor(item.startTime / 60)}:{Math.floor(item.startTime % 60).toString().padStart(2, '0')} - 
            {Math.floor(item.endTime / 60)}:{Math.floor(item.endTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="text-content">
          "{item.text}"
        </div>
        
        <div className="confidence-indicator">
          <div className="confidence-bar-container">
            <div 
              className="confidence-bar" 
              style={{ width: `${(item.confidence * 100).toFixed(0)}%` }}
            ></div>
          </div>
          <div className="confidence-value">{(item.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>
    ));
  }, [textData, onSegmentClicked]);

  // If no data found
  if (textItems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <span className="material-icons">text_format</span>
        </div>
        <h3>No Text Detection Data</h3>
        <p>No text was detected in this video or the data is not available.</p>
      </div>
    );
  }

  // Use the renderItem prop if provided, otherwise return all items
  return (
    <BaseVisualization title="Text Detection">
      <div className="text-detection-container">
        <p className="visualization-description">
          This visualization shows text detected in the video.
          Click on any item to jump to that point in the video.
        </p>
        <div className="text-detection-viz">
          {renderItem ? renderItem(textItems) : textItems}
        </div>
      </div>
    </BaseVisualization>
  );
};

export default TextDetectionViz;