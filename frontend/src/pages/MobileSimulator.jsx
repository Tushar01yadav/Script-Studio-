import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DevicePhoneMobileIcon, 
  ArrowPathIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  ClipboardDocumentIcon,
  SparklesIcon,
  HomeIcon,
  DocumentTextIcon,
  FilmIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const DEVICE_PRESETS = {
  iphone13: { name: 'iPhone 13 / 14', width: 390, height: 844, platform: 'iOS' },
  pixel6: { name: 'Google Pixel 6', width: 412, height: 915, platform: 'Android' },
  galaxyS22: { name: 'Samsung Galaxy S22', width: 360, height: 780, platform: 'Android' },
  iphoneSE: { name: 'iPhone SE (Compact)', width: 320, height: 568, platform: 'iOS' },
};

const MobileSimulator = () => {
  const navigate = useNavigate();
  const [currentPreset, setCurrentPreset] = useState('iphone13');
  const [isLandscape, setIsLandscape] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef(null);

  const activePreset = DEVICE_PRESETS[currentPreset];
  const iframeWidth = isLandscape ? activePreset.height : activePreset.width;
  const iframeHeight = isLandscape ? activePreset.width : activePreset.height;

  const getBaseUrl = () => {
    return window.location.origin;
  };

  const getFullIframeUrl = () => {
    return `${getBaseUrl()}${currentPath}`;
  };

  const handleNavigatePath = (path) => {
    setCurrentPath(path);
    if (iframeRef.current) {
      iframeRef.current.src = `${getBaseUrl()}${path}`;
    }
  };

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  const copySimulatorLink = () => {
    navigator.clipboard.writeText(getFullIframeUrl());
    toast.success('Copied current mobile URL!');
  };

  // Sync address bar when iframe navigates internally
  useEffect(() => {
    const handleIframeMessage = (e) => {
      // Listen for pathname change from inside iframe if origin is the same
      if (e.origin === window.location.origin) {
        try {
          const path = e.data?.pathname;
          if (path) {
            setCurrentPath(path);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // Inject script inside iframe to send navigation events back to simulator
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Update URL based on iframe current location (same origin)
        const path = iframe.contentWindow.location.pathname + iframe.contentWindow.location.search;
        setCurrentPath(path);

        // Inject script to postMessage on route change
        const scriptStr = `
          (function() {
            let lastPath = window.location.pathname + window.location.search;
            setInterval(() => {
              const current = window.location.pathname + window.location.search;
              if (current !== lastPath) {
                lastPath = current;
                window.parent.postMessage({ pathname: current }, '*');
              }
            }, 300);
          })();
        `;
        const script = iframe.contentWindow.document.createElement('script');
        script.textContent = scriptStr;
        iframe.contentWindow.document.body.appendChild(script);
      }
    } catch (e) {
      // Cross-origin or loading error
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-200 flex flex-col font-sans">
      {/* Top Banner */}
      <header className="h-16 shrink-0 border-b border-gray-800 bg-[#0d1222]/80 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 18, 0, -18, 0] }}
            transition={{
              duration: 6,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'loop',
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
            style={{ display: 'inline-flex', transformOrigin: 'center top' }}
          >
            <svg className="h-6 w-6 text-red-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.018 0 12 0 12s0 3.982.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.553 9.388.553 9.388.553s7.53 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.982 24 12 24 12s0-3.982-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </motion.div>
          <span className="text-xl font-extrabold tracking-wider text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]">
            MOBILE SIMULATOR
          </span>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-semibold hidden sm:inline">
            Active Mode
          </span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
        >
          Back to Desktop Studio
        </button>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side Controls Panel */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-gray-800 bg-[#0d1222]/30 p-6 space-y-6 overflow-y-auto shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-5 w-5 text-indigo-500" />
              Device Configurator
            </h3>
            <p className="text-xs text-gray-400 mt-1">Configure your target mobile viewport simulator.</p>
          </div>

          {/* Preset Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Device Model</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(DEVICE_PRESETS).map((key) => (
                <button
                  key={key}
                  onClick={() => setCurrentPreset(key)}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-medium border transition-all ${
                    currentPreset === key 
                      ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold' 
                      : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <p className="truncate">{DEVICE_PRESETS[key].name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {DEVICE_PRESETS[key].width} × {DEVICE_PRESETS[key].height} ({DEVICE_PRESETS[key].platform})
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Screen Orientation</label>
            <div className="relative flex bg-gray-950/60 p-0.5 rounded-lg border border-gray-800">
              {/* Sliding background highlight */}
              <div 
                className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-md bg-indigo-600 transition-transform duration-300 ease-out"
                style={{
                  transform: !isLandscape ? 'translateX(0)' : 'translateX(100%)'
                }}
              />
              <button
                type="button"
                onClick={() => setIsLandscape(false)}
                className={`relative z-10 flex-1 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                  !isLandscape ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setIsLandscape(true)}
                className={`relative z-10 flex-1 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                  isLandscape ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          {/* Page Shortcuts */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Navigation Shortcuts</label>
            <div className="space-y-1">
              {[
                { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
                { name: 'Transcript Generator', path: '/transcript', icon: DocumentTextIcon },
                { name: 'Scene Generator', path: '/scenes', icon: FilmIcon },
                { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentPath.split('?')[0] === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigatePath(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                      isActive 
                        ? 'bg-gray-800 text-white border border-indigo-500/30' 
                        : 'text-gray-400 hover:bg-gray-900/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-indigo-400" />
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{item.path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info / Instructions */}
          <div className="rounded-xl border border-gray-800 bg-[#0d1222]/30 p-4 space-y-2 text-xs text-gray-400">
            <p className="font-bold text-gray-300">💡 Simulator Tips</p>
            <ul className="list-disc pl-4 space-y-1 text-gray-400">
              <li>Navigate naturally within the mobile frame just like a real phone.</li>
              <li>You can log in, register, and complete voiceovers inside the phone frame.</li>
              <li>Toggle between portrait and landscape viewports to check responsive wraps.</li>
            </ul>
          </div>
        </div>

        {/* Right Side Simulator Viewport */}
        <div className="flex-1 bg-[#090d19] p-6 md:p-12 flex flex-col items-center justify-center overflow-auto relative">
          
          {/* Mock Browser Header & Controls */}
          <div 
            className="bg-[#0d1222] border border-gray-800 rounded-t-xl px-4 py-2 flex items-center justify-between gap-4 shadow-lg"
            style={{ width: `${iframeWidth + 24}px`, maxWidth: '100%' }}
          >
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  try { iframeRef.current.contentWindow.history.back(); } catch(e){}
                }}
                className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
                title="Go back"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => {
                  try { iframeRef.current.contentWindow.history.forward(); } catch(e){}
                }}
                className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
                title="Go forward"
              >
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={handleReload}
                className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
                title="Reload"
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {/* Address Bar */}
            <div className="flex-1 bg-gray-950/60 border border-gray-800 rounded px-3 py-1 flex items-center justify-between text-xs text-gray-400 font-mono select-none overflow-hidden">
              <span className="truncate">{getBaseUrl()}{currentPath}</span>
              <button 
                onClick={copySimulatorLink}
                className="ml-2 hover:text-white"
                title="Copy URL"
              >
                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold uppercase font-mono">
              <span>{activePreset.platform}</span>
            </div>
          </div>

          {/* Interactive Mobile Device Frame */}
          <div 
            className="relative bg-black rounded-b-3xl border-x-12 border-b-12 border-gray-800 shadow-2xl p-0.5 transition-all duration-300"
            style={{ 
              width: `${iframeWidth + 24}px`, 
              height: `${iframeHeight + 12}px`,
              maxWidth: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            {/* Camera / Notch simulation */}
            {!isLandscape && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-5 bg-gray-800 rounded-b-2xl z-30 flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-900 border border-gray-750"></div>
                <div className="h-1.5 w-8 rounded-full bg-gray-900"></div>
              </div>
            )}

            {/* Embedded Iframe App View */}
            <div className="w-full h-full rounded-2xl overflow-hidden bg-[#09090b]">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={getFullIframeUrl()}
                title="Mobile Website Simulator Viewport"
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>

            {/* iOS Home Indicator / Android Bar simulation at the bottom */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gray-600 rounded-full z-30"></div>
          </div>
          
          {/* Status Metric Display */}
          <div className="mt-4 text-[10px] text-gray-500 font-semibold font-mono tracking-wider">
            Simulating {activePreset.name} Preset @ {iframeWidth} × {iframeHeight}px ({isLandscape ? 'Landscape' : 'Portrait'})
          </div>

        </div>
      </div>
    </div>
  );
};

export default MobileSimulator;
