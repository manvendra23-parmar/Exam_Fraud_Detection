import React, { useState, useEffect } from 'react';
import './VideoAnalyticsViz.css';

/**
 * Component to visualize speech transcription results from Video Intelligence API
 */
const SpeechTranscriptionViz = ({ jsonData, videoInfo, onWordClicked }) => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [filteredTranscriptions, setFilteredTranscriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Extract speech transcriptions from the jsonData
    if (jsonData && jsonData.annotation_results) {
      const allTranscriptions = [];
      
      jsonData.annotation_results.forEach(result => {
        if (result.speech_transcriptions) {
          result.speech_transcriptions.forEach(transcription => {
            if (transcription.alternatives && transcription.alternatives.length > 0) {
              // Use the first alternative as it's typically the most likely
              const alternative = transcription.alternatives[0];
              
              // Process each word in the transcription
              if (alternative.words && alternative.words.length > 0) {
                alternative.words.forEach(word => {
                  allTranscriptions.push({
                    word: word.word || '',
                    confidence: alternative.confidence || 0,
                    startTime: word.start_time,
                    endTime: word.end_time,
                    speakerTag: word.speaker_tag || 0
                  });
                });
              } else if (alternative.transcript) {
                // If no word-level timing is available, use the whole transcript
                allTranscriptions.push({
                  word: alternative.transcript,
                  confidence: alternative.confidence || 0,
                  startTime: transcription.segment ? transcription.segment.start_time_offset : null,
                  endTime: transcription.segment ? transcription.segment.end_time_offset : null,
                  speakerTag: 0
                });
              }
            }
          });
        }
      });
      
      // Sort by start time
      allTranscriptions.sort((a, b) => {
        const timeA = timeOffsetToSeconds(a.startTime);
        const timeB = timeOffsetToSeconds(b.startTime);
        return timeA - timeB;
      });
      
      // Group words into sentences for better readability
      const sentences = groupWordsIntoSentences(allTranscriptions);
      
      setTranscriptions(sentences);
      setFilteredTranscriptions(sentences);
    }
    
    setIsLoading(false);
  }, [jsonData]);

  // Group words into sentences for better readability
  const groupWordsIntoSentences = (words) => {
    if (!words || words.length === 0) return [];
    
    const sentences = [];
    let currentSentence = {
      text: '',
      words: [],
      startTime: words[0].startTime,
      endTime: null,
      confidence: 0,
      speakerTag: words[0].speakerTag
    };
    
    words.forEach((word, index) => {
      // If this is a new speaker or there's a significant pause (>1s), start a new sentence
      const isNewSpeaker = word.speakerTag !== currentSentence.speakerTag;
      const previousEndTime = index > 0 ? timeOffsetToSeconds(words[index - 1].endTime) : 0;
      const currentStartTime = timeOffsetToSeconds(word.startTime);
      const isPause = (currentStartTime - previousEndTime) > 1;
      
      if (isNewSpeaker || isPause || currentSentence.text.length > 150) {
        // Finish current sentence
        if (currentSentence.words.length > 0) {
          currentSentence.endTime = words[index - 1].endTime;
          // Calculate average confidence
          currentSentence.confidence = currentSentence.words.reduce((sum, w) => sum + w.confidence, 0) / currentSentence.words.length;
          sentences.push(currentSentence);
        }
        
        // Start new sentence
        currentSentence = {
          text: word.word + ' ',
          words: [word],
          startTime: word.startTime,
          endTime: null,
          confidence: 0,
          speakerTag: word.speakerTag
        };
      } else {
        // Continue current sentence
        currentSentence.text += word.word + ' ';
        currentSentence.words.push(word);
      }
      
      // Handle the last word
      if (index === words.length - 1) {
        currentSentence.endTime = word.endTime;
        currentSentence.confidence = currentSentence.words.reduce((sum, w) => sum + w.confidence, 0) / currentSentence.words.length;
        sentences.push(currentSentence);
      }
    });
    
    return sentences;
  };

  // Filter transcriptions when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTranscriptions(transcriptions);
    } else {
      const filtered = transcriptions.filter(sentence => 
        sentence.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTranscriptions(filtered);
    }
  }, [searchQuery, transcriptions]);

  // Helper function to convert time_offset to seconds
  const timeOffsetToSeconds = (timeOffset) => {
    if (!timeOffset) return 0;
    
    const seconds = timeOffset.seconds || 0;
    const nanos = timeOffset.nanos ? timeOffset.nanos / 1e9 : 0;
    return seconds + nanos;
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Jump to the time when a word is clicked
  const handleWordClick = (timeOffset) => {
    onWordClicked({ seconds: timeOffsetToSeconds(timeOffset) });
  };

  // Calculate confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50'; // Green for high confidence
    if (confidence >= 0.5) return '#FFC107'; // Yellow for medium confidence
    return '#F44336'; // Red for low confidence
  };

  // Render confidence badge
  const renderConfidenceBadge = (confidence) => {
    return (
      <div 
        className="confidence-badge" 
        style={{ backgroundColor: getConfidenceColor(confidence) }}
      >
        {Math.round(confidence * 100)}%
      </div>
    );
  };

  // Get speaker color for differentiation
  const getSpeakerColor = (speakerTag) => {
    const colors = ['#4285F4', '#EA4335', '#34A853', '#FBBC05', '#8F44AD', '#1ABC9C', '#3498DB', '#E74C3C'];
    return colors[(speakerTag || 0) % colors.length];
  };

  if (isLoading) {
    return <div className="loading">Loading speech transcriptions...</div>;
  }

  if (transcriptions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <span className="material-icons">record_voice_over</span>
        </div>
        <h3>No Speech Transcription</h3>
        <p>No speech was transcribed in this video or speech transcription was not included in the analysis.</p>
      </div>
    );
  }

  return (
    <div className="speech-transcription-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search transcribed speech..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <span className="material-icons search-icon">search</span>
        {searchQuery && (
          <span 
            className="material-icons clear-icon" 
            onClick={() => setSearchQuery('')}
          >
            clear
          </span>
        )}
      </div>
      
      <div className="transcript-count">
        {filteredTranscriptions.length} transcript {filteredTranscriptions.length === 1 ? 'segment' : 'segments'}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
      
      <div className="transcript-list">
        {filteredTranscriptions.map((sentence, index) => {
          const startTime = timeOffsetToSeconds(sentence.startTime);
          const endTime = timeOffsetToSeconds(sentence.endTime);
          const duration = endTime - startTime;
          
          return (
            <div 
              key={`sentence-${index}`}
              className="transcript-item"
              onClick={() => handleWordClick(sentence.startTime)}
            >
              <div className="transcript-header">
                <div className="transcript-time">
                  <span className="time-start">{formatTime(startTime)}</span>
                  <span className="time-separator">→</span>
                  <span className="time-end">{formatTime(endTime)}</span>
                  <span className="time-duration">({duration.toFixed(1)}s)</span>
                </div>
                {renderConfidenceBadge(sentence.confidence)}
              </div>
              
              {sentence.speakerTag > 0 && (
                <div 
                  className="speaker-tag"
                  style={{ backgroundColor: getSpeakerColor(sentence.speakerTag) }}
                >
                  Speaker {sentence.speakerTag}
                </div>
              )}
              
              <div className="transcript-text">
                {sentence.text}
              </div>
            </div>
          );
        })}
      </div>
      
      {transcriptions.length > 0 && filteredTranscriptions.length === 0 && (
        <div className="no-results">
          <span className="material-icons">search_off</span>
          <p>No transcript matches your search query.</p>
        </div>
      )}
    </div>
  );
};

export default SpeechTranscriptionViz; 