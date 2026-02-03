"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CopilotKit } from '@copilotkit/react-core';

export default function HomePage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit?agent=router_agent">
      <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Game Learning
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Master classic games with interactive teaching. Learn strategies, get personalized guidance, and improve your skills.
          </p>
        </motion.div>

        {/* Game Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Sudoku Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/sudoku" className="block h-full">
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-2 cursor-pointer group h-full border-2 border-white/20">
                <div className="text-7xl mb-4 font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                  9×9
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Sudoku</h2>
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                  Learn logic-based number placement with expert guidance. Master techniques from naked singles to X-wing patterns.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Logic
                  </span>
                  <span className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Pattern Recognition
                  </span>
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Problem Solving
                  </span>
                </div>
                <div className="flex items-center text-indigo-600 font-bold text-lg group-hover:translate-x-2 transition-transform">
                  Start Learning
                  <span className="ml-2 text-2xl">→</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Chess Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/chess" className="block h-full">
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-2 cursor-pointer group h-full border-2 border-white/20">
                <div className="text-7xl mb-4 font-bold text-amber-600 group-hover:scale-110 transition-transform">
                  CH
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Chess</h2>
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                  Master the game of kings with expert strategy teaching. Learn openings, tactics, and endgames.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Strategy
                  </span>
                  <span className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Tactics
                  </span>
                  <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold shadow-md">
                    Analysis
                  </span>
                </div>
                <div className="flex items-center text-amber-600 font-bold text-lg group-hover:translate-x-2 transition-transform">
                  Start Learning
                  <span className="ml-2 text-2xl">→</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-10 drop-shadow-lg">
            Interactive Learning Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Adaptive Teaching</h4>
              <p className="text-gray-700 text-base leading-relaxed">
                Explanations adjust to your skill level and learning pace
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Strategy Explanations</h4>
              <p className="text-gray-700 text-base leading-relaxed">
                Learn the &apos;why&apos; behind every move with detailed breakdowns
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Progress Tracking</h4>
              <p className="text-gray-700 text-base leading-relaxed">
                Monitor your improvement and master new techniques
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
    </CopilotKit>
  );
}
