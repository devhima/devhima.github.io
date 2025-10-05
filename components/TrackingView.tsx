

import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { BackIcon } from './icons/BackIcon';
import { DataUsageIcon } from '../DataUsageIcon';
import { PlusIcon } from '../PlusIcon';

interface TrackingViewProps {
  user: User;
  onStopTracking: (sessionUsage: number) => void;
  onBack: () => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes <= 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  if (bytes < 1) {
    return `${bytes.toFixed(dm)} Bytes`;
  }
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const TrackingView: React.FC<TrackingViewProps> = ({ user, onStopTracking, onBack }) => {
  const [sessionUsage, setSessionUsage] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [manualUnit, setManualUnit] = useState<'KB' | 'MB' | 'GB'>('MB');
  const intervalRef = useRef<number | undefined>();

  const stopRealTracking = () => {
    if (intervalRef.current) {
      // FIX: The error "Expected 1 arguments, but got 0." on line 35 likely indicates an issue with timer function scope. Explicitly using `window.clearInterval` ensures the correct browser-native function is called, matching `window.setInterval`.
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
      setIsTracking(false);
    }
  };

  const startRealTracking = () => {
    setIsTracking(true);
    intervalRef.current = window.setInterval(async () => {
      try {
        // Fetch a random image to simulate data consumption.
        // Using a cache-busting URL to ensure data is actually downloaded.
        const response = await fetch(`https://picsum.photos/400?timestamp=${new Date().getTime()}`, { cache: 'no-store' });
        if (response.ok) {
          const blob = await response.blob();
          setSessionUsage(prev => prev + blob.size);
        } else {
            console.warn('Tracking fetch failed with status:', response.status);
        }
      } catch (error) {
        console.error('Data tracking fetch failed:', error);
        // Stop tracking if there's a network error (e.g., offline)
        stopRealTracking();
      }
    }, 2500); // Fetch data every 2.5 seconds
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleToggleTracking = () => {
    if (isTracking) {
      stopRealTracking();
    } else {
      startRealTracking();
    }
  };

  const handleStop = () => {
    stopRealTracking(); // Ensure tracking is stopped before saving
    onStopTracking(sessionUsage);
  };

  const handleAddManualUsage = () => {
    const amount = parseFloat(manualAmount);
    if (isNaN(amount) || amount <= 0) {
      setManualAmount('');
      return;
    }

    let bytesToAdd = 0;
    switch (manualUnit) {
      case 'KB':
        bytesToAdd = amount * 1024;
        break;
      case 'MB':
        bytesToAdd = amount * 1024 * 1024;
        break;
      case 'GB':
        bytesToAdd = amount * 1024 * 1024 * 1024;
        break;
    }
    setSessionUsage(prev => prev + bytesToAdd);
    setManualAmount('');
  };
  
  const totalUsage = user.totalUsage + sessionUsage;

  return (
    <div className="h-full flex flex-col relative">
      <header className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-700 transition-colors">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Tracking for {user.name}</h1>
      </header>
      
      <div className="flex-grow flex flex-col items-center justify-start text-center pt-4 space-y-6">
        <div>
            <p className="text-gray-400 text-lg">Current Session</p>
            <p className="text-5xl font-bold text-secondary tracking-tight">{formatBytes(sessionUsage)}</p>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-xl w-full max-w-xs">
            <div className="flex items-center justify-center text-gray-300 space-x-2">
              <DataUsageIcon className="w-5 h-5"/>
              <p className="font-semibold">Total Usage</p>
            </div>
            <p className="text-2xl font-semibold mt-1">{formatBytes(totalUsage)}</p>
        </div>

        {/* --- Controls --- */}
        <div className="bg-gray-800 p-4 rounded-xl w-full max-w-xs space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Live Data Tracking</h3>
                <button 
                    onClick={handleToggleTracking}
                    className={`w-full font-bold py-2 px-4 rounded-lg text-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface ${
                        isTracking 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500' 
                        : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    }`}
                >
                    {isTracking ? 'Stop Tracking' : 'Start Real Tracking'}
                </button>
            </div>
            <hr className="border-gray-600" />
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Manual Entry</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="Amount"
                        className="flex-grow w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                        min="0"
                    />
                    <select
                        value={manualUnit}
                        onChange={(e) => setManualUnit(e.target.value as 'KB' | 'MB' | 'GB')}
                        className="bg-gray-700 text-white rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option>KB</option>
                        <option>MB</option>
                        <option>GB</option>
                    </select>
                </div>
                 <button 
                    onClick={handleAddManualUsage}
                    disabled={!manualAmount.trim() || parseFloat(manualAmount) <= 0}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-secondary text-brand-bg font-bold py-2 px-4 rounded-lg text-md hover:bg-teal-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Usage</span>
                </button>
            </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button 
          onClick={handleStop}
          className="w-full bg-red-600 text-white font-bold py-4 px-4 rounded-lg text-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-red-500"
        >
          Stop Tracking & Save
        </button>
      </div>
    </div>
  );
};

export default TrackingView;