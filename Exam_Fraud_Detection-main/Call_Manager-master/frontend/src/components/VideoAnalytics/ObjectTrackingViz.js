import React, { useMemo } from 'react';
import BaseVisualization from './BaseVisualization';

const nullable_time_offset_to_seconds = (time_offset) => {
  if (!time_offset) return 0;

  const seconds = time_offset.seconds || 0;
  const nanos = time_offset.nanos ? time_offset.nanos / 1e9 : 0;
  return seconds + nanos;
};

/**
 * Component to visualize object tracking results from Video Intelligence API
 */
const ObjectTrackingViz = ({ jsonData, videoInfo, onSegmentClicked, renderItem }) => {
  // Process and organize object tracking data
  const objectData = useMemo(() => {
    if (!jsonData.annotation_results) return [];

    let objects = [];
    
    jsonData.annotation_results.forEach(result => {
      if (result.object_annotations) {
        result.object_annotations.forEach(obj => {
          const type = obj.entity?.description || 'Unknown Object';
          const confidence = obj.confidence || 0;
          
          // Get all frames to determine time range
          let startTime = Infinity;
          let endTime = 0;
          
          if (obj.frames && obj.frames.length > 0) {
            obj.frames.forEach(frame => {
              const time = nullable_time_offset_to_seconds(frame.time_offset);
              startTime = Math.min(startTime, time);
              endTime = Math.max(endTime, time);
            });
            
            objects.push({
              type,
              confidence,
              startTime,
              endTime,
              frameCount: obj.frames.length
            });
          }
        });
      }
    });
    
    // Sort by confidence (highest first)
    return objects.sort((a, b) => b.confidence - a.confidence);
  }, [jsonData]);

  // Create UI elements for object items
  const objectItems = useMemo(() => {
    return objectData.map((obj, index) => (
      <div 
        key={`object-${index}`}
        className="detection-item"
        onClick={() => onSegmentClicked({ 
          seconds: obj.startTime,
          description: obj.type
        })}
      >
        <div className="segment-header">
          <div className="segment-title">
            <span className="material-icons">visibility</span>
            {obj.type}
          </div>
          <div className="segment-time">
            <span className="material-icons">schedule</span>
            {Math.floor(obj.startTime / 60)}:{Math.floor(obj.startTime % 60).toString().padStart(2, '0')} - 
            {Math.floor(obj.endTime / 60)}:{Math.floor(obj.endTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="object-details">
          <span className="frame-count">
            <span className="material-icons">filter_frames</span>
            {obj.frameCount} frames
          </span>
        </div>
        
        <div className="confidence-indicator">
          <div className="confidence-bar-container">
            <div 
              className="confidence-bar" 
              style={{ width: `${(obj.confidence * 100).toFixed(0)}%` }}
            ></div>
          </div>
          <div className="confidence-value">{(obj.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>
    ));
  }, [objectData, onSegmentClicked]);

  // If no data found
  if (objectItems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <span className="material-icons">visibility_off</span>
        </div>
        <h3>No Object Tracking Data</h3>
        <p>No objects were tracked in this video or the data is not available.</p>
      </div>
    );
  }

  // Use the renderItem prop if provided, otherwise return all items
  return (
    <BaseVisualization title="Object Tracking">
      <div className="object-tracking-container">
        <p className="visualization-description">
          This visualization shows objects tracked throughout the video.
          Click on any object to jump to when it first appears.
        </p>
        <div className="object-tracking-viz">
          {renderItem ? renderItem(objectItems) : objectItems}
        </div>
      </div>
    </BaseVisualization>
  );
};

export default ObjectTrackingViz;