"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
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
            Master classic games with AI-powered teaching. Learn strategies, get personalized guidance, and improve your skills.
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
                  Learn logic-based number placement with AI guidance. Master techniques from naked singles to X-wing patterns.
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

          {/* Chess Card (Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
          >
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 relative overflow-hidden h-full border-2 border-white/20 opacity-75">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                Coming Soon
              </div>
              <div className="text-7xl mb-4 font-bold text-gray-600">
                8×8
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Chess</h2>
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                Master the game of kings with AI-powered strategy teaching. Learn openings, tactics, and endgames.
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
            </div>
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
            ✨ AI-Powered Learning Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">🎯</div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Adaptive Teaching</h4>
              <p className="text-gray-700 text-base leading-relaxed">
                AI adjusts explanations to your skill level and learning pace
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">💡</div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Strategy Explanations</h4>
              <p className="text-gray-700 text-base leading-relaxed">
                Learn the 'why' behind every move with detailed breakdowns
              </p>
            </div>
            <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">📈</div>
              <h4 className="font-bold text-gray-900 mb-3 text-xl">Progress Tracking</h4>
              <p className="text-gray-700 text-base leading-relaxed">
                Monitor your improvement and master new techniques
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
