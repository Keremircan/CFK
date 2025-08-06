import React from 'react';
import { Brain, BookOpen, Target, Zap } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-pattern opacity-30"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-ping"></div>
        </div>
        
        {/* Title */}
        <h1 className="text-5xl font-bold mb-4 gradient-text">
          CFK Academy
        </h1>
        <p className="text-xl text-gray-300 mb-8">Yapay zeka destekli öğrenme platformu</p>
        
        {/* Feature Icons */}
        <div className="flex justify-center space-x-8 mb-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-gray-400">AI Destekli</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float" style={{animationDelay: '0.5s'}}>
              <BookOpen className="w-6 h-6 text-pink-400" />
            </div>
            <span className="text-xs text-gray-400">Öğrenme</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
              <Target className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-xs text-gray-400">Hedef</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float" style={{animationDelay: '1.5s'}}>
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-xs text-gray-400">Hız</span>
          </div>
        </div>
        
        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-sm text-gray-400 mt-4 loading-dots">
          Yükleniyor
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 