import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Videosummary.css';


// Components that would be imported from separate files
import ObjectTrackingViz from '../components/VideoAnalytics/ObjectTrackingViz';
import LabelDetectionViz from '../components/VideoAnalytics/LabelDetectionViz';
import SpeechTranscriptionViz from '../components/VideoAnalytics/SpeechTranscriptionViz';
import FaceDetectionViz from '../components/VideoAnalytics/FaceDetectionViz';
import TextDetectionViz from '../components/VideoAnalytics/TextDetectionViz';
import video from '../videos/test_video.mp4';
import json from '../videos/test_json.json';
import TabSwitchingViz from '../components/VideoAnalytics/Tab_windows_switching';



// Utility functions for bounding box drawing (from utils.js)
const draw_bounding_boxes = (object_tracks, ctx, currentTime, videoWidth, videoHeight) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  object_tracks.forEach(trackedObject => {
    if (trackedObject.hasFramesForTime(currentTime)) {
      draw_bounding_box(
        trackedObject.getCurrentBoundingBox(currentTime, videoWidth, videoHeight), 
        trackedObject.name, 
        ctx
      );
    }
  });
};

const draw_bounding_box = (box, name = null, ctx) => {
  // Draw outer frame (shadow effect)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.lineWidth = 5;
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 8;
  ctx.strokeRect(box.x - 2, box.y - 2, box.width + 4, box.height + 4);
  
  // Draw inner frame (primary color)
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#4285F4"; // Google blue color
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  
  // Draw corner accents for more visual appeal
  const cornerSize = 10;
  ctx.lineWidth = 3;
  
  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(box.x, box.y + cornerSize);
  ctx.lineTo(box.x, box.y);
  ctx.lineTo(box.x + cornerSize, box.y);
  ctx.stroke();
  
  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(box.x + box.width - cornerSize, box.y);
  ctx.lineTo(box.x + box.width, box.y);
  ctx.lineTo(box.x + box.width, box.y + cornerSize);
  ctx.stroke();
  
  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(box.x, box.y + box.height - cornerSize);
  ctx.lineTo(box.x, box.y + box.height);
  ctx.lineTo(box.x + cornerSize, box.y + box.height);
  ctx.stroke();
  
  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(box.x + box.width - cornerSize, box.y + box.height);
  ctx.lineTo(box.x + box.width, box.y + box.height);
  ctx.lineTo(box.x + box.width, box.y + box.height - cornerSize);
  ctx.stroke();

  if (name) {
    // Create gradient background for the label
    const gradient = ctx.createLinearGradient(box.x, box.y, box.x + name.length * 13, box.y);
    gradient.addColorStop(0, "#4285F4"); // Google blue
    gradient.addColorStop(1, "#0F9D58"); // Google green
    
    // Draw label background with rounded corners
    const labelWidth = name.length * 13;
    const labelHeight = 32;
    const cornerRadius = 6;
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(box.x + cornerRadius, box.y);
    ctx.lineTo(box.x + labelWidth - cornerRadius, box.y);
    ctx.quadraticCurveTo(box.x + labelWidth, box.y, box.x + labelWidth, box.y + cornerRadius);
    ctx.lineTo(box.x + labelWidth, box.y + labelHeight - cornerRadius);
    ctx.quadraticCurveTo(box.x + labelWidth, box.y + labelHeight, box.x + labelWidth - cornerRadius, box.y + labelHeight);
    ctx.lineTo(box.x + cornerRadius, box.y + labelHeight);
    ctx.quadraticCurveTo(box.x, box.y + labelHeight, box.x, box.y + labelHeight - cornerRadius);
    ctx.lineTo(box.x, box.y + cornerRadius);
    ctx.quadraticCurveTo(box.x, box.y, box.x + cornerRadius, box.y);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle border to label
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw text with shadow for better visibility
    ctx.fillStyle = "#ffffff"; // White text
    ctx.font = "bold 16px Arial";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(name, box.x + 5, box.y + 22);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
};

const nullable_time_offset_to_seconds = (time_offset) => {
  if (!time_offset) return 0;

  const seconds = time_offset.seconds || 0;
  const nanos = time_offset.nanos ? time_offset.nanos / 1e9 : 0;
  return seconds + nanos;
};

// Helper class to track objects
class TrackedObject {
  constructor(entity, frames) {
    this.name = entity?.description || 'Object';
    this.frames = frames || [];
  }

  hasFramesForTime(currentTime) {
    return this.frames.some(frame => {
      const time = nullable_time_offset_to_seconds(frame.time_offset);
      // Allow a small window of visibility around the exact time
      return Math.abs(time - currentTime) < 0.5;
    });
  }

  getCurrentBoundingBox(currentTime, videoWidth, videoHeight) {
    // Find the frame closest to current time
    let closestFrame = this.frames[0];
    let smallestDiff = Infinity;
    
    this.frames.forEach(frame => {
      const time = nullable_time_offset_to_seconds(frame.time_offset);
      const diff = Math.abs(time - currentTime);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestFrame = frame;
      }
    });
    
    const normBox = closestFrame?.normalized_bounding_box || {};
    
    // Convert normalized coordinates to pixel values based on video's actual dimensions
    return {
      x: (normBox.left || 0) * videoWidth,
      y: (normBox.top || 0) * videoHeight,
      width: (normBox.width || 0) * videoWidth,
      height: (normBox.height || 0) * videoHeight
    };
  }
}

// Tab navigation component with enhanced UI
const AnnotationsNavTab = ({ title, currentView, dataId, detectedFeatures, onClick }) => {
  const hasData = detectedFeatures.includes(dataId);
  
  // Map feature names to icon names
  const featureIcons = {
    'Label Detection': 'label',
    'Object Tracking': 'visibility',
    'Face Detection': 'face',
    'Speech Transcription': 'record_voice_over',
    'Text Detection': 'text_format'
  };
  
  return (
   
    <div 
      className={`nav-tab ${currentView === title ? 'selected' : ''} ${!hasData ? 'disabled' : ''}`}
      onClick={() => hasData && onClick(title)}
    >
      <span className="material-icons tab-icon">
        {featureIcons[title] || 'analytics'}
      </span>
      <span className="tab-title">{title}</span>
      {hasData && (
        <span className="status-indicator">
          <span className="material-icons status-icon">
            {currentView === title ? 'check_circle' : 'circle'}
          </span>
        </span>
      )}
            </div>
  );
};

const AnnotationsNav = ({ titleIdsDict, currentView, detectedFeatures, onNavClicked }) => {
  return (
    <div className="feature-tabs">
      {Object.entries(titleIdsDict).map(([title, id]) => (
        <AnnotationsNavTab
          key={id}
          title={title}
          dataId={id}
          detectedFeatures={detectedFeatures}
          currentView={currentView}
          onClick={onNavClicked}
        />
      ))}
            </div>
  );
};

// Enhanced Upload Component
const FileUploader = ({ 
  label, 
  accept, 
  onChange, 
  inputRef, 
  onDrop, 
  onDragOver, 
  icon 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    setIsDragging(false);
    onDrop(e);
  };
  
  return (
    <div 
      className={`upload-area ${isDragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={onDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="upload-icon">
        <span className="material-icons">{icon}</span>
            </div>
      <p className="upload-label">{label}</p>
      <p className="upload-hint">Drag & drop or click to browse</p>
      <input 
        ref={inputRef}
        type="file" 
        accept={accept} 
        onChange={onChange}
        className="file-input"
      />
            </div>
  );
};

// DataLimiter component to show limited number of items with View All button
const DataLimiter = ({ children, initialLimit = 5 }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Clone children to get the array of React elements
  const childrenArray = React.Children.toArray(children);
  
  // Determine if we need a limiter (if children exceed the limit)
  const needsLimiter = childrenArray.length > initialLimit;
  
  // Slice the array based on the limit
  const displayedChildren = showAll || !needsLimiter 
    ? childrenArray 
    : childrenArray.slice(0, initialLimit);
  
  return (
    <div className="data-limiter">
      {displayedChildren}
      
      {needsLimiter && (
        <div className="view-all-container">
          <button 
            className="view-all-button"
            onClick={() => setShowAll(!showAll)}
          >
            <span className="material-icons">
              {showAll ? 'unfold_less' : 'unfold_more'}
            </span>
            <span>{showAll ? 'Show Less' : `View All (${childrenArray.length})`}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// The visualization component with enhanced views
const EnhancedVisualization = ({ type, component, countText }) => {
  return (
    <div className="visualization-wrapper">
      <div className="visualization-header">
        <h3 className="visualization-title">{type}</h3>
        {countText && <span className="data-count">{countText}</span>}
            </div>
      {component}
            </div>
  );
};

const VideoSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  
  const [jsonData, setJsonData] = useState({});
  const [videoInfo, setVideoInfo] = useState({ width: 800, height: 500, length: 252 });
  const [videoLength, setVideoLength] = useState(252);
  const [currentView, setCurrentView] = useState('Label Detection');
  const [trackedObjects, setTrackedObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFileName, setVideoFileName] = useState(null);
  
  // Wrap titleIdsDict in useMemo to prevent recreation on every render
  const titleIdsDict = useMemo(() => ({
                    'Label Detection': 'shot_label_annotations',
                    'Object Tracking': 'object_annotations',
                    'Face Detection': 'face_detection_annotations',
                    'Speech Transcription': 'speech_transcriptions',
                    'Text Detection': 'text_annotations',
  }), []);

  // Equivalent to Vue's computed properties
  const dataMisaligned = useMemo(() => {
    if (jsonData && jsonData.annotation_results) {
      const delta = videoInfo.length - jsonData.annotation_results[0].segment.end_time_offset.seconds;
      if (Math.abs(delta) > 2) {
        return true;
      }
    }
    return false;
  }, [jsonData, videoInfo.length]);

  const detectedFeatures = useMemo(() => {
    let features = [];
    if (!jsonData.annotation_results) return features;

    jsonData.annotation_results.forEach(annotations => {
      features = features.concat(Object.keys(annotations));
    });

    return features;
  }, [jsonData]);

  // Handle URL hash changes
  useEffect(() => {
    if (location.hash) {
      const hashValue = decodeURIComponent(location.hash.substring(1));
      if (hashValue in titleIdsDict) {
        setCurrentView(hashValue);
      }
    }
  }, [location.hash, titleIdsDict]);

  // Load initial test data
  useEffect(() => {
    setIsLoading(true);
    // Use the imported JSON directly instead of trying to fetch it
    setJsonData(json);
    loadVideoFromUrl(video);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract tracked objects from API data
  useEffect(() => {
    if (jsonData && jsonData.annotation_results) {
      const objectTracks = [];
      
      // Process object annotations
      jsonData.annotation_results.forEach(result => {
        if (result.object_annotations) {
          result.object_annotations.forEach(obj => {
            if (obj.frames && obj.frames.length > 0) {
              objectTracks.push(new TrackedObject(obj.entity, obj.frames));
            }
          });
        }
        
        // Process face detection annotations
        if (result.face_detection_annotations) {
          result.face_detection_annotations.forEach((face, index) => {
            if (face.tracks) {
              face.tracks.forEach(track => {
                if (track.timestamped_objects && track.timestamped_objects.length > 0) {
                  objectTracks.push(new TrackedObject(
                    { description: `Face ${index + 1}` },
                    track.timestamped_objects.map(obj => ({
                      time_offset: obj.time_offset,
                      normalized_bounding_box: obj.normalized_bounding_box
                    }))
                  ));
                }
              });
            }
          });
        }
      });
      
      setTrackedObjects(objectTracks);
    }
  }, [jsonData]);

  // Set up video timeupdate event to draw bounding boxes
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.font = "16px Arial";
    
    const handleTimeUpdate = () => {
      if (currentView === 'Object Tracking' || 
          currentView === 'Face Detection') {
        draw_bounding_boxes(trackedObjects, ctx, video.currentTime, video.videoWidth, video.videoHeight);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [trackedObjects, currentView]);

  // Methods
  const jumpVideo = (eventData) => {
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      jumpVideoToTime(eventData.seconds);
    }
  };

  const handleSetCurrentView = (newView) => {
    setCurrentView(newView);
    navigate({ hash: `#${newView}` });
  };

  const jumpVideoToTime = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const loadVideoFromUrl = (url) => {
    if (videoRef.current) {
      setIsLoading(true);
      
      // Add error handling
      const handleVideoError = () => {
        console.error('Error loading video:', url);
        showNotification("Failed to load video. Please check the file format.", "error");
        setIsLoading(false);
        
        // Clean up error listener
        videoRef.current.removeEventListener('error', handleVideoError);
      };
      
      // Clean up success listener
      const handleLoadedData = () => {
        setIsLoading(false);
        videoRef.current.removeEventListener('loadeddata', handleLoadedData);
      };
      
      // Add event listeners for success and error
      videoRef.current.addEventListener('error', handleVideoError, { once: true });
      videoRef.current.addEventListener('loadeddata', handleLoadedData, { once: true });
      
      // Set the video source
      videoRef.current.src = url;
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Get the actual video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      // Store video info
      setVideoInfo(prev => ({
        ...prev,
        length: video.duration,
        width: videoWidth,
        height: videoHeight
      }));
      setVideoLength(video.duration);
      
      // Make sure canvas matches video dimensions for accurate drawing
      if (canvas) {
        // Set canvas size to match video's intrinsic dimensions
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        
        // Ensure the canvas context is ready for drawing
        const ctx = canvas.getContext('2d');
        ctx.font = "16px Arial";
      }
      
      // Notify user about successful video loading with dimensions
      if (videoFileName) {
        showNotification(`Video loaded successfully: ${videoWidth}×${videoHeight}`, "success");
      }
    }
  };

  // Disable unused vars warning since this function is kept for future use
  // eslint-disable-next-line no-unused-vars
  const loadJsonFromUrl = async (jsonSource) => {
    try {
      setIsLoading(true);
      
      let data;
      // If it's already a JSON object (imported) use it directly
      if (typeof jsonSource === 'object') {
        data = jsonSource;
      } else {
        // Otherwise fetch it from URL
        const response = await fetch(jsonSource);
        
        if (!response.ok) {
          throw new Error(`Failed to load JSON: ${response.status} ${response.statusText}`);
        }
        
        data = await response.json();
      }
      
      setJsonData(data);
      
      // Check validity of json
      if (!('annotation_results' in data)) {
        showNotification("⚠️ Sorry, json output format not supported. Make sure to set the 'output_uri' configuration when calling the Video Intelligence API.", "error");
        if (jsonInputRef.current) {
          jsonInputRef.current.value = null;
        }
      } else {
        showNotification("JSON data loaded successfully!", "success");
      }
      
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error('Error loading JSON:', error);
      showNotification(`Error loading JSON: ${error.message}`, "error");
      setIsLoading(false);
      throw error;
    }
  };

  const handleJsonChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      showNotification(`Processing JSON file: ${file.name}`, "info");
      
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          // Parse the JSON content directly
          const jsonContent = JSON.parse(e.target.result);
          
          // Process the JSON data
          if (!('annotation_results' in jsonContent)) {
            showNotification("⚠️ This JSON file doesn't contain Video Intelligence API results", "error");
          } else {
            setJsonData(jsonContent);
            showNotification(`JSON file "${file.name}" loaded successfully!`, "success");
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          showNotification(`Error parsing JSON: ${error.message}`, "error");
        } finally {
          setIsLoading(false);
        }
      };
      
      fileReader.onerror = () => {
        showNotification("Failed to read the JSON file", "error");
        setIsLoading(false);
      };
      
      setIsLoading(true);
      fileReader.readAsText(file);
    }
  };

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        showNotification("Video file is too large (>100MB). Please choose a smaller file.", "warning");
        return;
      }
      
      setVideoFileName(file.name);
      showNotification(`Processing video: ${file.name}`, "info");
      
      const fileUrl = URL.createObjectURL(file);
      loadVideoFromUrl(fileUrl);
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
  };

  const handleDropVideo = (event) => {
    event.preventDefault();
    if (videoInputRef.current && event.dataTransfer.files.length > 0) {
      const files = event.dataTransfer.files;
      // Create a new FileList-like object
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      
      videoInputRef.current.files = dataTransfer.files;
      handleVideoChange({ target: { files: dataTransfer.files } });
    }
  };

  const handleDropJson = (event) => {
    event.preventDefault();
    if (jsonInputRef.current && event.dataTransfer.files.length > 0) {
      const files = event.dataTransfer.files;
      // Create a new FileList-like object
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      
      jsonInputRef.current.files = dataTransfer.files;
      handleJsonChange({ target: { files: dataTransfer.files } });
    }
  };
  
  // Notification system
  const [notifications, setNotifications] = useState([]);
  
  const showNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };
  
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div className="video-intelligence-app">
        
      {/* Modern header */}
      <header className="app-header">
        <div className="header-logo">
          <div className="logo">VI</div>
        </div>
        <div className="header-title">
          <h1>Video Intelligence Visualizer</h1>
          <p className="header-subtitle">Analyze and visualize video content with AI</p>
        </div>
        <div className="header-actions">
          <a 
            href="https://github.com/ZackAkil/video-intelligence-api-visualiser/blob/main/run_video_intelligence.py"
            target="_blank" 
            rel="noopener noreferrer"
            className="header-link"
          >
            <span className="material-icons">code</span>
            <span>View API Script</span>
          </a>
        </div>
      </header>

      {/* Notification system */}
      <div className="notification-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification notification-${notification.type}`}
          >
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-dismiss" 
              onClick={() => dismissNotification(notification.id)}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        ))}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing video data...</p>
        </div>
      )}

      {/* Enhanced video container */}
      <div className="video-container-wrapper">
        <div className="video-container">
          <canvas ref={canvasRef} id="my_canvas" width="800" height="500"></canvas>
          <video 
            ref={videoRef} 
            id="video" 
            controls 
            playsInline
            onCanPlay={handleVideoLoad}
          ></video>
          {videoFileName && (
            <div className="video-info">
              <span className="material-icons">videocam</span>
              <span className="video-filename">{videoFileName}</span>
              {videoLength > 0 && (
                <span className="video-duration">
                  {Math.floor(videoLength / 60)}:{Math.floor(videoLength % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation tabs with enhanced UI */}
      <div className="analysis-navigation">
        <h2 className="section-title">Analysis Results</h2>
        <AnnotationsNav 
          titleIdsDict={titleIdsDict}
          detectedFeatures={detectedFeatures}
          currentView={currentView}
          onNavClicked={handleSetCurrentView}
        />
      </div>

      {/* Data warning with improved styling */}
      {dataMisaligned && (
        <div className="data-warning">
          <span className="material-icons warning-icon">warning</span>
          <p>
            It looks like the JSON data doesn't align with the video file. 
            Are you sure you have the correct files uploaded?
          </p>
        </div>
      )}

      {/* Visualization component with data limiting */}
      <div className="visualization-container">
        {currentView === 'Object Tracking' && (
          <EnhancedVisualization
            type="Object Tracking"
            component={
              <ObjectTrackingViz 
                jsonData={jsonData} 
                videoInfo={videoInfo} 
                onSegmentClicked={jumpVideo}
                renderItem={(items) => (
                  <DataLimiter>
                    {items}
                  </DataLimiter>
                )}
              />
            }
          />
        )}

        {currentView === 'Label Detection' && (
          <EnhancedVisualization
            type="Label Detection"
            component={
              <LabelDetectionViz 
                jsonData={jsonData} 
                videoInfo={videoInfo} 
                onSegmentClicked={jumpVideo}
                renderItem={(items) => (
                  <DataLimiter>
                    {items}
                  </DataLimiter>
                )}
              />
            }
          />
        )}

        {currentView === 'Speech Transcription' && (
          <EnhancedVisualization
            type="Speech Transcription"
            component={
              <SpeechTranscriptionViz 
                jsonData={jsonData} 
                videoInfo={videoInfo} 
                onWordClicked={jumpVideo}
                renderItem={(items) => (
                  <DataLimiter>
                    {items}
                  </DataLimiter>
                )}
              />
            }
          />
        )}

        {currentView === 'Face Detection' && (
          <EnhancedVisualization
            type="Face Detection"
            component={
              <FaceDetectionViz 
                jsonData={jsonData} 
                videoInfo={videoInfo} 
                onSegmentClicked={jumpVideo}
                renderItem={(items) => (
                  <DataLimiter>
                    {items}
                  </DataLimiter>
                )}
              />
            }
          />
        )}

        {currentView === 'Tab and Window Switching' && (
          <TabSwitchingViz 
            jsonData={jsonData} 
            videoInfo={videoInfo} 
            onSegmentClicked={jumpVideo} 
          />
        )}

        {currentView === 'Text Detection' && (
          <EnhancedVisualization
            type="Text Detection"
            component={
              <TextDetectionViz 
                jsonData={jsonData} 
                videoInfo={videoInfo} 
                onSegmentClicked={jumpVideo}
                renderItem={(items) => (
                  <DataLimiter>
                    {items}
                  </DataLimiter>
                )}
              />
            }
          />
        )}
      </div>

      {/* Enhanced upload area */}
      <div className="upload-section">
        <h2 className="section-title">Try with your data</h2>
        <p className="upload-description">
          Upload your own video and analysis JSON to explore the results.
          This app <b><u>doesn't</u></b> send or store any of your video or annotation data.
        </p>
        
        <div className="upload-container">
          <FileUploader
            label="Upload Video"
            accept="video/*"
            onChange={handleVideoChange}
            inputRef={videoInputRef}
            onDrop={handleDropVideo}
            onDragOver={handleDragEnter}
            icon="Video file"
          />
          
          <FileUploader
            label="Upload JSON"
            accept="application/JSON"
            onChange={handleJsonChange}
            inputRef={jsonInputRef}
            onDrop={handleDropJson}
            onDragOver={handleDragEnter}
            icon="Json file"
          />
        </div>
        
        <div className="upload-help">
          <h3>How to get analysis JSON:</h3>
          <ol>
            <li>Use the <a href="https://github.com/ZackAkil/video-intelligence-api-visualiser/blob/main/run_video_intelligence.py" target="_blank" rel="noopener noreferrer">Python script</a> to analyze your video with the Google Video Intelligence API</li>
            <li>Make sure to set the <code>output_uri</code> configuration to save results to Google Cloud Storage</li>
            <li>Download the JSON file from Google Cloud Storage</li>
            <li>Upload both the original video and the JSON file here</li>
          </ol>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="app-footer">
        <p>Video Intelligence API Visualizer • Designed for easier understanding of video analysis</p>
      </footer>
    </div>
  );
};

export default VideoSummary;
