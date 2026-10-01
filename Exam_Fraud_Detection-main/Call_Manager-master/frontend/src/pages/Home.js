import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { 
  Box, 
  Button, 
  Card, 
  Container, 
  Grid, 
  Typography, 
  Chip
} from '@mui/material';

// Animation library imports
import { motion } from "framer-motion";

// Icons - only keep the ones being used
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

// Custom styled components
const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionCard = motion(Card);

// Custom SVG icons for features
const VideoAnalysisIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 8V16H5V8H15ZM16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z" fill="currentColor"/>
    <path d="M8.5 13.5C9.5 13.5 10.5 12.8 10.5 11C10.5 9.2 8.5 8 8.5 8C8.5 8 6.5 9.2 6.5 11C6.5 12.8 7.5 13.5 8.5 13.5Z" fill="currentColor" opacity="0.7"/>
    <path d="M12 10L13 12L14 10.5L15 12" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round"/>
  </svg>
);

const FacialRecognitionIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 11.75C8.31 11.75 7.75 12.31 7.75 13C7.75 13.69 8.31 14.25 9 14.25C9.69 14.25 10.25 13.69 10.25 13C10.25 12.31 9.69 11.75 9 11.75Z" fill="currentColor"/>
    <path d="M15 11.75C14.31 11.75 13.75 12.31 13.75 13C13.75 13.69 14.31 14.25 15 14.25C15.69 14.25 16.25 13.69 16.25 13C16.25 12.31 15.69 11.75 15 11.75Z" fill="currentColor"/>
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
    <path d="M12 17.5C14.33 17.5 16.3 16.04 17.11 14H6.89C7.7 16.04 9.67 17.5 12 17.5Z" fill="currentColor" opacity="0.7"/>
    <rect x="9" y="7" width="2" height="3" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="13" y="7" width="2" height="3" rx="1" fill="currentColor" opacity="0.7"/>
  </svg>
);

const SpeechAnalysisIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.66 15 15 13.66 15 12V6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15Z" fill="currentColor"/>
    <path d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.93V21H13V18.93C16.39 18.43 19 15.53 19 12H17Z" fill="currentColor" opacity="0.7"/>
    <path d="M14 9.5C14 9.5 12.5 11 12 11C11.5 11 10 9.5 10 9.5" stroke="white" strokeWidth="0.75" strokeLinecap="round"/>
  </svg>
);

const TextDetectionIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3Z" fill="currentColor" opacity="0.2"/>
    <path d="M9.5 7L11.5 13L13.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 16.5H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ObjectTrackingIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.2"/>
    <rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="2" strokeDasharray="2 1"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <path d="M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 22V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TabWindowSwitchingIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="8" rx="1" fill="currentColor" opacity="0.2"/>
    <rect x="10" y="13" width="12" height="8" rx="1" fill="currentColor" opacity="0.2"/>
    <path d="M3 4C3 3.44772 3.44772 3 4 3H13C13.5523 3 14 3.44772 14 4V7H3V4Z" fill="currentColor"/>
    <path d="M11 14C11 13.4477 11.4477 13 12 13H21C21.5523 13 22 13.4477 22 14V17H11V14Z" fill="currentColor"/>
    <path d="M3 7H14V10C14 10.5523 13.5523 11 13 11H4C3.44772 11 3 10.5523 3 10V7Z" fill="currentColor" opacity="0.7"/>
    <path d="M11 17H22V20C22 20.5523 21.5523 21 21 21H12C11.4477 21 11 20.5523 11 20V17Z" fill="currentColor" opacity="0.7"/>
    <path d="M5.5 7.5L8 5M8 7.5L5.5 5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
    <path d="M13.5 17.5L16 15M16 17.5L13.5 15" stroke="white" strokeWidth="1" strokeLinecap="round"/>
    <path d="M17 8L20 11M20 8L17 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 13L7 16M7 13L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Feature cards data with improved descriptions and styling
const features = [
  {
    title: "Video Analysis",
    description: "Leverage AI to analyze video content for insights and patterns. ",
    icon: <VideoAnalysisIcon />,
    color: "linear-gradient(135deg, #6B46C1, #9F7AEA)",
    shadowColor: "rgba(159, 122, 234, 0.3)"
  },
  {
    title: "Facial Recognition",
    description: "Detect and identify faces with high accuracy. ",
    icon: <FacialRecognitionIcon />,
    color: "linear-gradient(135deg, #2C7A7B, #4FD1C5)",
    shadowColor: "rgba(79, 209, 197, 0.3)"
  },
  {
    title: "Speech Analysis",
    description: "Convert speech to text with advanced AI transcription.",
    icon: <SpeechAnalysisIcon />,
    color: "linear-gradient(135deg, #DD6B20, #F6AD55)",
    shadowColor: "rgba(246, 173, 85, 0.3)"
  },
  {
    title: "Text Detection",
    description: "Extract and analyze text from video frames.",
    icon: <TextDetectionIcon />,
    color: "linear-gradient(135deg, #3182CE, #63B3ED)",
    shadowColor: "rgba(99, 179, 237, 0.3)"
  },
  {
    title: "Object Tracking",
    description: "Track and analyze object movements throughout video footage.",
    icon: <ObjectTrackingIcon />,
    color: "linear-gradient(135deg, #805AD5, #B794F4)",
    shadowColor: "rgba(183, 148, 244, 0.3)"
  },
  {
    title: "Tab & Window Switching",
    description: "Check System during Exam tab or window is switch or not.",
    icon: <TabWindowSwitchingIcon />,
    color: "linear-gradient(135deg, #E53E3E, #FC8181)",
    shadowColor: "rgba(252, 129, 129, 0.3)"
  }
];

// Quick Actions data
const quickActions = [
  {
    title: "System Check",
    description: "Verify your system compatibility before starting the exam",
    icon: <SystemUpdateAltIcon sx={{ fontSize: 32 }} />,
    link: "/system-check",
    color: "#00e5ff"
  },
  {
    title: "Start Proctoring",
    description: "Begin a new online exam session with live monitoring",
    icon: <PlayArrowIcon sx={{ fontSize: 32 }} />,
    link: "/meeting",
    color: "#00e5ff"
  },
  {
    title: "View Analytics",
    description: "Review video summaries and analysis reports",
    icon: <AnalyticsIcon sx={{ fontSize: 32 }} />,
    link: "/video-summary",
    color: "#00e5ff"
  },
  {
    title: "Security Features",
    description: "AI-powered monitoring and detection capabilities",
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
    link: "#features",
    color: "#00e5ff"
  }
];

// Animation variants for features section
const featureCardAnimation = {
  hidden: { y: 20, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const featureIconAnimation = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.5,
      ease: [0.175, 0.885, 0.32, 1.275] // Custom bounce effect
    }
  }
};

const featureHighlight = {
  initial: {
    scale: 1,
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)"
  },
  hover: (feature) => ({
    scale: 1.05,
    boxShadow: `0 20px 40px ${feature.shadowColor}`,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

function Home() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };
  
  const slideUp = {
    hidden: { y: 60, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  return (
    <div className="min-h-screen">
    <Header />
      
      {/* Hero Section with Animated Elements */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #2196f3 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Abstract Background Elements */}
        <Box sx={{ 
          position: 'absolute', 
          top: '-10%', 
          left: '-5%', 
          width: '120%', 
          height: '150%', 
          opacity: 0.05,
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)'
        }} />
        
        <MotionContainer 
          maxWidth="lg"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Grid container spacing={6} alignItems="center">
            <MotionGrid item xs={12} md={6} variants={slideUp}>
              <Chip 
                label="NEW FEATURE" 
                color="secondary" 
                size="small" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  '& .MuiChip-label': { px: 2 }
                }} 
              />
              <MotionTypography 
                variant="h2" 
                component="h1" 
                fontWeight="800" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em'
                }}
              >
                Secure and reliable proctoring for Safe
                <Box component="span" sx={{ 
                  display: 'block', 
                  color: '#00e5ff',
                  textShadow: '0 0 20px rgba(0,229,255,0.4)'
                }}>
                  Online Assements
                </Box>
              </MotionTypography>
              
              <MotionTypography 
                variant="h5" 
                color="inherit" 
                paragraph
                variants={fadeIn}
                sx={{ 
                  opacity: 0.9, 
                  maxWidth: '90%', 
                  fontSize: { xs: '1rem', md: '1.25rem' }, 
                  lineHeight: 1.6 
                }}
              >
                Ensuring security and integrity in online assessments is crucial to maintaining fairness and credibility. Robust proctoring solutions, AI-driven monitoring, and encrypted platforms help prevent malpractice.
              </MotionTypography>
              
              <MotionBox 
                sx={{ mt: 5, display: 'flex', gap: 2, flexWrap: 'wrap' }}
                variants={fadeIn}
              >
                <MotionButton 
                  variant="contained" 
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  component={Link}
                  to="/meeting"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{ 
                    backgroundColor: 'white', 
                    color: '#1976d2',
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                >
                  Start a Meeting
                </MotionButton>
                
                <MotionButton 
                  variant="outlined" 
                  size="large"
                  component={Link}
                  to="/video-summary"
                  endIcon={<ArrowForwardIcon />}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Video Summary
                </MotionButton>
              </MotionBox>
            </MotionGrid>
            
            <MotionGrid 
              item 
              xs={12} 
              md={6} 
              sx={{ textAlign: 'center' }}
              variants={fadeIn}
            >
              <MotionBox
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '140%',
                    height: '140%',
                    background: 'radial-gradient(circle, rgba(3,169,244,0.3) 0%, rgba(3,169,244,0) 70%)',
                    top: '-20%',
                    left: '-20%',
                    zIndex: -1,
                    borderRadius: '50%'
                  }
                }}
                animate={{ 
                  y: [0, -10, 0],
                  transition: { 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 500 400"
                  sx={{
                    maxWidth: '90%',
                    maxHeight: '450px',
                    filter: 'drop-shadow(0px 25px 50px rgba(0,0,0,0.4))',
                    width: '100%',
                    height: 'auto'
                  }}
                >
                  <defs>
                    {/* Background Gradient */}
                    <linearGradient id="bgGradient3d" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a237e" stopOpacity="0.2"/>
                      <stop offset="50%" stopColor="#1565c0" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="#2196f3" stopOpacity="0.2"/>
                    </linearGradient>
                    
                    {/* Screen Gradient with 3D effect */}
                    <linearGradient id="screenGradient3d" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3"/>
                      <stop offset="50%" stopColor="#e0e0e0" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.6"/>
                    </linearGradient>
                    
                    {/* Laptop Base 3D Gradient */}
                    <linearGradient id="laptopBase3d" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#606060" stopOpacity="0.9"/>
                      <stop offset="50%" stopColor="#2a2a2a" stopOpacity="0.95"/>
                      <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.9"/>
                    </linearGradient>
                    
                    {/* Screen Frame 3D */}
                    <linearGradient id="screenFrame3d" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#404040" stopOpacity="0.95"/>
                      <stop offset="50%" stopColor="#1a1a1a" stopOpacity="0.98"/>
                      <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.95"/>
                    </linearGradient>
                    
                    {/* Desk Top 3D */}
                    <linearGradient id="deskTop3d" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8b6f47" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#5d4037" stopOpacity="0.4"/>
                    </linearGradient>
                    
                    {/* Desk Side 3D */}
                    <linearGradient id="deskSide3d" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6d4c41" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3e2723" stopOpacity="0.25"/>
                    </linearGradient>
                    
                    {/* Person Head 3D */}
                    <radialGradient id="headGradient3d" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#ffd4a3" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#e6b894" stopOpacity="0.95"/>
                    </radialGradient>
                    
                    {/* Person Body 3D */}
                    <linearGradient id="bodyGradient3d" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#90caf9" stopOpacity="0.9"/>
                      <stop offset="100%" stopColor="#5c9bd4" stopOpacity="0.85"/>
                    </linearGradient>
                    
                    {/* Shadow Filters */}
                    <filter id="shadow3d" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                      <feOffset dx="3" dy="5" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    <filter id="glow3d">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    {/* Lighting Effect */}
                    <radialGradient id="lighting3d" cx="30%" cy="20%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                    </radialGradient>
                  </defs>
                  
                  {/* Background with 3D depth */}
                  <rect width="500" height="400" fill="url(#bgGradient3d)" rx="16"/>
                  <rect width="500" height="400" fill="url(#lighting3d)" rx="16"/>
                  
                  {/* Desk/Table - 3D Perspective */}
                  {/* Desk Top */}
                  <rect x="50" y="280" width="400" height="20" rx="4" fill="url(#deskTop3d)" filter="url(#shadow3d)"/>
                  {/* Desk Front Edge - 3D depth */}
                  <polygon points="50,300 450,300 460,310 40,310" fill="url(#deskSide3d)"/>
                  {/* Desk Side */}
                  <rect x="50" y="300" width="400" height="80" rx="8" fill="url(#deskSide3d)" opacity="0.3"/>
                  
                  {/* Laptop Base - 3D with depth */}
                  <rect x="120" y="240" width="260" height="20" rx="4" fill="url(#laptopBase3d)" filter="url(#shadow3d)"/>
                  {/* Laptop Base Front Edge */}
                  <polygon points="120,240 380,240 385,245 115,245" fill="rgba(20,20,20,0.8)"/>
                  {/* Keyboard Area */}
                  <rect x="130" y="250" width="240" height="8" rx="2" fill="rgba(0,0,0,0.7)"/>
                  {/* Keyboard Keys 3D */}
                  <rect x="140" y="252" width="15" height="4" rx="1" fill="rgba(60,60,60,0.8)"/>
                  <rect x="160" y="252" width="15" height="4" rx="1" fill="rgba(60,60,60,0.8)"/>
                  <rect x="180" y="252" width="15" height="4" rx="1" fill="rgba(60,60,60,0.8)"/>
                  <rect x="200" y="252" width="15" height="4" rx="1" fill="rgba(60,60,60,0.8)"/>
                  
                  {/* Laptop Screen - 3D Tilted View */}
                  {/* Screen Back/Frame */}
                  <polygon points="120,100 380,100 385,105 115,105" fill="url(#screenFrame3d)" opacity="0.9"/>
                  {/* Screen Main */}
                  <rect x="120" y="100" width="260" height="140" rx="6" fill="url(#screenFrame3d)" filter="url(#shadow3d)"/>
                  {/* Screen Inner Glow */}
                  <rect x="130" y="110" width="240" height="120" rx="4" fill="url(#screenGradient3d)"/>
                  {/* Screen Reflection */}
                  <rect x="130" y="110" width="240" height="40" rx="4" fill="rgba(255,255,255,0.1)"/>
                  
                  {/* Exam Interface on Screen - 3D */}
                  <rect x="140" y="120" width="220" height="20" rx="3" fill="rgba(0,229,255,0.8)" filter="url(#glow3d)"/>
                  <text x="250" y="135" fontSize="12" fill="rgba(255,255,255,0.95)" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">Online Exam - Question 5 of 20</text>
                  
                  {/* Questions with 3D depth */}
                  <rect x="150" y="150" width="200" height="12" rx="2" fill="rgba(255,255,255,0.6)" filter="url(#shadow3d)"/>
                  <rect x="150" y="170" width="180" height="12" rx="2" fill="rgba(255,255,255,0.5)" filter="url(#shadow3d)"/>
                  <rect x="150" y="190" width="190" height="12" rx="2" fill="rgba(255,255,255,0.5)" filter="url(#shadow3d)"/>
                  <rect x="150" y="210" width="170" height="12" rx="2" fill="rgba(255,255,255,0.5)" filter="url(#shadow3d)"/>
                  
                  {/* Timer/Clock - 3D */}
                  <circle cx="350" cy="130" r="18" fill="rgba(255,87,34,0.4)" stroke="rgba(255,87,34,0.8)" strokeWidth="2" filter="url(#glow3d)"/>
                  <circle cx="350" cy="130" r="15" fill="rgba(255,87,34,0.2)"/>
                  <text x="350" y="137" fontSize="10" fill="rgba(255,255,255,0.95)" textAnchor="middle" fontFamily="Arial" fontWeight="bold">45</text>
                  
                  {/* Person/Student - Head 3D */}
                  <circle cx="250" cy="80" r="25" fill="url(#headGradient3d)" filter="url(#shadow3d)"/>
                  {/* Head highlight */}
                  <ellipse cx="245" cy="75" rx="8" ry="10" fill="rgba(255,255,255,0.3)"/>
                  {/* Eyes */}
                  <circle cx="245" cy="78" r="3" fill="rgba(0,0,0,0.8)"/>
                  <circle cx="255" cy="78" r="3" fill="rgba(0,0,0,0.8)"/>
                  {/* Eye highlights */}
                  <circle cx="246" cy="77" r="1" fill="rgba(255,255,255,0.9)"/>
                  <circle cx="256" cy="77" r="1" fill="rgba(255,255,255,0.9)"/>
                  {/* Smile */}
                  <path d="M245 85 Q250 88 255 85" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  
                  {/* Person - Body 3D */}
                  <rect x="230" y="105" width="40" height="50" rx="8" fill="url(#bodyGradient3d)" filter="url(#shadow3d)"/>
                  {/* Body highlight */}
                  <rect x="232" y="107" width="36" height="20" rx="6" fill="rgba(255,255,255,0.2)"/>
                  
                  {/* Person - Arms 3D */}
                  <ellipse cx="220" cy="125" rx="8" ry="25" fill="url(#headGradient3d)" transform="rotate(-20 220 125)" filter="url(#shadow3d)"/>
                  <ellipse cx="280" cy="125" rx="8" ry="25" fill="url(#headGradient3d)" transform="rotate(20 280 125)" filter="url(#shadow3d)"/>
                  
                  {/* Webcam on Laptop - 3D */}
                  <circle cx="250" cy="100" r="6" fill="rgba(0,229,255,0.8)" filter="url(#glow3d)"/>
                  <circle cx="250" cy="100" r="4" fill="rgba(0,229,255,0.6)"/>
                  <circle cx="250" cy="100" r="3" fill="rgba(255,255,255,0.95)"/>
                  <circle cx="251" cy="99" r="1" fill="rgba(0,0,0,0.3)"/>
                  
                  {/* Proctoring Camera Indicator (Top Right) - 3D */}
                  <circle cx="420" cy="60" r="12" fill="rgba(0,229,255,0.7)" stroke="rgba(0,229,255,1)" strokeWidth="2" filter="url(#glow3d)">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="420" cy="60" r="8" fill="rgba(0,229,255,0.5)"/>
                  <circle cx="420" cy="60" r="6" fill="rgba(255,255,255,0.95)"/>
                  <circle cx="421" cy="59" r="2" fill="rgba(0,0,0,0.3)"/>
                  <text x="420" y="85" fontSize="9" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontFamily="Arial" fontWeight="bold">Camera</text>
                  
                  {/* AI Monitoring Indicators - 3D */}
                  <circle cx="80" cy="60" r="8" fill="rgba(76,175,80,0.9)" filter="url(#glow3d)">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="80" cy="60" r="5" fill="rgba(76,175,80,0.6)"/>
                  <circle cx="100" cy="60" r="8" fill="rgba(76,175,80,0.9)" filter="url(#glow3d)">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="100" cy="60" r="5" fill="rgba(76,175,80,0.6)"/>
                  <circle cx="120" cy="60" r="8" fill="rgba(76,175,80,0.9)" filter="url(#glow3d)">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="120" cy="60" r="5" fill="rgba(76,175,80,0.6)"/>
                  <text x="100" y="85" fontSize="9" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontFamily="Arial" fontWeight="bold">AI Active</text>
                  
                  {/* Face Detection Overlay - 3D */}
                  <ellipse cx="250" cy="80" rx="35" ry="40" fill="none" stroke="rgba(0,229,255,0.6)" strokeWidth="2.5" strokeDasharray="5 5" filter="url(#glow3d)">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite"/>
                  </ellipse>
                  
                  {/* Security Shield Badge - 3D */}
                  <path d="M250 30 L270 40 L270 55 Q270 60 250 65 Q230 60 230 55 L230 40 Z" fill="rgba(0,229,255,0.8)" stroke="rgba(0,229,255,1)" strokeWidth="2.5" filter="url(#glow3d)"/>
                  <path d="M245 48 L250 52 L255 48" stroke="rgba(255,255,255,0.95)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  {/* Shield highlight */}
                  <path d="M250 35 L265 42 L265 50 Q265 52 250 55" fill="rgba(255,255,255,0.3)"/>
                  
                  {/* Status Bar at Bottom - 3D */}
                  <rect x="120" y="320" width="260" height="35" rx="6" fill="rgba(0,0,0,0.5)" stroke="rgba(0,229,255,0.6)" strokeWidth="1.5" filter="url(#shadow3d)"/>
                  <rect x="135" y="328" width="80" height="8" rx="2" fill="rgba(0,229,255,0.8)" filter="url(#glow3d)"/>
                  <text x="175" y="336" fontSize="8" fill="rgba(255,255,255,0.95)" textAnchor="middle" fontFamily="Arial" fontWeight="bold">Proctoring Active</text>
                  <circle cx="320" cy="340" r="5" fill="rgba(76,175,80,1)" filter="url(#glow3d)">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                  <text x="335" y="344" fontSize="8" fill="rgba(255,255,255,0.9)" fontFamily="Arial" fontWeight="bold">Monitoring</text>
                  
                  {/* Tab Switching Detection Indicator - 3D */}
                  <rect x="360" y="200" width="30" height="20" rx="3" fill="rgba(255,87,34,0.4)" stroke="rgba(255,87,34,0.9)" strokeWidth="2" filter="url(#glow3d)"/>
                  <rect x="362" y="202" width="26" height="16" rx="2" fill="rgba(255,87,34,0.2)"/>
                  <text x="375" y="213" fontSize="8" fill="rgba(255,255,255,0.95)" textAnchor="middle" fontFamily="Arial" fontWeight="bold">Tab</text>
                  <text x="375" y="222" fontSize="7" fill="rgba(255,255,255,0.8)" textAnchor="middle" fontFamily="Arial">Monitor</text>
                </Box>
              </MotionBox>
            </MotionGrid>
          </Grid>
          
          {/* Quick Actions section below hero */}
          <MotionBox
            sx={{ 
              mt: { xs: 6, md: 10 },
            }}
            variants={fadeIn}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <MotionBox
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    component={action.link.startsWith('#') ? 'a' : Link}
                    to={action.link.startsWith('#') ? undefined : action.link}
                    href={action.link.startsWith('#') ? action.link : undefined}
                    sx={{
                      display: 'block',
                      textDecoration: 'none',
                      height: '100%'
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.15)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.12)',
                          borderColor: 'rgba(0,229,255,0.4)',
                          boxShadow: '0 8px 24px rgba(0,229,255,0.2)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        mb: 2, 
                        color: action.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {action.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        fontWeight="600" 
                        sx={{ 
                          mb: 1,
                          color: 'white',
                          textAlign: 'center'
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          opacity: 0.85,
                          color: 'white',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          lineHeight: 1.5
                        }}
                      >
                        {action.description}
                      </Typography>
                    </Box>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </MotionBox>
        </MotionContainer>
      </Box>
      
      {/* Key Features Section with Animation */}
      <Box
        id="features"
        sx={{
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(245,247,250,0) 0%, rgba(245,247,250,1) 100%)'
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: -100, md: -150 },
            left: { xs: -100, md: -150 },
            width: { xs: 200, md: 300 },
            height: { xs: 200, md: 300 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(159, 122, 234, 0.15), rgba(159, 122, 234, 0))',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: -100, md: -150 },
            right: { xs: -100, md: -150 },
            width: { xs: 200, md: 300 },
            height: { xs: 200, md: 300 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.15), rgba(79, 209, 197, 0))',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 300, md: 600 },
            height: { xs: 300, md: 600 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(246, 173, 85, 0.03) 0%, rgba(246, 173, 85, 0) 70%)',
            zIndex: 0
          }}
        />

        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1, mb: { xs: 5, md: 8 } }}>
            
            <MotionTypography
              variant="h2"
              component="h2"
              fontWeight="bold"
              align="center"
              gutterBottom
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              INTELLIGENT FEATURES
            </MotionTypography>
            <MotionTypography
              variant="h6"
              component="div"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 700, mx: 'auto', mb: 2, lineHeight: 1.7 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Our platform combines advanced AI technologies to deliver comprehensive video intelligence, 
              monitoring, and analytics that transform how you understand and work with video content.
            </MotionTypography>
            <MotionBox
              initial={{ width: 0 }}
              whileInView={{ width: '80px' }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              sx={{ 
                height: '4px', 
                background: 'linear-gradient(90deg, #6B46C1, #4FD1C5)',
                borderRadius: '2px',
                mx: 'auto',
                mb: 4
              }}
            />
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <MotionCard 
                  initial="initial"
                  whileHover="hover"
                  custom={feature}
                  variants={featureHighlight}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    border: '1px solid rgba(0,0,0,0.06)',
                    bgcolor: '#fff',
                    position: 'relative',
                    "&::before": {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background: feature.color,
                      zIndex: 1
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 4, 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Logo/Icon container with enhanced styling */}
                    <MotionBox 
                      variants={featureIconAnimation}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      sx={{ 
                        width: '80px',
                        height: '80px',
                        borderRadius: '16px',
                        background: feature.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        boxShadow: `0 10px 20px ${feature.shadowColor}`,
                        position: 'relative',
                        overflow: 'hidden',
                        "&::before": {
                          content: '""',
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)'
                        },
                        "&::after": {
                          content: '""',
                          position: 'absolute',
                          bottom: '-15px',
                          left: '-15px',
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.05)'
                        }
                      }}
                    >
                      <MotionBox 
                        animate={{ 
                          rotateY: [0, 10, 0, -10, 0],
                          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        sx={{ 
                          color: 'white',
                          position: 'relative',
                          zIndex: 2,
                          transform: 'scale(1.3)'
                        }}
                      >
                        {feature.icon}
                      </MotionBox>
                    </MotionBox>
                    
                    <MotionTypography 
                      variants={featureCardAnimation}
                      custom={index}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variant="h5" 
                      component="h3" 
                      align="center"
                      gutterBottom 
                      fontWeight="600"
                      sx={{ mb: 2 }}
                    >
                      {feature.title}
                    </MotionTypography>
                    
                    <MotionBox
                      initial={{ width: 0 }}
                      whileInView={{ width: '40px', transition: { delay: 0.3, duration: 0.5 } }}
                      viewport={{ once: true }}
                      sx={{ 
                        height: '3px', 
                        background: feature.color,
                        borderRadius: '2px',
                        mb: 2
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ px: 4, pb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <MotionTypography 
                      variants={featureCardAnimation}
                      custom={index + 0.2}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ mb: 'auto', lineHeight: 1.7 }}
                    >
                      {feature.description}
                    </MotionTypography>
                  </Box>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </div>
  );
}

export default Home;