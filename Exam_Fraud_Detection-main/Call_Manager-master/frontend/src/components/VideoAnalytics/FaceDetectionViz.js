import React, { useState, useMemo } from 'react';
import BaseVisualization from './BaseVisualization';
import { motion, AnimatePresence } from 'framer-motion';

// Helper functions
const nullable_time_offset_to_seconds = (time_offset) => {
  if (!time_offset) return 0;
  const seconds = time_offset.seconds || 0;
  const nanos = time_offset.nanos ? time_offset.nanos / 1e9 : 0;
  return seconds + nanos;
};

// Face data processing classes
class FaceFrame {
  constructor(json_data, video_height, video_width) {
    this.time_offset = nullable_time_offset_to_seconds(json_data.time_offset);
    this.box = {
      'x': (json_data.normalized_bounding_box.left || 0) * video_width,
      'y': (json_data.normalized_bounding_box.top || 0) * video_height,
      'width': ((json_data.normalized_bounding_box.right || 0) - (json_data.normalized_bounding_box.left || 0)) * video_width,
      'height': ((json_data.normalized_bounding_box.bottom || 0) - (json_data.normalized_bounding_box.top || 0)) * video_height
    };
  }
}

class FaceTrack {
  constructor(json_data, video_height, video_width) {
    const track = json_data.tracks[0];
    this.start_time = nullable_time_offset_to_seconds(track.segment.start_time_offset);
    this.end_time = nullable_time_offset_to_seconds(track.segment.end_time_offset);
    this.confidence = track.confidence;
    this.thumbnail = json_data.thumbnail;
    this.attributes = {};

    if (track.attributes) {
      track.attributes.forEach(attribute => {
        this.attributes[attribute.name] = attribute.confidence;
      });
    }

    this.frames = [];
    track.timestamped_objects.forEach(frame => {
      const new_frame = new FaceFrame(frame, video_height, video_width);
      this.frames.push(new_frame);
    });
  }

  has_frames_for_time(seconds) {
    return ((this.start_time <= seconds) && (this.end_time >= seconds));
  }

  most_recent_real_bounding_box(seconds) {
    for (let index = 0; index < this.frames.length; index++) {
      if (this.frames[index].time_offset > seconds) {
        if (index > 0)
          return this.frames[index - 1].box;
        else
          return null;
      }
    }
    return null;
  }

  most_recent_interpolated_bounding_box(seconds) {
    for (let index = 0; index < this.frames.length; index++) {
      if (this.frames[index].time_offset > seconds) {
        if (index > 0) {
          if ((index === 1) || (index === this.frames.length - 1))
            return this.frames[index - 1].box;

          // create a new interpolated box 
          const start_box = this.frames[index - 1];
          const end_box = this.frames[index];
          const time_delt_ratio = (seconds - start_box.time_offset) / (end_box.time_offset - start_box.time_offset);

          const interpolated_box = {
            'x': start_box.box.x + (end_box.box.x - start_box.box.x) * time_delt_ratio,
            'y': start_box.box.y + (end_box.box.y - start_box.box.y) * time_delt_ratio,
            'width': start_box.box.width + (end_box.box.width - start_box.box.width) * time_delt_ratio,
            'height': start_box.box.height + (end_box.box.height - start_box.box.height) * time_delt_ratio
          };
          return interpolated_box;
        } else
          return null;
      }
    }
    return null;
  }

  current_bounding_box(seconds, interpolate = true) {
    if (interpolate)
      return this.most_recent_interpolated_bounding_box(seconds);
    else
      return this.most_recent_real_bounding_box(seconds);
  }
}

// React component for bar chart with animation
const BarChart = ({ label, percent }) => {
  // Determine color based on value
  const getBarColor = (value) => {
    if (value >= 80) return 'var(--primary-color, #4CAF50)';
    if (value >= 50) return 'var(--warning-color, #FF9800)';
    return 'var(--danger-color, #F44336)';
  };

  return (
    <div className="bar-chart">
      <div className="bar-label">
        <span className="label-text">{label}</span>
        <span className="percent-text">{parseInt(percent)}%</span>
      </div>
      <div className="bar-container">
        <motion.div 
          className="bar" 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ 
            backgroundColor: getBarColor(percent),
            height: '8px',
            borderRadius: '4px'
          }}
        />
      </div>
    </div>
  );
};

// Badge component for confidence
const ConfidenceBadge = ({ confidence }) => {
  // Choose badge color based on confidence
  const getBadgeColor = (value) => {
    if (value >= 0.8) return '#4CAF50';
    if (value >= 0.5) return '#FF9800';
    return '#F44336';
  };

  const badgeStyle = {
    backgroundColor: getBadgeColor(confidence),
    color: '#fff',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  return (
    <div className="confidence-badge" style={badgeStyle}>
      {Math.round(confidence * 100)}%
    </div>
  );
};

// Main face detection component
const FaceDetectionViz = ({ jsonData, videoInfo, onSegmentClicked, renderItem }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [activeSegment, setActiveSegment] = useState(null);
  const [hoveredFace, setHoveredFace] = useState(null);

  // Extract face detection data
  const faceTracks = useMemo(() => {
    if (!jsonData.annotation_results) 
      return [];

    for (let index = 0; index < jsonData.annotation_results.length; index++) {
      if ('face_detection_annotations' in jsonData.annotation_results[index])
        return jsonData.annotation_results[index].face_detection_annotations;
    }
    return [];
  }, [jsonData]);

  // Process face tracks with confidence threshold
  const indexedFaceTracks = useMemo(() => {
    const indexed_tracks = [];

    if (!faceTracks)
      return [];

    faceTracks.forEach(element => {
      if (element.tracks[0].confidence > confidenceThreshold)
        indexed_tracks.push(new FaceTrack(element, videoInfo.height, videoInfo.width));
    });

    // Sort by confidence (highest first)
    return indexed_tracks.sort((a, b) => b.confidence - a.confidence);
  }, [faceTracks, confidenceThreshold, videoInfo.height, videoInfo.width]);

  // Create timeline segments for faces
  const objectTrackSegments = useMemo(() => {
    const segments = { 'face': { 'segments': [], 'count': 0 } };

    indexedFaceTracks.forEach(object_tracks => {
      segments['face'].count++;

      let added = false;
      for (let index = 0; index < segments['face'].segments.length; index++) {
        const segment = segments['face'].segments[index];
        if (object_tracks.start_time < segment[1]) {
          segments['face'].segments[index][1] = Math.max(segments['face'].segments[index][1], object_tracks.end_time);
          added = true;
          break;
        }
      }

      if (!added)
        segments['face'].segments.push([object_tracks.start_time, object_tracks.end_time]);
    });

    return segments;
  }, [indexedFaceTracks]);

  // Style for timeline segments
  const getSegmentStyle = (segment, isActive) => {
    return {
      left: `${(segment[0] / videoInfo.length) * 100}%`,
      width: `${((segment[1] - segment[0]) / videoInfo.length) * 100}%`,
      backgroundColor: isActive ? 'var(--primary-color, #4CAF50)' : 'var(--secondary-color, #2196F3)',
      height: isActive ? '12px' : '8px',
      top: isActive ? '-2px' : '0',
      zIndex: isActive ? 2 : 1,
      boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
    };
  };

  // Handle segment click
  const handleSegmentClick = (seconds, segmentIndex) => {
    setActiveSegment(segmentIndex);
    onSegmentClicked({ seconds });
  };

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animation variants for list items
  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.02,
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  // Render face items
  const renderFaceItems = () => {
    const items = indexedFaceTracks.map((face, index) => (
      <motion.div 
        key={index} 
        className={`face-item ${hoveredFace === index ? 'hovered' : ''}`}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        custom={index}
        variants={listItemVariants}
        onClick={() => handleSegmentClick(face.start_time, index)}
        onMouseEnter={() => setHoveredFace(index)}
        onMouseLeave={() => setHoveredFace(null)}
      >
        <div className="face-header">
          <div className="face-id">
            <span className="material-icons">face</span>
            <span className="face-label">Face {index + 1}</span>
            <span className="face-time">{formatTime(face.start_time)} - {formatTime(face.end_time)}</span>
          </div>
          <ConfidenceBadge confidence={face.confidence} />
        </div>
        
        <div className="face-content">
          <div className="face-thumbnail">
            {face.thumbnail ? (
              <img alt="Face thumbnail" src={`data:image/png;base64, ${face.thumbnail}`} />
            ) : (
              <div className="thumbnail-placeholder">
                <span className="material-icons">face</span>
              </div>
            )}
          </div>
          
          <div className="face-attributes">
            {Object.entries(face.attributes).length > 0 ? (
              Object.entries(face.attributes).map(([key, value], attrIndex) => (
                <BarChart 
                  key={attrIndex} 
                  label={key.replace(/_/g, ' ')} 
                  percent={value * 100} 
                />
              ))
            ) : (
              <div className="no-attributes">No attribute data available</div>
            )}
          </div>
        </div>
      </motion.div>
    ));

    return renderItem ? renderItem(items) : items;
  };

  return (
    <BaseVisualization title="Face Detection">
      <div className="face-detection-container">
        <div className="control-panel">
          <div className="confidence-slider">
            <label>Confidence threshold: <span className="threshold-value">{(confidenceThreshold * 100).toFixed(0)}%</span></label>
            <div className="slider-container">
              <input 
                type="range" 
                min="0.0" 
                max="1" 
                step="0.01" 
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="modern-slider"
              />
              <div className="slider-markers">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {faceTracks.length > 0 && (
            <div className="face-stats">
              <div className="stat-item">
                <span className="material-icons">groups</span>
                <div className="stat-content">
                  <div className="stat-value">{indexedFaceTracks.length}</div>
                  <div className="stat-label">Faces Detected</div>
                </div>
              </div>
              <div className="stat-item">
                <span className="material-icons">timelapse</span>
                <div className="stat-content">
                  <div className="stat-value">
                    {objectTrackSegments.face?.segments.reduce((acc, segment) => acc + (segment[1] - segment[0]), 0).toFixed(1)}s
                  </div>
                  <div className="stat-label">Face Time</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {faceTracks.length === 0 ? (
            <motion.div 
              className="empty-state"
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <div className="empty-icon">
                <span className="material-icons">sentiment_dissatisfied</span>
              </div>
              <h3>No Face Detection Data</h3>
              <p>There are no faces detected in this video, or the JSON data doesn't contain face detection results.</p>
              <button className="try-again-btn" onClick={() => setConfidenceThreshold(0.1)}>
                Try Lower Threshold
              </button>
            </motion.div>
          ) : (
            <motion.div 
              className="results-container"
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="timeline-section">
                <h3 className="section-title">Face Timeline</h3>
                {Object.entries(objectTrackSegments).map(([key, segmentData]) => (
                  <div className="segment-container" key={key}>
                    <div className="segment-header">
                      <div className="label">
                        <span className="material-icons">face</span>
                        {key} ({segmentData.count})
                      </div>
                      <div className="time-markers">
                        <span>0:00</span>
                        <span>{formatTime(videoInfo.length / 2)}</span>
                        <span>{formatTime(videoInfo.length)}</span>
                      </div>
                    </div>
                    <div className="segment-timeline">
                      {segmentData.segments.map((segment, index) => (
                        <motion.div 
                          className="segment" 
                          key={index}
                          style={getSegmentStyle(segment, activeSegment === index)}
                          whileHover={{ 
                            height: '14px', 
                            top: '-3px', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)' 
                          }}
                          onClick={() => handleSegmentClick(segment[0], index)}
                        >
                          <div className="segment-tooltip">
                            {formatTime(segment[0])} - {formatTime(segment[1])}
                          </div>
                        </motion.div>
                      ))}
                      <div className="timeline-base"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="face-gallery-section">
                <h3 className="section-title">Detected Faces</h3>
                <div className="face-detection-viz">
                  <div className="face-list">
                    {renderFaceItems()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseVisualization>
  );
};

export default FaceDetectionViz;