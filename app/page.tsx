'use client';

import React, { useEffect, useState, useRef } from 'react';
import db from '@/lib/db';
import { ChevronUp, ChevronDown, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';


function GalleryContent({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('contain');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const user = isAuthenticated ? db.useUser() : null;

  // Fetch only published captures
  const { data, isLoading, error } = db.useQuery({
    captures: {
      $: {
        where: { published: true },
        order: { capturedAt: 'desc' }
      },
      frameFile: {}
    }
  });

  const captures = data?.captures || [];

  // Ensure we start at the top on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          navigatePrevious();
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          navigateNext();
          break;
        case 'i':
        case 'I':
          setShowInfo(!showInfo);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, captures.length, showInfo]);

  const navigateNext = () => {
    if (currentIndex < captures.length - 1 && scrollContainerRef.current) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      scrollContainerRef.current.scrollTo({
        top: newIndex * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  const navigatePrevious = () => {
    if (currentIndex > 0 && scrollContainerRef.current) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      scrollContainerRef.current.scrollTo({
        top: newIndex * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <p className="text-red-500">Error loading gallery</p>
      </div>
    );
  }

  if (captures.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Screen Jewelry</h1>
        <p className="text-gray-400 mb-8">No captures published yet</p>
        <Link
          href="/editor"
          className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition"
        >
          Go to Editor
        </Link>
      </div>
    );
  }


  return (
    <div className="relative bg-black">
      {/* Main scrollable container */}
      <div
        ref={scrollContainerRef}
        className="h-screen overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        onScroll={(e) => {
          const container = e.currentTarget;
          const scrollPosition = container.scrollTop;

          // Calculate which image is in view
          const newIndex = Math.round(scrollPosition / window.innerHeight);
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < captures.length) {
            setCurrentIndex(newIndex);
          }
        }}
      >

          {/* Gallery images - all full screen with snap points */}
          {captures.map((capture, index) => (
            <div
              key={capture.id}
              className="h-screen snap-start relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
            {/* Frame Image - Fullscreen with interlace effect */}
            {capture.frameFile?.url || capture.frameUrl ? (
              <div className="absolute inset-0 bg-black">
                <img
                  src={capture.frameFile?.url || capture.frameUrl}
                  alt={capture.movieName}
                  className={`w-full h-full ${fitMode === 'cover' ? 'object-cover' : 'object-contain'}`}
                />
                {/* Interlace effect overlay - only on the image */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    zIndex: 20,
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 4px)',
                    mixBlendMode: 'multiply',
                    animation: 'roll 1s linear infinite'
                  }}
                ></div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                No image available
              </div>
            )}

            {/* Hover Metadata Overlay */}
            <div
              className={`absolute top-0 left-0 w-1/3 h-1/3 p-8 transition-opacity duration-300 z-10 ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                background: 'linear-gradient(to bottom right, rgba(0,0,0,0.9), rgba(0,0,0,0.7), transparent)',
              }}
            >
              <div className="h-full flex flex-col justify-start text-white">
                <h1
                  className="text-5xl lg:text-7xl mb-4 leading-tight"
                  style={{ fontFamily: 'Flagfies, sans-serif' }}
                >
                  {capture.movieName}
                </h1>
                <div className="space-y-2">
                  <p className="text-xl lg:text-2xl opacity-90" style={{ fontFamily: 'Flagfies, sans-serif' }}>
                    {capture.timestamp}
                  </p>
                  {capture.imdbLink && (
                    <a
                      href={capture.imdbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-lg opacity-80 hover:opacity-100 transition"
                      style={{ fontFamily: 'Flagfies, sans-serif' }}
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>IMDB</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Overlay - Simplified */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-8 transition-transform duration-300 ${
                showInfo ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              <div className="max-w-4xl mx-auto text-white">
                {capture.notes && (
                  <p className="text-sm opacity-90 mb-3">{capture.notes}</p>
                )}
                {capture.tags && (capture.tags as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(capture.tags as string[]).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/20 backdrop-blur text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-20">
        <button
          onClick={navigatePrevious}
          disabled={currentIndex === 0}
          className={`p-2 bg-white/10 backdrop-blur rounded-full transition ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={navigateNext}
          disabled={currentIndex === captures.length - 1}
          className={`p-2 bg-white/10 backdrop-blur rounded-full transition ${
            currentIndex === captures.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Control Buttons */}
      <div className="fixed bottom-4 right-4 z-20">
        {/* Info Toggle Button */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition"
          title="Toggle info"
        >
          <Info className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-50 z-20">
        {currentIndex + 1} / {captures.length}
      </div>

      {/* Navigation for logged in users */}
      {user && (
        <div className="fixed top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-2 z-20">
          <Navigation />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <db.SignedOut>
        <GalleryContent isAuthenticated={false} />
      </db.SignedOut>
      <db.SignedIn>
        <GalleryContent isAuthenticated={true} />
      </db.SignedIn>
    </>
  );
}
