'use client';

import React, { useState } from 'react';
import { id, lookup } from '@instantdb/react';
import db from '@/lib/db';
import VideoPlayer from '@/components/VideoPlayer';
import MetadataForm, { CaptureMetadata } from '@/components/MetadataForm';
import { Login } from '@/components/Auth';
import Navigation from '@/components/Navigation';

interface CaptureSession {
  frameData: string;
  timestamp: number;
  videoInfo: {
    fileName: string;
    duration: number;
    width: number;
    height: number;
    frameRate: number;
  };
}

function EditorContent() {
  const [captureSession, setCaptureSession] = useState<CaptureSession | null>(null);
  const [lastCapture, setLastCapture] = useState<{ movieName: string; timestamp: string } | null>(null);
  const user = db.useUser();

  const handleCapture = (frameData: string, timestamp: number, videoInfo: {
    fileName: string;
    duration: number;
    width: number;
    height: number;
    frameRate: number;
  }) => {
    setCaptureSession({
      frameData,
      timestamp,
      videoInfo
    });
  };

  const handleSaveCapture = async (metadata: CaptureMetadata) => {
    if (!captureSession || !user) return;

    try {
      // First, check if video record exists, if not create it
      const { data: existingVideo } = await db.queryOnce({
        videos: {
          $: {
            where: { fileName: captureSession.videoInfo.fileName }
          }
        }
      });

      let videoId: string;

      if (existingVideo?.videos && existingVideo.videos.length > 0) {
        // Use existing video record
        videoId = existingVideo.videos[0].id;
      } else {
        // Create new video record
        videoId = id();
        await db.transact([
          db.tx.videos[videoId].update({
            fileName: captureSession.videoInfo.fileName,
            uploadedAt: Date.now(),
            duration: captureSession.videoInfo.duration,
            width: captureSession.videoInfo.width,
            height: captureSession.videoInfo.height,
            frameRate: captureSession.videoInfo.frameRate,
          })
        ]);
      }

      // Convert base64 to blob for upload
      const base64Data = captureSession.frameData.split(',')[1];
      const blob = await fetch(`data:image/png;base64,${base64Data}`).then(r => r.blob());

      // Upload frame to storage
      const filePath = `${user.id}/captures/${Date.now()}.png`;
      const { data: fileData } = await db.storage.uploadFile(filePath, blob);

      // Create capture record
      const captureId = id();
      await db.transact([
        db.tx.captures[captureId]
          .update({
            movieName: metadata.movieName,
            imdbLink: metadata.imdbLink,
            timestamp: metadata.timestamp,
            frameUrl: captureSession.frameData, // Store base64 for now
            notes: metadata.notes || '',
            tags: metadata.tags || [],
            capturedAt: Date.now(),
            published: metadata.published,
            videoFileName: metadata.videoFileName,
          })
          .link({
            editor: user.id,
            video: videoId,
            frameFile: fileData.id
          })
      ]);

      // Clear capture session but keep video loaded
      setCaptureSession(null);
      setLastCapture({ movieName: metadata.movieName, timestamp: metadata.timestamp });

      // Show success message briefly
      setTimeout(() => setLastCapture(null), 5000);
    } catch (error) {
      console.error('Error saving capture:', error);
      alert('Failed to save capture. Please try again.');
    }
  };

  const handleCancelCapture = () => {
    setCaptureSession(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Screen Jewelry Editor</h1>
            <div className="flex items-center space-x-4">
              <Navigation />
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success notification */}
        {lastCapture && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✓ Successfully captured frame from <strong>{lastCapture.movieName}</strong> at {lastCapture.timestamp}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <VideoPlayer onCapture={handleCapture} />
        </div>
      </main>

      {captureSession && (
        <MetadataForm
          frameData={captureSession.frameData}
          timestamp={captureSession.timestamp}
          videoFileName={captureSession.videoInfo.fileName}
          duration={captureSession.videoInfo.duration}
          onSave={handleSaveCapture}
          onCancel={handleCancelCapture}
        />
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <>
      <db.SignedOut>
        <Login />
      </db.SignedOut>
      <db.SignedIn>
        <EditorContent />
      </db.SignedIn>
    </>
  );
}