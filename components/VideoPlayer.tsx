'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useVideo } from '@/contexts/VideoContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Camera,
  FastForward,
  Rewind,
  X,
  Film
} from 'lucide-react';

interface VideoPlayerProps {
  onCapture: (frameData: string, timestamp: number, videoInfo: VideoInfo) => void;
}

interface VideoInfo {
  fileName: string;
  duration: number;
  width: number;
  height: number;
  frameRate: number;
}

export default function VideoPlayer({ onCapture }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    videoUrl,
    videoInfo,
    currentTime,
    duration,
    setVideoUrl,
    setVideoInfo,
    setCurrentTime,
    setDuration,
    clearVideo,
    fileInputRef
  } = useVideo();

  const [isPlaying, setIsPlaying] = useState(false);

  // Frame rate for frame-by-frame navigation (assuming 24fps as default)
  const frameRate = videoInfo?.frameRate || 24;
  const frameDuration = 1 / frameRate;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(3, '0')}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      setVideoInfo({
        fileName: file.name,
        duration: 0,
        width: 0,
        height: 0,
        frameRate: 24, // Default, will be updated if possible
      });
    }
  };

  const handleEject = () => {
    clearVideo();
    setIsPlaying(false);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoInfo) {
      const video = videoRef.current;
      setDuration(video.duration);
      setVideoInfo({
        ...videoInfo,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const stepForward = () => {
    seek(currentTime + frameDuration);
  };

  const stepBackward = () => {
    seek(currentTime - frameDuration);
  };

  const skipForward = () => {
    seek(currentTime + 10);
  };

  const skipBackward = () => {
    seek(currentTime - 10);
  };

  const fastForward = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2;
    }
  };

  const rewind = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  };

  const resetPlaybackRate = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && videoInfo) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        const frameData = canvas.toDataURL('image/png');

        // Pause video and trigger capture callback
        video.pause();
        setIsPlaying(false);
        onCapture(frameData, currentTime, videoInfo);
      }
    }
  };

  // Restore video time when component mounts
  useEffect(() => {
    if (videoRef.current && videoUrl && currentTime > 0) {
      videoRef.current.currentTime = currentTime;
    }
  }, [videoUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            skipBackward();
          } else {
            stepBackward();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            skipForward();
          } else {
            stepForward();
          }
          break;
        case 'c':
        case 'C':
          if (!isPlaying) {
            captureFrame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {!videoUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Select Video File
          </button>
          <p className="mt-4 text-gray-600">
            Supported formats: MP4, MOV, MKV, WebM
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Video Display */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Timeline */}
          <div className="bg-gray-100 p-2 rounded">
            <input
              type="range"
              min="0"
              max={duration}
              step={0.001}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={skipBackward}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Skip backward 10s (Shift+Left)"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={rewind}
              onMouseUp={resetPlaybackRate}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Rewind (0.5x speed)"
            >
              <Rewind className="w-5 h-5" />
            </button>

            <button
              onClick={stepBackward}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Previous frame (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              title="Play/Pause (Space)"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={stepForward}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Next frame (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={fastForward}
              onMouseUp={resetPlaybackRate}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Fast forward (2x speed)"
            >
              <FastForward className="w-5 h-5" />
            </button>

            <button
              onClick={skipForward}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Skip forward 10s (Shift+Right)"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Capture Button */}
          {!isPlaying && (
            <div className="flex justify-center">
              <button
                onClick={captureFrame}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Camera className="w-5 h-5" />
                <span>Capture Frame (C)</span>
              </button>
            </div>
          )}

          {/* Video Info and Eject */}
          {videoInfo && (
            <div className="flex items-center justify-between px-4">
              <div className="text-sm text-gray-600">
                <p className="flex items-center space-x-2">
                  <Film className="w-4 h-4" />
                  <span>{videoInfo.fileName}</span>
                  <span className="text-gray-400">•</span>
                  <span>{videoInfo.width}x{videoInfo.height}</span>
                  <span className="text-gray-400">•</span>
                  <span>{frameRate}fps</span>
                </p>
              </div>
              <button
                onClick={handleEject}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Remove video and select a new one"
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Remove</span>
              </button>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Space: Play/Pause • Left/Right: Frame step • Shift+Left/Right: Skip 10s</p>
            <p>C: Capture frame (when paused)</p>
          </div>
        </div>
      )}
    </div>
  );
}