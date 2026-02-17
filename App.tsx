import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  ActivityIcon, 
  BrainIcon, 
  SearchIcon, 
  MapIcon, 
  UploadIcon,
  TerminalIcon,
  LoaderIcon
} from './components/Icons';
import TerminalOutput from './components/TerminalOutput';
import { 
  getMarketUpdates, 
  generateQuantPrediction, 
  findPrivateEquityDeals, 
  findResources, 
  analyzeChartImage 
} from './services/geminiService';
import { ModuleType, LogEntry, AnalysisResult } from './types';

// Mock Data for the chart
const mockStockData = Array.from({ length: 50 }, (_, i) => ({
  time: `10:${i < 10 ? '0' + i : i}`,
  price: 4200 + Math.random() * 100 - 50,
  volume: Math.floor(Math.random() * 10000)
}));

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
  
  // States for specific modules
  const [quantQuery, setQuantQuery] = useState('');
  const [quantResult, setQuantResult] = useState<string>('');
  const [quantLoading, setQuantLoading] = useState(false);

  const [dealSector, setDealSector] = useState('');
  const [dealResult, setDealResult] = useState<AnalysisResult | null>(null);
  const [dealLoading, setDealLoading] = useState(false);

  const [resourceType, setResourceType] = useState('');
  const [resourceResult, setResourceResult] = useState<AnalysisResult | null>(null);
  const [resourceLoading, setResourceLoading] = useState(false);

  const [headlines, setHeadlines] = useState<string>('Initializing live feed...');

  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string, level: 'INFO' | 'WARN' | 'CRIT' = 'INFO') => {
    setSystemLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    }, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    // Initial load
    addLog('System Initialized', 'INFO');
    addLog('Connecting to Gemini 2.5 Flash Lite for Market Data...', 'INFO');
    getMarketUpdates().then(news => {
      setHeadlines(news);
      addLog('Market Data Stream Active', 'INFO');
    });

    const interval = setInterval(() => {
       // Simulate real-time logs
       if(Math.random() > 0.7) {
         const msgs = ['Latency check: 12ms', 'Encryption key rotation', 'Data packet received', 'Index sync complete'];
         addLog(msgs[Math.floor(Math.random() * msgs.length)], 'INFO');
       }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleQuantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantQuery) return;
    setQuantLoading(true);
    addLog(`Running Quant Model (Gemini 3 Pro - Thinking Mode) for: ${quantQuery}`, 'INFO');
    const res = await generateQuantPrediction(quantQuery);
    setQuantResult(res);
    setQuantLoading(false);
    addLog('Quant Analysis Complete', 'INFO');
  };

  const handleDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealSector) return;
    setDealLoading(true);
    addLog(`Scanning Deal Flow (Gemini 3 Flash + Search) for: ${dealSector}`, 'INFO');
    const res = await findPrivateEquityDeals(dealSector);
    setDealResult(res);
    setDealLoading(false);
    addLog('Deal Scan Complete', 'INFO');
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceType) return;
    setResourceLoading(true);
    addLog(`Locating Resources (Gemini 2.5 Flash + Maps) for: ${resourceType}`, 'INFO');
    // Using user location would go here, passing dummy lat/long for demo or actual if permission granted
    // We'll simulate a query without specific lat/long for global search or broad grounding
    const res = await findResources(resourceType);
    setResourceResult(res);
    setResourceLoading(false);
    addLog('Geospatial Data Retrieved', 'INFO');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalysisImage(reader.result as string);
        addLog(`Image Loaded: ${file.name}`, 'INFO');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysisSubmit = async () => {
    if (!analysisImage) return;
    setAnalysisLoading(true);
    addLog('Analyzing Visual Data (Gemini 3 Pro Vision)...', 'INFO');
    // Strip base64 header for API
    const base64Data = analysisImage.split(',')[1];
    const res = await analyzeChartImage(base64Data, analysisPrompt || "Analyze this financial chart.");
    setAnalysisResult(res);
    setAnalysisLoading(false);
    addLog('Visual Analysis Complete', 'INFO');
  };

  const NavButton = ({ id, icon: Icon, label }: { id: ModuleType, icon: any, label: string }) => (
    <button
      onClick={() => setActiveModule(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
        activeModule === id 
          ? 'bg-[#1e293b] text-white border-r-2 border-blue-500' 
          : 'text-gray-400 hover:bg-[#111827] hover:text-gray-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-black text-gray-300 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="font-bold text-white text-lg">Q</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">QUANT<span className="text-blue-500">CORE</span></span>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span>SYSTEM ONLINE</span>
          </div>
        </div>
        
        <nav className="flex-1 py-4">
          <NavButton id={ModuleType.DASHBOARD} icon={ActivityIcon} label="Market Dashboard" />
          <NavButton id={ModuleType.QUANT_PREDICT} icon={BrainIcon} label="Quant Prediction" />
          <NavButton id={ModuleType.DEAL_FLOW} icon={SearchIcon} label="Deal Sourcing" />
          <NavButton id={ModuleType.RESOURCE_MAP} icon={MapIcon} label="Global Resources" />
          <NavButton id={ModuleType.DATA_LAB} icon={UploadIcon} label="Data Lab" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs font-mono text-gray-600 mb-2">SYSTEM LOGS</div>
          <div className="h-32 overflow-y-auto font-mono text-[10px] space-y-1">
            {systemLogs.map(log => (
              <div key={log.id} className="flex space-x-2">
                <span className="text-gray-600">{log.timestamp}</span>
                <span className={log.level === 'INFO' ? 'text-blue-500' : 'text-yellow-500'}>{log.level}</span>
                <span className="text-gray-400 truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        {/* Header */}
        <header className="h-16 bg-[#0a0a0a] border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-white tracking-wide">
            {activeModule === ModuleType.DASHBOARD && "MARKET OVERVIEW // S&P 500"}
            {activeModule === ModuleType.QUANT_PREDICT && "QUANTITATIVE MODELS // ALPHA GENERATION"}
            {activeModule === ModuleType.DEAL_FLOW && "PRIVATE EQUITY // DEAL FLOW"}
            {activeModule === ModuleType.RESOURCE_MAP && "COMMODITIES // GEOSPATIAL INTELLIGENCE"}
            {activeModule === ModuleType.DATA_LAB && "DATA LAB // PATTERN RECOGNITION"}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500 font-mono">GEMINI-3-PRO: CONNECTED</span>
            <div className="w-px h-4 bg-gray-700"></div>
            <span className="text-xs text-gray-500 font-mono">LATENCY: 14ms</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden relative">
          
          {/* Dashboard View */}
          {activeModule === ModuleType.DASHBOARD && (
            <div className="grid grid-cols-12 grid-rows-2 h-full gap-4">
              {/* Main Chart */}
              <div className="col-span-8 row-span-2 bg-[#0c0c0c] border border-gray-800 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold text-gray-400">SPX INDEX - LIVE</h3>
                   <div className="flex space-x-2">
                     <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">+1.24%</span>
                   </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockStockData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="time" stroke="#444" tick={{fontSize: 10}} />
                      <YAxis stroke="#444" domain={['auto', 'auto']} tick={{fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#eee'}}
                        itemStyle={{color: '#3b82f6'}}
                      />
                      <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* News Feed */}
              <div className="col-span-4 row-span-2 bg-[#0c0c0c] border border-gray-800 flex flex-col">
                <div className="bg-[#151515] px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400">MARKET INTELLIGENCE</h3>
                  <span className="text-[10px] text-gray-600">LIVE FEED</span>
                </div>
                <div className="p-4 font-mono text-xs leading-relaxed text-gray-400 whitespace-pre-wrap flex-1 overflow-y-auto">
                  {headlines}
                </div>
              </div>
            </div>
          )}

          {/* Quant Prediction View */}
          {activeModule === ModuleType.QUANT_PREDICT && (
            <div className="grid grid-cols-12 h-full gap-4">
              <div className="col-span-4 flex flex-col space-y-4">
                <div className="bg-[#0c0c0c] border border-gray-800 p-6 flex-1">
                  <h3 className="text-lg font-light text-white mb-6">Prediction Parameters</h3>
                  <form onSubmit={handleQuantSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-2">TARGET ASSET / SCENARIO</label>
                      <textarea
                        value={quantQuery}
                        onChange={(e) => setQuantQuery(e.target.value)}
                        className="w-full h-32 bg-black border border-gray-700 text-white p-3 text-sm focus:border-blue-500 focus:outline-none font-mono resize-none"
                        placeholder="e.g. Predict the impact of a rate cut on US Tech Small Caps over the next quarter..."
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                      <BrainIcon className="w-4 h-4 text-purple-500" />
                      <span>Thinking Mode (Budget: 32k tokens) Active</span>
                    </div>
                    <button 
                      type="submit" 
                      disabled={quantLoading}
                      className="w-full bg-blue-700 hover:bg-blue-600 text-white font-mono text-xs py-3 uppercase tracking-wider disabled:opacity-50"
                    >
                      {quantLoading ? 'Processing Model...' : 'Execute Model'}
                    </button>
                  </form>
                </div>
                <div className="bg-[#0c0c0c] border border-gray-800 p-4 h-1/3">
                  <h4 className="text-xs font-bold text-gray-500 mb-2">MODEL STATUS</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="text-gray-600">Model:</div><div className="text-right text-green-500">Gemini 3 Pro</div>
                    <div className="text-gray-600">Budget:</div><div className="text-right">32,768 T</div>
                    <div className="text-gray-600">Context:</div><div className="text-right">1M</div>
                    <div className="text-gray-600">Load:</div><div className="text-right">Optimized</div>
                  </div>
                </div>
              </div>
              <div className="col-span-8 h-full">
                <TerminalOutput 
                  title="QUANT_OUTPUT_STREAM" 
                  content={quantResult || "Awaiting input parameters..."} 
                  loading={quantLoading} 
                />
              </div>
            </div>
          )}

          {/* Deal Flow View */}
          {activeModule === ModuleType.DEAL_FLOW && (
            <div className="grid grid-cols-12 h-full gap-4">
              <div className="col-span-4 bg-[#0c0c0c] border border-gray-800 p-6">
                <h3 className="text-lg font-light text-white mb-6">Deal Sourcing</h3>
                <form onSubmit={handleDealSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2">TARGET SECTOR / THESIS</label>
                    <input 
                      type="text" 
                      value={dealSector}
                      onChange={(e) => setDealSector(e.target.value)}
                      className="w-full bg-black border border-gray-700 text-white p-3 text-sm focus:border-green-500 focus:outline-none font-mono"
                      placeholder="e.g. Series A Fintech in Southeast Asia"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={dealLoading}
                    className="w-full bg-green-800 hover:bg-green-700 text-white font-mono text-xs py-3 uppercase tracking-wider disabled:opacity-50"
                  >
                    {dealLoading ? 'Scanning Markets...' : 'Scan Markets'}
                  </button>
                </form>
                <div className="mt-8 border-t border-gray-800 pt-6">
                  <h4 className="text-xs font-mono text-gray-500 mb-4">RECENT ACTIVITY</h4>
                  <div className="space-y-2 text-xs text-gray-600 font-mono">
                     <p>> Scanning global venture data...</p>
                     <p>> Indexing crunchbase feeds...</p>
                     <p>> Ready for query.</p>
                  </div>
                </div>
              </div>
              <div className="col-span-8 h-full">
                <TerminalOutput 
                  title="DEAL_MEMO" 
                  content={dealResult?.text || "System idle. Enter sector to begin search."} 
                  loading={dealLoading}
                  groundingChunks={dealResult?.groundingChunks}
                />
              </div>
            </div>
          )}

          {/* Resource Map View */}
          {activeModule === ModuleType.RESOURCE_MAP && (
            <div className="grid grid-cols-12 h-full gap-4">
               <div className="col-span-4 bg-[#0c0c0c] border border-gray-800 p-6">
                <h3 className="text-lg font-light text-white mb-6">Commodity Tracking</h3>
                <form onSubmit={handleResourceSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2">RESOURCE / ASSET TYPE</label>
                    <input 
                      type="text" 
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="w-full bg-black border border-gray-700 text-white p-3 text-sm focus:border-yellow-600 focus:outline-none font-mono"
                      placeholder="e.g. Lithium mines in South America"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={resourceLoading}
                    className="w-full bg-yellow-800 hover:bg-yellow-700 text-white font-mono text-xs py-3 uppercase tracking-wider disabled:opacity-50"
                  >
                    {resourceLoading ? 'Triangulating...' : 'Locate Assets'}
                  </button>
                </form>
              </div>
              <div className="col-span-8 h-full">
                <TerminalOutput 
                  title="GEOSPATIAL_REPORT" 
                  content={resourceResult?.text || "Awaiting resource designation..."} 
                  loading={resourceLoading}
                  groundingChunks={resourceResult?.groundingChunks}
                />
              </div>
            </div>
          )}

          {/* Data Lab View */}
          {activeModule === ModuleType.DATA_LAB && (
            <div className="grid grid-cols-12 h-full gap-4">
              <div className="col-span-5 bg-[#0c0c0c] border border-gray-800 p-6 flex flex-col">
                <h3 className="text-lg font-light text-white mb-6">Visual Data Analysis</h3>
                
                <div 
                  className="border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors bg-black mb-4 flex-1 max-h-64"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {analysisImage ? (
                    <img src={analysisImage} alt="Analysis Target" className="max-h-full object-contain" />
                  ) : (
                    <>
                      <UploadIcon className="w-10 h-10 text-gray-600 mb-2" />
                      <span className="text-xs text-gray-500 font-mono">UPLOAD CHART / DATA VISUALIZATION</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>

                <div className="space-y-4">
                   <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2">ANALYSIS DIRECTIVE</label>
                    <input 
                      type="text" 
                      value={analysisPrompt}
                      onChange={(e) => setAnalysisPrompt(e.target.value)}
                      className="w-full bg-black border border-gray-700 text-white p-3 text-sm focus:border-red-500 focus:outline-none font-mono"
                      placeholder="Specific patterns to look for..."
                    />
                  </div>
                   <button 
                    onClick={handleAnalysisSubmit}
                    disabled={analysisLoading || !analysisImage}
                    className="w-full bg-red-900 hover:bg-red-800 text-white font-mono text-xs py-3 uppercase tracking-wider disabled:opacity-50"
                  >
                    {analysisLoading ? 'Analyzing Pattern...' : 'Run Vision Model'}
                  </button>
                </div>
              </div>
              <div className="col-span-7 h-full">
                <TerminalOutput 
                  title="PATTERN_RECOGNITION_OUTPUT" 
                  content={analysisResult || "No image data loaded."} 
                  loading={analysisLoading}
                />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}