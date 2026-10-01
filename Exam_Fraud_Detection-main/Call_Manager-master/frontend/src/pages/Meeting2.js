import React, { useState, useEffect } from 'react';
import uuid from 'react-uuid';
import Header from '../components/Header'
import { useReactMediaRecorder } from "react-media-recorder";

function App() {
    const { status, startRecording, stopRecording, mediaBlobUrl } =
        useReactMediaRecorder({ screen: true, audio: true });

    const [downloadUrl, setDownloadUrl] = useState("");
    const [successMessage, setSuccessMessage] = useState('');

    const handleDownload = () => {
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = uuid() + '.webm';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        setSuccessMessage('Video download started!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    useEffect(() => {
        if (status === "stopped" && mediaBlobUrl) {
            setDownloadUrl(mediaBlobUrl);
        }
    }, [status, mediaBlobUrl]);

    const [recordingTime, setRecordingTime] = useState(0);
    
    useEffect(() => {
        let interval;
        if (status === 'recording') {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        
        return () => clearInterval(interval);
    }, [status]);
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header />
            <main className="container mx-auto py-8 px-4 max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        Screen Recorder
                    </h1>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">
                        Capture your screen and audio with professional quality recording
                    </p>
                </div>

                {/* Alert Messages */}
                {successMessage && (
                    <div className="mb-6 animate-fade-in">
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-lg shadow-md flex items-start gap-3">
                            <svg className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="font-medium">{successMessage}</p>
                        </div>
                    </div>
                )}
                
                {/* Main Recording Card */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                        {/* Status Indicator */}
                        <div className="text-center mb-8">
                            {status === 'recording' ? (
                                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 py-4 px-8 rounded-full shadow-lg">
                                    <div className="relative">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-red-600">Recording</span>
                                        <span className="text-2xl font-mono font-bold text-red-700 bg-white px-4 py-1 rounded-lg shadow-sm">
                                            {formatTime(recordingTime)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-slate-200 py-4 px-8 rounded-full">
                                    <span className="h-4 w-4 rounded-full bg-slate-400"></span>
                                    <span className="font-semibold text-lg text-slate-600">Ready to Record</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Control Buttons */}
                        <div className="flex justify-center mb-6">
                            {status === "recording" ? (
                                <button 
                                    className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-10 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95"
                                    onClick={stopRecording}
                                >
                                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                    </svg>
                                    <span className="relative z-10">Stop Recording</span>
                                </button>
                            ) : (
                                <button 
                                    className="group relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-4 px-10 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                                    onClick={startRecording}
                                >
                                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    <span className="relative z-10">Start Recording</span>
                                </button>
                            )}
                        </div>
                        
                        {/* Info Text */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-slate-500 text-sm bg-slate-50 px-4 py-2 rounded-full">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Your screen and audio will be captured</span>
                            </div>
                        </div>
                        
                        {/* Download Section */}
                        {downloadUrl && (
                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Recording Ready
                                        </h3>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Available</span>
                                    </div>
                                    <button 
                                        className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-98"
                                        onClick={handleDownload}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Download Recording
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Video Preview Section */}
                {mediaBlobUrl && (
                    <div className="mt-10 max-w-4xl mx-auto animate-fade-in">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Preview Recording</h2>
                            </div>
                            <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl border-4 border-white">
                                <video 
                                    src={mediaBlobUrl} 
                                    controls 
                                    className="absolute inset-0 w-full h-full object-contain" 
                                />
                            </div>
                            <p className="text-sm text-slate-500 mt-4 text-center flex items-center justify-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                You can download this recording using the button above
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Footer */}
                <footer className="mt-16 text-center">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Screen Recorder. All rights reserved.
                    </p>
                </footer>
            </main>
            
            {/* Add custom animations */}
            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

export default App;
