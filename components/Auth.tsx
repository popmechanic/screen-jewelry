'use client';

import React, { useState, useRef } from 'react';
import db from '@/lib/db';

export function Login() {
  const [sentEmail, setSentEmail] = useState('');

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-sm w-full">
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} />
        ) : (
          <CodeStep sentEmail={sentEmail} onBack={() => setSentEmail('')} />
        )}
      </div>
    </div>
  );
}

function EmailStep({ onSendEmail }: { onSendEmail: (email: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const email = inputEl.value;

    setIsLoading(true);
    onSendEmail(email);

    try {
      await db.auth.sendMagicCode({ email });
    } catch (err) {
      alert('Error sending code: ' + (err as any).body?.message);
      onSendEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-lg shadow-lg space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sign In to Screen Jewelry</h2>
        <p className="mt-2 text-gray-600">
          Enter your email to access the editor dashboard
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          ref={inputRef}
          id="email"
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="editor@example.com"
          required
          autoFocus
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Sending...' : 'Send Magic Code'}
      </button>
    </form>
  );
}

function CodeStep({ sentEmail, onBack }: { sentEmail: string; onBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const code = inputEl.value;

    setIsLoading(true);

    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
    } catch (err) {
      inputEl.value = '';
      alert('Invalid code: ' + (err as any).body?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-lg shadow-lg space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Enter Verification Code</h2>
        <p className="mt-2 text-gray-600">
          We sent a 6-digit code to <strong>{sentEmail}</strong>
        </p>
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
          Verification Code
        </label>
        <input
          ref={inputRef}
          id="code"
          type="text"
          pattern="[0-9]{6}"
          maxLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="000000"
          required
          autoFocus
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Try Different Email
        </button>
      </div>
    </form>
  );
}