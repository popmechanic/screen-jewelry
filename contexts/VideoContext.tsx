'use client';

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface VideoInfo {
  fileName: string;
  duration: number;
  width: number;
  height: number;
  frameRate: number;
}

interface VideoContextType {
  videoUrl: string | null;
  videoInfo: VideoInfo | null;
  currentTime: number;
  duration: number;
  setVideoUrl: (url: string | null) => void;
  setVideoInfo: (info: VideoInfo) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  clearVideo: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setVideoInfo(null);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <VideoContext.Provider
      value={{
        videoUrl,
        videoInfo,
        currentTime,
        duration,
        setVideoUrl,
        setVideoInfo,
        setCurrentTime,
        setDuration,
        clearVideo,
        fileInputRef: fileInputRef as React.RefObject<HTMLInputElement>
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}