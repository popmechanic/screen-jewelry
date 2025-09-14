'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface MetadataFormProps {
  frameData: string;
  timestamp: number;
  videoFileName: string;
  duration: number;
  onSave: (metadata: CaptureMetadata) => void;
  onCancel: () => void;
}

export interface CaptureMetadata {
  movieName: string;
  imdbLink: string;
  timestamp: string;
  notes?: string;
  tags?: string[];
  videoFileName: string;
  published: boolean;
}

export default function MetadataForm({
  frameData,
  timestamp,
  videoFileName,
  onSave,
  onCancel
}: MetadataFormProps) {
  const [movieName, setMovieName] = useState('');
  const [imdbLink, setImdbLink] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    // Auto-suggest movie name from video filename
    const suggestedName = videoFileName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[._-]/g, ' ') // Replace separators with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    setMovieName(suggestedName);
  }, [videoFileName]);

  const formatTimestamp = (seconds: number): string => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!movieName.trim() || !imdbLink.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate IMDB link
    if (!imdbLink.match(/^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/)) {
      alert('Please enter a valid IMDB link (e.g., https://www.imdb.com/title/tt0111161/)');
      return;
    }

    const metadata: CaptureMetadata = {
      movieName: movieName.trim(),
      imdbLink: imdbLink.trim(),
      timestamp: formatTimestamp(timestamp),
      notes: notes.trim() || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
      videoFileName,
      published
    };

    onSave(metadata);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Capture Metadata</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              <h3 className="font-medium mb-2">Frame Preview</h3>
              <img
                src={frameData}
                alt="Captured frame"
                className="w-full rounded-lg shadow-lg"
              />
              <div className="mt-2 text-sm text-gray-600">
                <p>Timestamp: {formatTimestamp(timestamp)}</p>
                <p>Source: {videoFileName}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Movie Name *
                </label>
                <input
                  type="text"
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMDB Link *
                </label>
                <input
                  type="url"
                  value={imdbLink}
                  onChange={(e) => setImdbLink(e.target.value)}
                  placeholder="https://www.imdb.com/title/tt..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this capture..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="cinematography, close-up, landscape (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Capture</span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}