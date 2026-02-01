'use client'

import Link from 'next/link';
import { HomeIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="rounded-3xl p-8 md:p-12 bg-slate-800/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40">
          {/* Error Code */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-30 rounded-full w-48 h-48"></div>
              <div className="relative bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full p-6">
                <ExclamationTriangleIcon className="h-24 w-24 text-red-400" />
              </div>
            </div>
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mt-6">
              404
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full mt-4"></div>
          </div>

          {/* Message */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Lost in the Void</h2>
            <p className="text-gray-300 text-lg mb-6 max-w-md mx-auto">
              The page you're looking for has drifted into the digital abyss or never existed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/25"
            >
              <HomeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Back to Homepage</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 text-gray-200 font-medium transition-all duration-300 hover:scale-[1.02] border border-gray-600/50"
            >
              <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our{' '}
              <a href="mailto:support@example.com" className="text-blue-400 hover:text-blue-300 underline">
                support team
              </a>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}