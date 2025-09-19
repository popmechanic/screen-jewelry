'use client';

import React, { useState } from 'react';
import db from '@/lib/db';
import { Trash2, Eye, EyeOff, Search, Film, Edit2, Upload, X } from 'lucide-react';
import { Login } from '@/components/Auth';
import Navigation from '@/components/Navigation';
import EditCaptureModal, { EditCaptureData } from '@/components/EditCaptureModal';


function DashboardContent() {
  const user = db.useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [editingCapture, setEditingCapture] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    movieName: '',
    timestamp: '',
    imdbLink: '',
    notes: '',
    tags: '',
    published: false,
    imageFile: null as File | null,
    imagePreview: ''
  });

  // Fetch all captures for the current user
  const { data, isLoading, error } = db.useQuery(user ? {
    captures: {
      $: {
        where: { 'editor.id': user.id },
        order: { capturedAt: 'desc' }
      },
      video: {},
      frameFile: {},
      editor: {}
    }
  } : {});

  const captures = data?.captures || [];

  // Get unique movie names for filtering
  const movieNames = Array.from(new Set(captures.map(c => c.movieName)));

  // Filter captures based on search and movie filter
  const filteredCaptures = captures.filter(capture => {
    const matchesSearch = searchTerm === '' ||
      capture.movieName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capture.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capture.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMovie = filterMovie === '' || capture.movieName === filterMovie;

    return matchesSearch && matchesMovie;
  });

  const handleTogglePublish = async (captureId: string, currentStatus: boolean) => {
    try {
      await db.transact([
        db.tx.captures[captureId].update({
          published: !currentStatus
        })
      ]);
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleDelete = async (captureId: string) => {
    if (!confirm('Are you sure you want to delete this capture?')) return;

    try {
      await db.transact([
        db.tx.captures[captureId].delete()
      ]);
    } catch (error) {
      console.error('Error deleting capture:', error);
    }
  };

  const handleEditSave = async (data: EditCaptureData) => {
    try {
      await db.transact([
        db.tx.captures[data.id].update({
          movieName: data.movieName,
          imdbLink: data.imdbLink,
          timestamp: data.timestamp,
          notes: data.notes,
          tags: data.tags,
          published: data.published
        })
      ]);
      setEditingCapture(null);
    } catch (error) {
      console.error('Error updating capture:', error);
      alert('Failed to update capture. Please try again.');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFormData(prev => ({
        ...prev,
        imageFile: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadFormData(prev => ({
          ...prev,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualUpload = async () => {
    if (!uploadFormData.imageFile) {
      alert('Please select an image');
      return;
    }

    if (!uploadFormData.movieName) {
      alert('Please enter a movie name');
      return;
    }

    try {
      // Sanitize filename to remove non-ASCII characters
      const sanitizedFilename = uploadFormData.imageFile.name
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9._-]/g, ''); // Keep only safe characters

      // Upload the image file
      const filePath = `captures/${Date.now()}_${sanitizedFilename || 'image.jpg'}`;
      const uploadResult = await db.storage.uploadFile(filePath, uploadFormData.imageFile);

      // Get the file URL
      const fileUrl = await db.storage.getDownloadUrl(filePath);

      // Create the capture
      const tagsArray = uploadFormData.tags
        ? uploadFormData.tags.split(',').map(t => t.trim()).filter(t => t)
        : [];

      const captureId = crypto.randomUUID();
      await db.transact([
        db.tx.captures[captureId].update({
          movieName: uploadFormData.movieName,
          timestamp: uploadFormData.timestamp || '00:00:00',
          imdbLink: uploadFormData.imdbLink || '',
          notes: uploadFormData.notes || '',
          tags: tagsArray,
          published: uploadFormData.published,
          capturedAt: Date.now(),
          frameUrl: fileUrl || ''
        })
          .link({ editor: user?.id })
          .link({ frameFile: uploadResult.data.id })
      ]);

      // Reset form and close modal
      setUploadFormData({
        movieName: '',
        timestamp: '',
        imdbLink: '',
        notes: '',
        tags: '',
        published: false,
        imageFile: null,
        imagePreview: ''
      });
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading capture:', error);
      alert('Failed to upload capture. Please try again.');
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Error loading captures: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Capture Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
              <Navigation />
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search captures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterMovie}
              onChange={(e) => setFilterMovie(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Movies</option>
              {movieNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <Film className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{captures.length}</p>
                <p className="text-sm text-gray-600">Total Captures</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {captures.filter(c => c.published).length}
                </p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <EyeOff className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">
                  {captures.filter(c => !c.published).length}
                </p>
                <p className="text-sm text-gray-600">Unpublished</p>
              </div>
            </div>
          </div>
        </div>

        {/* Captures Grid */}
        {filteredCaptures.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No captures found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaptures.map((capture) => (
              <div key={capture.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {capture.frameFile?.url ? (
                    <img
                      src={capture.frameFile.url}
                      alt={capture.movieName}
                      className="w-full h-full object-cover"
                    />
                  ) : capture.frameUrl ? (
                    <img
                      src={capture.frameUrl}
                      alt={capture.movieName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No preview
                    </div>
                  )}
                  {capture.published && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                      Published
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{capture.movieName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{capture.timestamp}</p>
                  {capture.notes && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{capture.notes}</p>
                  )}
                  {capture.tags && capture.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(capture.tags as string[]).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 pt-3 border-t">
                    <button
                      onClick={() => handleTogglePublish(capture.id, capture.published)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                      {capture.published ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Unpublish</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Publish</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setEditingCapture(capture)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(capture.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingCapture && (
        <EditCaptureModal
          capture={{
            id: editingCapture.id,
            movieName: editingCapture.movieName || '',
            imdbLink: editingCapture.imdbLink || '',
            timestamp: editingCapture.timestamp || '',
            notes: editingCapture.notes || '',
            tags: editingCapture.tags || [],
            published: editingCapture.published || false
          }}
          frameUrl={editingCapture.frameFile?.url || editingCapture.frameUrl}
          onSave={handleEditSave}
          onClose={() => setEditingCapture(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Upload New Capture</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFormData({
                      movieName: '',
                      timestamp: '',
                      imdbLink: '',
                      notes: '',
                      tags: '',
                      published: false,
                      imageFile: null,
                      imagePreview: ''
                    });
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Upload Area */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {uploadFormData.imagePreview ? (
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={uploadFormData.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => setUploadFormData(prev => ({
                          ...prev,
                          imageFile: null,
                          imagePreview: ''
                        }))}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="movieName" className="block text-sm font-medium text-gray-700 mb-1">
                    Movie Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="movieName"
                    value={uploadFormData.movieName}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, movieName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
                    Timestamp
                  </label>
                  <input
                    type="text"
                    id="timestamp"
                    value={uploadFormData.timestamp}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, timestamp: e.target.value }))}
                    placeholder="00:00:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="imdbLink" className="block text-sm font-medium text-gray-700 mb-1">
                    IMDB Link
                  </label>
                  <input
                    type="url"
                    id="imdbLink"
                    value={uploadFormData.imdbLink}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, imdbLink: e.target.value }))}
                    placeholder="https://www.imdb.com/title/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={uploadFormData.notes}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={uploadFormData.tags}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Comma separated tags"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={uploadFormData.published}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Publish immediately
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFormData({
                      movieName: '',
                      timestamp: '',
                      imdbLink: '',
                      notes: '',
                      tags: '',
                      published: false,
                      imageFile: null,
                      imagePreview: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualUpload}
                  disabled={!uploadFormData.imageFile || !uploadFormData.movieName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Upload Capture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <db.SignedOut>
        <Login />
      </db.SignedOut>
      <db.SignedIn>
        <DashboardContent />
      </db.SignedIn>
    </>
  );
}