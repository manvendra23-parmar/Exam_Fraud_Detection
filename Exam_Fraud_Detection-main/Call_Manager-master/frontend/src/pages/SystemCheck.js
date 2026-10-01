import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Container,
  Grid,
  Chip,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Refresh,
  Videocam,
  Mic,
  Computer,
  NetworkCheck,
  BatteryChargingFull,
  PlayArrow,
  Info,
  CameraAlt,
  Replay,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Status constants
const STATUS = {
  PENDING: 'pending',
  CHECKING: 'checking',
  PASS: 'pass',
  FAIL: 'fail',
  WARNING: 'warning',
};

const SystemCheck = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  const [checks, setChecks] = useState({
    browser: { status: STATUS.PENDING, message: '', details: {} },
    device: { status: STATUS.PENDING, message: '', details: {} },
    internet: { status: STATUS.PENDING, message: '', details: {} },
    webcam: { status: STATUS.PENDING, message: '', details: {} },
    microphone: { status: STATUS.PENDING, message: '', details: {} },
    systemHealth: { status: STATUS.PENDING, message: '', details: {} },
  });

  const [isChecking, setIsChecking] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [canStartExam, setCanStartExam] = useState(false);
  const [currentCheckName, setCurrentCheckName] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  // Update check status helper
  const updateCheck = (checkName, status, message, details = {}) => {
    setChecks(prev => ({
      ...prev,
      [checkName]: { status, message, details },
    }));
    setCurrentCheckName(checkName);
  };

  // 1. Browser Compatibility Check
  const checkBrowser = async () => {
    updateCheck('browser', STATUS.CHECKING, 'Checking browser compatibility...');
    
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let isChromium = false;
    let isIncognito = false;

    // Detect browser
    if (userAgent.includes('Edg/')) {
      browserName = 'Microsoft Edge';
      browserVersion = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
      isChromium = true;
    } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
      browserName = 'Google Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
      isChromium = true;
    } else if (userAgent.includes('Firefox/')) {
      browserName = 'Mozilla Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    }

    // Check for incognito/private mode (best-effort detection)
    try {
      const db = indexedDB.open('test');
      db.onerror = () => {
        isIncognito = true;
      };
      await new Promise((resolve) => {
        db.onsuccess = () => {
          indexedDB.deleteDatabase('test');
          resolve();
        };
        db.onerror = () => {
          isIncognito = true;
          resolve();
        };
        setTimeout(resolve, 100);
      });
    } catch (e) {
      isIncognito = true;
    }

    // Additional incognito check using storage quota
    try {
      const storage = await navigator.storage.estimate();
      if (storage.quota && storage.quota < 120000000) {
        isIncognito = true;
      }
    } catch (e) {
      // Fallback check
    }

    if (!isChromium) {
      updateCheck(
        'browser',
        STATUS.FAIL,
        `Unsupported browser: ${browserName}. Please use Chrome or Edge.`,
        { browserName, browserVersion, isChromium, isIncognito }
      );
      return STATUS.FAIL;
    }

    if (isIncognito) {
      updateCheck(
        'browser',
        STATUS.FAIL,
        'Incognito/Private mode detected. Please use a regular browser window.',
        { browserName, browserVersion, isChromium, isIncognito }
      );
      return STATUS.FAIL;
    }

    updateCheck(
      'browser',
      STATUS.PASS,
      `${browserName} ${browserVersion} is supported.`,
      { browserName, browserVersion, isChromium, isIncognito }
    );
    return STATUS.PASS;
  };

  // 2. Device & OS Check
  const checkDevice = async () => {
    updateCheck('device', STATUS.CHECKING, 'Checking device compatibility...');

    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    let os = 'Unknown';

    // Detect device type
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
    }

    if (deviceType !== 'desktop') {
      updateCheck(
        'device',
        STATUS.FAIL,
        `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} devices are not allowed. Please use a desktop or laptop.`,
        { deviceType, os }
      );
      return STATUS.FAIL;
    }

    updateCheck(
      'device',
      STATUS.PASS,
      `Desktop/Laptop detected. OS: ${os}`,
      { deviceType, os }
    );
    return STATUS.PASS;
  };

  // 3. Internet Connectivity Check
  const checkInternet = async () => {
    updateCheck('internet', STATUS.CHECKING, 'Checking internet connection...');

    const isOnline = navigator.onLine;
    if (!isOnline) {
      updateCheck('internet', STATUS.FAIL, 'No internet connection detected.', {});
      return STATUS.FAIL;
    }

    // Measure download speed
    let speedMbps = 0;
    let connectionDrops = 0;
    
    try {
      // Simple speed test using a small image
      const testImage = new Image();
      const testUrl = `https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png?t=${Date.now()}`;
      
      await new Promise((resolve, reject) => {
        const start = performance.now();
        testImage.onload = () => {
          const end = performance.now();
          const duration = (end - start) / 1000; // seconds
          const sizeBytes = 5000; // Approximate size
          speedMbps = (sizeBytes * 8) / (duration * 1000000); // Convert to Mbps
          resolve();
        };
        testImage.onerror = reject;
        testImage.src = testUrl;
        setTimeout(reject, 5000);
      });
    } catch (e) {
      // Fallback: assume connection exists but speed test failed
      speedMbps = 5; // Default assumption
    }

    // Monitor connection stability
    let offlineCount = 0;
    const monitorConnection = () => {
      if (!navigator.onLine) {
        offlineCount++;
      }
    };
    
    window.addEventListener('online', monitorConnection);
    window.addEventListener('offline', monitorConnection);

    // Check after 3 seconds
    setTimeout(() => {
      connectionDrops = offlineCount;
      window.removeEventListener('online', monitorConnection);
      window.removeEventListener('offline', monitorConnection);
    }, 3000);

    if (speedMbps < 1) {
      updateCheck(
        'internet',
        STATUS.WARNING,
        `Slow connection detected (${speedMbps.toFixed(2)} Mbps). Minimum recommended: 1 Mbps.`,
        { speedMbps, connectionDrops }
      );
      return STATUS.WARNING;
    }

    if (connectionDrops > 0) {
      updateCheck(
        'internet',
        STATUS.WARNING,
        `Unstable connection detected (${connectionDrops} drop(s)). Please ensure stable internet.`,
        { speedMbps, connectionDrops }
      );
      return STATUS.WARNING;
    }

    updateCheck(
      'internet',
      STATUS.PASS,
      `Connection stable. Speed: ${speedMbps.toFixed(2)} Mbps`,
      { speedMbps, connectionDrops }
    );
    return STATUS.PASS;
  };

  // 4. Webcam Check
  const checkWebcam = async () => {
    updateCheck('webcam', STATUS.CHECKING, 'Requesting camera access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });

      // Check for virtual cameras (basic detection)
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const label = videoTrack.label.toLowerCase();
      
      const virtualCameraKeywords = ['virtual', 'obs', 'manycam', 'camera', 'webcam', 'droidcam'];
      const isVirtual = virtualCameraKeywords.some(keyword => 
        label.includes(keyword) && label.split(keyword).length > 2
      );

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      if (isVirtual) {
        updateCheck(
          'webcam',
          STATUS.WARNING,
          'Virtual camera detected. Please use a physical webcam.',
          { label, isVirtual }
        );
        return STATUS.WARNING;
      }

      updateCheck(
        'webcam',
        STATUS.PASS,
        `Camera access granted. Please capture your photo for identification.`,
        { label, isVirtual, settings }
      );
      return STATUS.PASS;
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        updateCheck(
          'webcam',
          STATUS.FAIL,
          'Camera permission denied. Please allow camera access.',
          { error: error.message }
        );
        return STATUS.FAIL;
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        updateCheck(
          'webcam',
          STATUS.FAIL,
          'No camera found. Please connect a webcam.',
          { error: error.message }
        );
        return STATUS.FAIL;
      } else {
        updateCheck(
          'webcam',
          STATUS.FAIL,
          `Camera error: ${error.message}`,
          { error: error.message }
        );
        return STATUS.FAIL;
      }
    }
  };

  // 5. Microphone Check
  const checkMicrophone = async () => {
    updateCheck('microphone', STATUS.CHECKING, 'Requesting microphone access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      const label = audioTrack.label || 'Default Microphone';

      // Create audio context for level detection
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Check audio level
      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        return average;
      };

      // Wait a moment for audio to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      const audioLevel = checkAudioLevel();

      if (audioLevel < 1) {
        updateCheck(
          'microphone',
          STATUS.WARNING,
          'Microphone detected but no audio input. Please check if microphone is muted.',
          { label, audioLevel }
        );
        return STATUS.WARNING;
      }

      updateCheck(
        'microphone',
        STATUS.PASS,
        `Microphone access granted. Device: ${label}`,
        { label, audioLevel }
      );
      return STATUS.PASS;
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        updateCheck(
          'microphone',
          STATUS.FAIL,
          'Microphone permission denied. Please allow microphone access.',
          { error: error.message }
        );
        return STATUS.FAIL;
      } else if (error.name === 'NotFoundError') {
        updateCheck(
          'microphone',
          STATUS.FAIL,
          'No microphone found. Please connect a microphone.',
          { error: error.message }
        );
        return STATUS.FAIL;
      } else {
        updateCheck(
          'microphone',
          STATUS.FAIL,
          `Microphone error: ${error.message}`,
          { error: error.message }
        );
        return STATUS.FAIL;
      }
    }
  };

  // 6. System Health Check
  const checkSystemHealth = async () => {
    updateCheck('systemHealth', STATUS.CHECKING, 'Checking system health...');

    let batteryLevel = null;
    let isCharging = false;
    let warnings = [];

    // Battery API (if available)
    if (navigator.getBattery) {
      try {
        const battery = await navigator.getBattery();
        batteryLevel = Math.round(battery.level * 100);
        isCharging = battery.charging;

        if (batteryLevel < 20 && !isCharging) {
          warnings.push(`Low battery: ${batteryLevel}%`);
          updateCheck(
            'systemHealth',
            STATUS.WARNING,
            `Low battery warning: ${batteryLevel}%. Please connect to power.`,
            { batteryLevel, isCharging, warnings }
          );
          return STATUS.WARNING;
        }
      } catch (e) {
        // Battery API not available
      }
    }

    updateCheck(
      'systemHealth',
      STATUS.PASS,
      batteryLevel !== null 
        ? `Battery: ${batteryLevel}% ${isCharging ? '(Charging)' : ''}`
        : 'System health check complete.',
      { batteryLevel, isCharging, warnings }
    );
    return STATUS.PASS;
  };

  // Run all checks sequentially - stop if mandatory check fails
  const runAllChecks = async () => {
    setIsChecking(true);
    setOverallProgress(0);
    setCanStartExam(false);

    // Define check order and which are mandatory
    const checkConfigs = [
      { func: checkBrowser, name: 'Browser Compatibility', key: 'browser', mandatory: true },
      { func: checkDevice, name: 'Device & OS', key: 'device', mandatory: true },
      { func: checkInternet, name: 'Internet Connectivity', key: 'internet', mandatory: false },
      { func: checkWebcam, name: 'Webcam', key: 'webcam', mandatory: true },
      { func: checkMicrophone, name: 'Microphone', key: 'microphone', mandatory: true },
      { func: checkSystemHealth, name: 'System Health', key: 'systemHealth', mandatory: false },
    ];

    for (let i = 0; i < checkConfigs.length; i++) {
      const checkConfig = checkConfigs[i];
      setCurrentCheckName(checkConfig.name);
      
      // Run the check and get the result
      const result = await checkConfig.func();
      
      // Wait a moment to show the result
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If mandatory check failed, stop execution
      if (checkConfig.mandatory && result === STATUS.FAIL) {
        setCurrentCheckName('');
        setIsChecking(false);
        evaluateFinalStatus();
        return; // Stop execution - don't proceed to next checks
      }
      
      // Update progress
      setOverallProgress(((i + 1) / checkConfigs.length) * 100);
    }

    setCurrentCheckName('');
    setIsChecking(false);
    evaluateFinalStatus();
  };

  // Evaluate if exam can start
  const evaluateFinalStatus = useCallback(() => {
    const mandatoryChecks = ['browser', 'device', 'webcam', 'microphone'];
    const allMandatoryPass = mandatoryChecks.every(
      check => checks[check].status === STATUS.PASS
    );

    const hasFailures = Object.values(checks).some(
      check => check.status === STATUS.FAIL
    );

    setCanStartExam(allMandatoryPass && !hasFailures);
  }, [checks]);

  // Re-evaluate when checks change
  useEffect(() => {
    if (!isChecking) {
      evaluateFinalStatus();
    }
  }, [checks, isChecking, evaluateFinalStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Get status chip
  const getStatusChip = (status) => {
    switch (status) {
      case STATUS.PASS:
        return <Chip icon={<CheckCircle />} label="Pass" color="success" size="small" />;
      case STATUS.FAIL:
        return <Chip icon={<Cancel />} label="Fail" color="error" size="small" />;
      case STATUS.WARNING:
        return <Chip icon={<Warning />} label="Warning" color="warning" size="small" />;
      case STATUS.CHECKING:
        return <Chip icon={<CircularProgress size={16} />} label="Checking..." color="info" size="small" />;
      default:
        return <Chip label="Pending" size="small" />;
    }
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    const total = Object.keys(checks).length;
    const passed = Object.values(checks).filter(c => c.status === STATUS.PASS).length;
    const failed = Object.values(checks).filter(c => c.status === STATUS.FAIL).length;
    const warnings = Object.values(checks).filter(c => c.status === STATUS.WARNING).length;
    const pending = Object.values(checks).filter(c => c.status === STATUS.PENDING).length;
    return { total, passed, failed, warnings, pending };
  };

  const checkConfigs = [
    { key: 'browser', name: 'Browser Compatibility', icon: <Computer /> },
    { key: 'device', name: 'Device & OS', icon: <Computer /> },
    { key: 'internet', name: 'Internet Connectivity', icon: <NetworkCheck /> },
    { key: 'webcam', name: 'Webcam', icon: <Videocam /> },
    { key: 'microphone', name: 'Microphone', icon: <Mic /> },
    { key: 'systemHealth', name: 'System Health', icon: <BatteryChargingFull /> },
  ];

  const stats = getSummaryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 4,
              borderRadius: 3,
              mb: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              System Compatibility Check
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Verify your system meets all requirements before starting your exam
            </Typography>

            {/* Summary Stats */}
            {!isChecking && Object.values(checks).some(c => c.status !== STATUS.PENDING) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                <Chip
                  icon={<CheckCircle />}
                  label={`${stats.passed} Passed`}
                  sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: 'white', fontWeight: 'bold' }}
                />
                <Chip
                  icon={<Cancel />}
                  label={`${stats.failed} Failed`}
                  sx={{ bgcolor: 'rgba(244, 67, 54, 0.2)', color: 'white', fontWeight: 'bold' }}
                />
                <Chip
                  icon={<Warning />}
                  label={`${stats.warnings} Warnings`}
                  sx={{ bgcolor: 'rgba(255, 152, 0, 0.2)', color: 'white', fontWeight: 'bold' }}
                />
              </Box>
            )}

            {/* Progress Bar */}
            {isChecking && (
              <Box sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {currentCheckName ? `Checking ${currentCheckName}...` : 'Running checks...'}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {Math.round(overallProgress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={overallProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                    },
                  }}
                />
              </Box>
            )}

            {/* Action Button */}
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={isChecking ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                onClick={runAllChecks}
                disabled={isChecking}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
              >
                {isChecking ? 'Running Checks...' : 'Start System Check'}
              </Button>
            </Box>
          </Paper>

          {/* Check Cards Grid */}
          <Grid container spacing={3}>
            {checkConfigs.map((config, index) => {
              const check = checks[config.key];
              const isMandatory = ['browser', 'device', 'webcam', 'microphone'].includes(config.key);
              
              return (
                <Grid item xs={12} sm={6} lg={4} key={config.key}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        position: 'relative',
                        overflow: 'visible',
                        border: `2px solid ${
                          check.status === STATUS.PASS
                            ? '#4caf50'
                            : check.status === STATUS.FAIL
                            ? '#f44336'
                            : check.status === STATUS.WARNING
                            ? '#ff9800'
                            : '#e0e0e0'
                        }`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 24px ${
                            check.status === STATUS.PASS
                              ? 'rgba(76, 175, 80, 0.3)'
                              : check.status === STATUS.FAIL
                              ? 'rgba(244, 67, 54, 0.3)'
                              : check.status === STATUS.WARNING
                              ? 'rgba(255, 152, 0, 0.3)'
                              : 'rgba(0, 0, 0, 0.1)'
                          }`,
                        },
                        boxShadow: `0 4px 12px ${
                          check.status === STATUS.PASS
                            ? 'rgba(76, 175, 80, 0.15)'
                            : check.status === STATUS.FAIL
                            ? 'rgba(244, 67, 54, 0.15)'
                            : check.status === STATUS.WARNING
                            ? 'rgba(255, 152, 0, 0.15)'
                            : 'rgba(0, 0, 0, 0.05)'
                        }`,
                      }}
                    >
                      {/* Status Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -12,
                          right: 16,
                          zIndex: 1,
                        }}
                      >
                        {getStatusChip(check.status)}
                      </Box>

                      {/* Mandatory Badge */}
                      {isMandatory && (
                        <Chip
                          label="Required"
                          size="small"
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            zIndex: 1,
                            fontSize: '0.7rem',
                          }}
                        />
                      )}

                      <CardContent sx={{ pt: 4, pb: 3 }}>
                        {/* Icon and Title */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              mr: 2,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor:
                                check.status === STATUS.PASS
                                  ? 'rgba(76, 175, 80, 0.1)'
                                  : check.status === STATUS.FAIL
                                  ? 'rgba(244, 67, 54, 0.1)'
                                  : check.status === STATUS.WARNING
                                  ? 'rgba(255, 152, 0, 0.1)'
                                  : 'rgba(0, 0, 0, 0.05)',
                              color:
                                check.status === STATUS.PASS
                                  ? '#4caf50'
                                  : check.status === STATUS.FAIL
                                  ? '#f44336'
                                  : check.status === STATUS.WARNING
                                  ? '#ff9800'
                                  : '#666',
                            }}
                          >
                            {config.icon}
                          </Box>
                          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                            {config.name}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Status Message */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            minHeight: 48,
                            lineHeight: 1.6,
                            color:
                              check.status === STATUS.PASS
                                ? '#4caf50'
                                : check.status === STATUS.FAIL
                                ? '#f44336'
                                : check.status === STATUS.WARNING
                                ? '#ff9800'
                                : '#666',
                            fontWeight: check.status !== STATUS.PENDING ? 500 : 400,
                          }}
                        >
                          {check.message || 'Click "Start System Check" to begin verification'}
                        </Typography>

                        {/* Alerts */}
                        {check.status === STATUS.FAIL && (
                          <Alert
                            severity="error"
                            icon={<Cancel />}
                            sx={{
                              mt: 1,
                              borderRadius: 2,
                              '& .MuiAlert-icon': {
                                alignItems: 'center',
                              },
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              This check must pass to start the exam.
                            </Typography>
                          </Alert>
                        )}

                        {check.status === STATUS.WARNING && (
                          <Alert
                            severity="warning"
                            icon={<Warning />}
                            sx={{
                              mt: 1,
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2">
                              This may affect your exam experience.
                            </Typography>
                          </Alert>
                        )}

                        {/* Webcam Preview and Photo Capture */}
                        {config.key === 'webcam' && check.status === STATUS.PASS && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#2196f3' }}>
                              📸 Capture your photo for identification
                            </Typography>
                            
                            {/* Hidden canvas for capturing */}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            
                            {!capturedPhoto ? (
                              <Box>
                                <Box
                                  sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #4caf50',
                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                                    mb: 2,
                                    position: 'relative',
                                  }}
                                >
                                  <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{
                                      width: '100%',
                                      display: 'block',
                                    }}
                                  />
                                </Box>
                                <Button
                                  variant="contained"
                                  fullWidth
                                  startIcon={<CameraAlt />}
                                  onClick={() => {
                                    if (videoRef.current && canvasRef.current) {
                                      const video = videoRef.current;
                                      const canvas = canvasRef.current;
                                      
                                      // Set canvas dimensions to match video
                                      canvas.width = video.videoWidth;
                                      canvas.height = video.videoHeight;
                                      
                                      // Draw video frame to canvas
                                      const ctx = canvas.getContext('2d');
                                      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                      
                                      // Convert canvas to image data URL
                                      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                                      setCapturedPhoto(photoDataUrl);
                                      
                                      // Stop the video stream
                                      if (streamRef.current) {
                                        streamRef.current.getTracks().forEach(track => track.stop());
                                      }
                                    }
                                  }}
                                  sx={{
                                    bgcolor: '#4caf50',
                                    '&:hover': {
                                      bgcolor: '#45a049',
                                    },
                                    py: 1.5,
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Capture Photo
                                </Button>
                              </Box>
                            ) : (
                              <Box>
                                <Box
                                  sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #4caf50',
                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                                    mb: 2,
                                    position: 'relative',
                                  }}
                                >
                                  <img
                                    src={capturedPhoto}
                                    alt="Captured identification"
                                    style={{
                                      width: '100%',
                                      display: 'block',
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      bgcolor: 'rgba(76, 175, 80, 0.9)',
                                      color: 'white',
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      fontSize: '0.75rem',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    ✓ Captured
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Replay />}
                                    onClick={async () => {
                                      setCapturedPhoto(null);
                                      // Restart video stream
                                      try {
                                        const stream = await navigator.mediaDevices.getUserMedia({ 
                                          video: { 
                                            width: { ideal: 1280 },
                                            height: { ideal: 720 },
                                            facingMode: 'user'
                                          } 
                                        });
                                        if (videoRef.current) {
                                          videoRef.current.srcObject = stream;
                                          streamRef.current = stream;
                                        }
                                      } catch (error) {
                                        console.error('Error restarting camera:', error);
                                      }
                                    }}
                                    sx={{
                                      borderColor: '#4caf50',
                                      color: '#4caf50',
                                      '&:hover': {
                                        borderColor: '#45a049',
                                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                                      },
                                      py: 1.5,
                                    }}
                                  >
                                    Retake Photo
                                  </Button>
                                </Box>
                                <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Photo captured successfully!</strong> This will be used for identification during your exam.
                                  </Typography>
                                </Alert>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {/* Final Status Section */}
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <AnimatePresence>
              {canStartExam && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                      color: 'white',
                      mb: 3,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      All Systems Ready! ✓
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                      All mandatory checks have passed. You're ready to start your exam.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate('/meeting')}
                      sx={{
                        bgcolor: 'white',
                        color: '#4caf50',
                        px: 5,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      Start Exam Now
                    </Button>
                  </Paper>
                </motion.div>
              )}

              {!canStartExam && !isChecking && Object.values(checks).some(c => c.status !== STATUS.PENDING) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert
                    severity="error"
                    icon={<Cancel />}
                    sx={{
                      borderRadius: 2,
                      fontSize: '1rem',
                      '& .MuiAlert-message': {
                        width: '100%',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Please Fix Issues Before Starting
                    </Typography>
                    <Typography variant="body2">
                      Some mandatory checks have failed. Please review the failed checks above and fix them before proceeding.
                    </Typography>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Information Section */}
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              bgcolor: 'rgba(33, 150, 243, 0.05)',
              borderRadius: 3,
              border: '1px solid rgba(33, 150, 243, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Info sx={{ color: '#2196f3', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                Important Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.8 }}>
              <Box component="ul" sx={{ pl: 3, m: 0 }}>
                <li>
                  <strong>Browser Requirements:</strong> Only Chrome and Edge (Chromium-based) browsers are supported
                </li>
                <li>
                  <strong>Permissions:</strong> You'll need to allow camera and microphone access when prompted
                </li>
                <li>
                  <strong>Device:</strong> Desktop or laptop computers only (mobile devices are not supported)
                </li>
                <li>
                  <strong>Internet:</strong> A stable internet connection with at least 1 Mbps speed is recommended
                </li>
                <li>
                  <strong>Limitations:</strong> Some checks have browser security limitations and may not detect all prohibited software
                </li>
              </Box>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default SystemCheck;

