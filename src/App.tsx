import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  ComposedChart, Bar, Line, Cell, Label, ReferenceDot
} from 'recharts';
import {
  Settings, Zap, TrendingUp, Server, Clock, Box, ChevronDown, Check, Info, Share
} from 'lucide-react';
import Background3DDefault from './components/Background3D';
import { GEMINI_MODELS, DEFAULT_MODEL_ID, PT_PRICING } from './data/models';

import GeminiLogo from './assets/gemini.png';

import ShareModal from './components/ShareModal';
import Toast from './components/Toast';
import { toPng } from 'html-to-image';


// --- SUBCOMPONENTS ---

const App: React.FC = () => {
  // --- STATE ---
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);

  // Find current model or default - define this EARLY so we can use it for initial state
  const currentModel = GEMINI_MODELS.find(m => m.id === selectedModelId) || GEMINI_MODELS[2];

  const [ptYearlyPrice, setPtYearlyPrice] = useState(PT_PRICING.YEARLY);
  const [gsuCapacity, setGsuCapacity] = useState(currentModel.gsuCapacity);

  // Granular PayGo Pricing State
  const [priceInText, setPriceInText] = useState(currentModel.priceInText);
  const [priceInImage, setPriceInImage] = useState(currentModel.priceInImage);
  const [priceInVideo, setPriceInVideo] = useState(currentModel.priceInVideo);
  const [priceInAudio, setPriceInAudio] = useState(currentModel.priceInAudio);

  const [priceOutText, setPriceOutText] = useState(currentModel.priceOutText);
  const [priceOutImage, setPriceOutImage] = useState(currentModel.priceOutImage);
  const [priceOutVideo, setPriceOutVideo] = useState(currentModel.priceOutVideo);
  const [priceOutAudio, setPriceOutAudio] = useState(currentModel.priceOutAudio);

  const [ptMonthlyPrice, setPtMonthlyPrice] = useState(PT_PRICING.MONTHLY);
  const [ptQuarterlyPrice, setPtQuarterlyPrice] = useState(PT_PRICING.QUARTERLY);


  // Derived state for display/calculation - could also be set via useEffect if we want them editable *after* selection
  // For now, let's keep them synonymous with the model but allow manual override if the user really wants to via the advanced panel?
  // Let's stick to the plan: update them when model changes.
  // Actually, standard React pattern: use useEffect to sync, OR just use the values directly.
  // Ideally, if a user picks a model, these update. If they manually change them, it might be "Custom".
  // Let's keep simpler: State initialized with model, updated when model changes.

  const [burnInText, setBurnInText] = useState(currentModel.burnInText);
  const [burnInImage, setBurnInImage] = useState(currentModel.burnInImage);
  const [burnInVideo, setBurnInVideo] = useState(currentModel.burnInVideo);
  const [burnInAudio, setBurnInAudio] = useState(currentModel.burnInAudio);

  const [burnOutText, setBurnOutText] = useState(currentModel.burnOutText);
  const [burnOutImage, setBurnOutImage] = useState(currentModel.burnOutImage);
  const [burnOutAudio, setBurnOutAudio] = useState(currentModel.burnOutAudio);
  const [burnOutVideo, setBurnOutVideo] = useState(currentModel.burnOutVideo);

  const [tpsInText, setTpsInText] = useState(8000);
  const [tpsInImage, setTpsInImage] = useState(0);
  const [tpsInVideo, setTpsInVideo] = useState(0);
  const [tpsInAudio, setTpsInAudio] = useState(0);

  const [tpsOutText, setTpsOutText] = useState(500);
  const [tpsOutImage, setTpsOutImage] = useState(0);
  const [tpsOutVideo, setTpsOutVideo] = useState(0);
  const [tpsOutAudio, setTpsOutAudio] = useState(0);
  const [peakHours, setPeakHours] = useState(10);
  const [offPeakRatio, setOffPeakRatio] = useState(10);

  // Calculate total input volume to check against context window threshold
  // We sum up the "TPS" values as a proxy for total input tokens in the request
  const totalInputTps = tpsInText + tpsInImage + tpsInVideo + tpsInAudio;

  // Effect to update burndown AND pricing AND capacity when model changes OR when totalInputTps changes context
  React.useEffect(() => {
    const model = GEMINI_MODELS.find(m => m.id === selectedModelId);
    if (model) {
      let config = model;
      // Check for Long Context Override based on TOTAL INPUT VOLUME
      if (model.longContextConfig && totalInputTps > model.longContextConfig.threshold) {
        config = { ...model, ...model.longContextConfig };
      }

      setBurnInText(config.burnInText);
      setBurnInImage(config.burnInImage);
      setBurnInVideo(config.burnInVideo);
      setBurnInAudio(config.burnInAudio);

      setBurnOutText(config.burnOutText);
      setBurnOutImage(config.burnOutImage);
      setBurnOutVideo(config.burnOutVideo);
      setBurnOutAudio(config.burnOutAudio);

      setPriceInText(config.priceInText);
      setPriceInImage(config.priceInImage);
      setPriceInVideo(config.priceInVideo);
      setPriceInAudio(config.priceInAudio);

      setPriceOutText(config.priceOutText);
      setPriceOutImage(config.priceOutImage);
      setPriceOutVideo(config.priceOutVideo);
      setPriceOutAudio(config.priceOutAudio);

      setGsuCapacity(config.gsuCapacity);
    }
  }, [selectedModelId, totalInputTps]);

  // --- CALCULATIONS ---
  const results = useMemo(() => {
    // 1. Capacity Sizing
    const totalBurnIn = (tpsInText * burnInText) + (tpsInImage * burnInImage) + (tpsInVideo * burnInVideo) + (tpsInAudio * burnInAudio);
    const totalBurnOut = (tpsOutText * burnOutText) + (tpsOutImage * burnOutImage) + (tpsOutVideo * burnOutVideo) + (tpsOutAudio * burnOutAudio);

    const peakUnitsNeeded = totalBurnIn + totalBurnOut;
    const gsusNeeded = Math.ceil(peakUnitsNeeded / gsuCapacity);

    // 2. Volume & Cost
    const secondsPeak = peakHours * 3600 * 365;
    const secondsOffPeak = (24 - peakHours) * 3600 * 365;
    const ratioDecimal = offPeakRatio / 100;

    // Unused variables for now, but kept if we want to show raw TPS later
    // const totalInputTps = tpsInText + tpsInImage + tpsInVideo + tpsInAudio;
    // const totalOutputTps = tpsOutText + tpsOutImage + tpsOutVideo + tpsOutAudio;

    // We treat "tokens" abstractly here as raw requests for pricing, but strictly speaking 
    // "Input Tokens" for billing usually means text characters equivalent. 
    // For images, cost is per image, but for simplicity in this PayGo estimation 
    // we might need to assume the price provided is "per text token equivalent".
    // HOWEVER, the Models data has "paygoInputPrice". If that's per million TEXT TOKENS, 
    // we should really be calculating "Cost Units" separate from "Capacity Units".
    // IMPORTANT: For this refactor, we will simplify: 
    // Assume PayGo price applies to the *Burndown Units* count? 
    // Or stick to the abstraction that TPS = requests/sec and we just use the text ones?
    // Let's assume the user enters "TPS" as "Requests per second".
    // And PayGo is typically "Per Million Characters/Images". This is complex.
    // DECISION: For PayGo estimation, we will use the *Burndown Units* as a proxy for "Billable Units" (e.g. Tokens).
    // This is because 1 Image ≈ 258 Tokens in terms of capacity AND likely cost weight.

    // PayGo calculation now granular
    // We use a base "Per Million" unit for simplicity in input, 
    // assuming prices entered are "Per 1 Million Units" for text/image/video/audio alike.
    // If user enters $ amount for 1M images, this holds. 

    // Cost = (AnnualUnits / 1,000,000) * PricePerMillion
    // We multiply TPS by burnInX to estimate the "Token Equivalent" volume before applying price.
    // We also sanitize price to 0 if it is -1 (unsupported flag).
    const safePrice = (p: number) => Math.max(0, p);

    // Text: Raw unit volume * Price (Per 1 Million Units)
    const costInText = ((tpsInText * secondsPeak) + (tpsInText * ratioDecimal * secondsOffPeak)) / 1e6 * safePrice(priceInText);

    // Image: Raw unit volume * Price (Per 1 Million Images)
    const costInImage = ((tpsInImage * secondsPeak) + (tpsInImage * ratioDecimal * secondsOffPeak)) / 1e6 * safePrice(priceInImage);

    // Video: Raw unit volume * Price (Per 1 Million Video Units/Seconds)
    const costInVideo = ((tpsInVideo * secondsPeak) + (tpsInVideo * ratioDecimal * secondsOffPeak)) / 1e6 * safePrice(priceInVideo);

    // Audio: Raw unit volume * Price (Per 1 Million Audio Units/Seconds)
    const costInAudio = ((tpsInAudio * secondsPeak) + (tpsInAudio * ratioDecimal * secondsOffPeak)) / 1e6 * safePrice(priceInAudio);

    // OUTPUTS
    const costOutText = ((tpsOutText * secondsPeak) + (tpsOutText * ratioDecimal * secondsOffPeak)) / 1e6 * safePrice(priceOutText);
    const costOutImage = ((tpsOutImage * secondsPeak) + (tpsOutImage * ratioDecimal * secondsOffPeak)) / 1e6 * safePrice(priceOutImage);
    const costOutVideo = ((tpsOutVideo * secondsPeak) + (tpsOutVideo * ratioDecimal * secondsOffPeak)) / 1e6 * safePrice(priceOutVideo);
    const costOutAudio = ((tpsOutAudio * secondsPeak) + (tpsOutAudio * ratioDecimal * secondsOffPeak)) / 1e6 * safePrice(priceOutAudio);

    const paygoCost = costInText + costInImage + costInVideo + costInAudio +
      costOutText + costOutImage + costOutVideo + costOutAudio;

    const ptMonthlyCost = gsusNeeded * ptMonthlyPrice * 12;
    const ptQuarterlyCost = gsusNeeded * ptQuarterlyPrice * 12;
    const ptYearlyCost = gsusNeeded * ptYearlyPrice * 12;
    const avgUtilization = ((peakHours * 1.0) + ((24 - peakHours) * ratioDecimal)) / 24;

    const savings = Math.abs(paygoCost - ptYearlyCost);
    const isPtCheaper = ptYearlyCost < paygoCost;

    return {
      peakUnitsNeeded, gsusNeeded, paygoCost, ptMonthlyCost, ptQuarterlyCost, ptYearlyCost, avgUtilization, isPtCheaper, savings,
      totalBurnIn, totalBurnOut, // Exported for UI
      // Detailed Costs for Tooltip
      costInText, costInImage, costInVideo, costInAudio,
      costOutText, costOutImage, costOutVideo, costOutAudio
    };
  }, [
    priceInText, priceInImage, priceInVideo, priceInAudio,
    priceOutText, priceOutImage, priceOutVideo, priceOutAudio,
    ptMonthlyPrice, ptQuarterlyPrice, ptYearlyPrice, gsuCapacity,
    burnInText, burnInImage, burnInVideo, burnInAudio,
    burnOutText, burnOutImage, burnOutVideo, burnOutAudio,
    tpsInText, tpsInImage, tpsInVideo, tpsInAudio,
    tpsOutText, tpsOutImage, tpsOutVideo, tpsOutAudio,
    peakHours, offPeakRatio
  ]);

  // --- CHART 1: 24H TRAFFIC SIMULATOR ---
  const dailyData = useMemo(() => {
    const data = [];
    const peakStart = 8;
    const peakEnd = (8 + peakHours) % 24;

    // Use weighted units for visualization to show "Load" relative to "Capacity"
    const peakLoadUnits = results.totalBurnIn + results.totalBurnOut;
    const offPeakLoadUnits = peakLoadUnits * (offPeakRatio / 100);
    const capacityUnits = gsuCapacity * results.gsusNeeded;

    for (let i = 0; i < 24; i++) {
      let isPeak = false;
      if (peakEnd > peakStart) {
        isPeak = i >= peakStart && i < peakEnd;
      } else {
        isPeak = i >= peakStart || i < peakEnd;
      }

      data.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        tps: isPeak ? peakLoadUnits : offPeakLoadUnits,
        capacity: capacityUnits, // Constant capacity
        isPeak
      });
    }
    return data;
  }, [peakHours, offPeakRatio, results.totalBurnIn, results.totalBurnOut, gsuCapacity, results.gsusNeeded]);

  // --- CHART 2: BREAK-EVEN CURVE ---
  const breakEvenData = useMemo(() => {
    const data = [];
    const maxPaygoValue = results.avgUtilization > 0 ? results.paygoCost / results.avgUtilization : 0;

    // Calculate precise break-even x (utilization %)
    // PayGo = PT => maxPaygo * (x/100) = ptCost
    // x = (ptCost / maxPaygo) * 100
    let breakEvenX = maxPaygoValue > 0 ? (results.ptYearlyCost / maxPaygoValue) * 100 : 0;
    if (breakEvenX > 100) breakEvenX = -1; // Off chart

    for (let i = 0; i <= 100; i += 1) {
      data.push({ utilization: i, paygo: (maxPaygoValue * (i / 100)), pt: results.ptYearlyCost });
    }
    return { data, breakEvenX };
  }, [results]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const isLongContext = currentModel.longContextConfig && totalInputTps > currentModel.longContextConfig.threshold;

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const handleShare = async () => {
    setIsGeneratingShare(true);
    setShareImage(null); // Reset

    // Wait for a brief moment to ensure UI allows spinner to render
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(document.body, {
          cacheBust: true,
          backgroundColor: '#ffffff', // Ensure white background
          pixelRatio: 2, // High DPI
          filter: (node) => {
            // Exclude the share button from the screenshot if desired, 
            // or other interactive elements. 
            // Note: html-to-image filter receives a DOM node.
            if (node.tagName === 'BUTTON' && node.textContent?.includes('Share')) {
              return false;
            }
            return true;
          }
        });
        setShareImage(dataUrl);
        setIsShareModalOpen(true);
      } catch (err) {
        console.error("Screenshot failed", err);
        setToastMsg({ msg: "Failed to generate screenshot. Please try again.", type: 'error' });
      } finally {
        setIsGeneratingShare(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen font-sans text-slate-600 relative overflow-hidden">
      <Toast
        message={toastMsg?.msg || null}
        type={toastMsg?.type}
        onClose={() => setToastMsg(null)}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageSrc={shareImage}
        modelId={selectedModelId}
      />
      <Background3DDefault />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">     {/* HEADER */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-xl shadow-lg shadow-blue-100">
              <img src={GeminiLogo} className="h-8 w-auto" alt="Gemini Logo" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vertex AI Provisioned Throughput Calculator</h1>
              {/* <p className="text-slate-500 text-xs">by natavit</p> */}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              disabled={isGeneratingShare}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm font-bold text-slate-600 disabled:opacity-50"
            >
              {isGeneratingShare ? (
                <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full"></div>
              ) : (
                <Share size={16} />
              )}
              <span>Share</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: CONTROLS */}
          <div className="lg:col-span-4 space-y-6">

            {/* TRAFFIC CONTROLS */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
              <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Workload Profile</h2>
                </div>
              </div>

              {/* MODEL SELECTOR */}
              <div className="px-6 pt-6 pb-2 relative z-20">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Model Version</label>
                <ModelSelector
                  models={GEMINI_MODELS}
                  selectedId={selectedModelId}
                  onSelect={setSelectedModelId}
                />

                {/* Info snippet for selected model */}
                <div className="mt-3 ml-1 text-[10px] text-slate-400 font-medium uppercase tracking-wide space-y-1">
                  {/* Simplified info for multimodal - maybe just pricing? */}
                  <div className="flex gap-4 items-center">
                    <span className="text-slate-500">PayGo Est (Text):</span>
                    <span>In <span className="text-slate-700 font-bold">${priceInText}</span></span>
                    <span>Out <span className="text-slate-700 font-bold">${priceOutText}</span></span>
                    {isLongContext && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] border border-blue-200">LONG CONTEXT ACTIVE</span>}
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-slate-500">Capacity:</span>
                    <span className="text-slate-700 font-bold">{gsuCapacity}/GSU</span>
                  </div>
                </div>
              </div>

              {/* AVG INPUT TOKENS Control REMOVED - using totalInputTps from multimodal inputs instead */}

              <div className="p-6 space-y-8 pt-4">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Multimodal Inputs (TPS)</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <NumberInput label="Text" value={tpsInText} setValue={setTpsInText} step={100} disabled={priceInText === -1} />
                            <div className="text-[10px] text-right text-slate-400 mt-1">{burnInText}x = <span className="text-blue-500 font-mono">{(tpsInText * burnInText).toLocaleString()}</span></div>
                          </div>
                          <div>
                            <NumberInput label="Image" value={tpsInImage} setValue={setTpsInImage} step={1} disabled={priceInImage === -1} />
                            <div className="text-[10px] text-right text-slate-400 mt-1">{burnInImage}x = <span className="text-blue-500 font-mono">{(tpsInImage * burnInImage).toLocaleString()}</span></div>
                          </div>
                          <div>
                            <NumberInput label="Video" value={tpsInVideo} setValue={setTpsInVideo} step={1} disabled={priceInVideo === -1} />
                            <div className="text-[10px] text-right text-slate-400 mt-1">{burnInVideo}x = <span className="text-blue-500 font-mono">{(tpsInVideo * burnInVideo).toLocaleString()}</span></div>
                          </div>
                          <div>
                            <NumberInput label="Audio" value={tpsInAudio} setValue={setTpsInAudio} step={1} disabled={priceInAudio === -1} />
                            <div className="text-[10px] text-right text-slate-400 mt-1">{burnInAudio}x = <span className="text-blue-500 font-mono">{(tpsInAudio * burnInAudio).toLocaleString()}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-50">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Multimodal Outputs (TPS)</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <NumberInput label="Text" value={tpsOutText} setValue={setTpsOutText} step={10} disabled={priceOutText === -1} />
                            <div className="text-[10px] text-right text-slate-400 mt-1">{burnOutText}x = <span className="text-blue-500 font-mono">{(tpsOutText * burnOutText).toLocaleString()}</span></div>
                          </div>
                          <div>
                            <NumberInput label="Image" value={tpsOutImage} setValue={setTpsOutImage} step={1} disabled={priceOutImage === -1} />
                            <div className="text-[10px] text-right text-slate-400 mt-1">{burnOutImage}x = <span className="text-blue-500 font-mono">{(tpsOutImage * burnOutImage).toLocaleString()}</span></div>
                          </div>
                          <div>
                            <NumberInput label="Video" value={tpsOutVideo} setValue={setTpsOutVideo} step={1} disabled={priceOutVideo === -1} />
                            <div className="text-[10px] text-right text-slate-400 mt-1">{burnOutVideo}x = <span className="text-blue-500 font-mono">{(tpsOutVideo * burnOutVideo).toLocaleString()}</span></div>
                          </div>
                          <div>
                            <NumberInput label="Audio" value={tpsOutAudio} setValue={setTpsOutAudio} step={1} disabled={priceOutAudio === -1} />
                            <div className="text-[10px] text-right text-slate-400 mt-1">{burnOutAudio}x = <span className="text-blue-500 font-mono">{(tpsOutAudio * burnOutAudio).toLocaleString()}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-1 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 group relative cursor-help">
                        <span className="text-xs font-bold text-slate-500 uppercase border-b border-dashed border-slate-300">Total Capacity</span>
                        <Info className="w-3 h-3 text-slate-400" />

                        <div className="absolute left-0 bottom-full mb-2 w-max max-w-[240px] bg-slate-900 text-white p-3 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-2">
                            Burndown Calculation
                          </div>
                          <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
                            Total Burndown Units per second required to support the peak traffic load.
                          </p>
                          <div className="space-y-1 font-mono text-[10px]">
                            <div className="flex justify-between gap-4"><span>Total Inputs:</span> <span className="text-blue-300">{results.totalBurnIn.toLocaleString()}</span></div>
                            <div className="flex justify-between gap-4"><span>Total Outputs:</span> <span className="text-indigo-300">{results.totalBurnOut.toLocaleString()}</span></div>
                            <div className="border-t border-slate-700 my-1"></div>
                            <div className="flex justify-between gap-4 font-bold"><span>Total Required:</span> <span className="text-white">{(results.totalBurnIn + results.totalBurnOut).toLocaleString()}</span></div>
                          </div>
                        </div>
                      </div>

                      <span className="text-sm font-bold text-blue-600">
                        {(results.totalBurnIn + results.totalBurnOut).toLocaleString()} <span className="text-xs text-slate-400 font-medium">Burndown</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <RangeControl label="Peak Duration" value={peakHours} setValue={setPeakHours} min={1} max={24} suffix="hrs" desc="Hours per day at max load" />
                  <RangeControl label="Off-Peak Traffic" value={offPeakRatio} setValue={setOffPeakRatio} min={0} max={100} suffix="%" desc="% of peak volume at night" />
                </div>
              </div>
            </div>

            {/* PRICING CONTROLS */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
              <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pricing Parameters</h2>
              </div>
              <div className="p-6">
                {/* Granular Pricing Grid */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">PayGo Rates ($/1M Tokens)</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-50 pb-1 mb-1">Inputs</div>
                      {priceInText !== -1 && <PriceInput label="Text In" value={priceInText} setValue={setPriceInText} />}
                      {priceInImage !== -1 && <PriceInput label="Image In" value={priceInImage} setValue={setPriceInImage} />}
                      {priceInVideo !== -1 && <PriceInput label="Video In" value={priceInVideo} setValue={setPriceInVideo} />}
                      {priceInAudio !== -1 && <PriceInput label="Audio In" value={priceInAudio} setValue={setPriceInAudio} />}
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-50 pb-1 mb-1">Outputs</div>
                      {priceOutText !== -1 && <PriceInput label="Text Out" value={priceOutText} setValue={setPriceOutText} />}
                      {priceOutImage !== -1 && <PriceInput label="Image Out" value={priceOutImage} setValue={setPriceOutImage} />}
                      {priceOutVideo !== -1 && <PriceInput label="Video Out" value={priceOutVideo} setValue={setPriceOutVideo} />}
                      {priceOutAudio !== -1 && <PriceInput label="Audio Out" value={priceOutAudio} setValue={setPriceOutAudio} />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">PT Commit ($/GSU/Month)</div>
                  <PriceInput label="Monthly" value={ptMonthlyPrice} setValue={setPtMonthlyPrice} />
                  <PriceInput label="3-Month" value={ptQuarterlyPrice} setValue={setPtQuarterlyPrice} />
                  <PriceInput label="1-Year" value={ptYearlyPrice} setValue={setPtYearlyPrice} />
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <details className="group cursor-pointer">
                    <summary className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 list-none flex items-center gap-2">
                      <Settings className="w-3 h-3" /> Advanced Configuration
                    </summary>
                    <div className="space-y-4 pl-2 border-l-2 border-slate-100 mt-2">
                      {/* Advanced settings or overrides could go here */}
                      <p className="text-xs text-slate-400">Model parameters are locked to the selected version.</p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INSIGHTS */}
          <div className="lg:col-span-8 space-y-6">

            {/* HERO RESULT CARD */}
            <div className={`rounded-3xl p-8 text-white shadow-2xl transition-all duration-500 relative overflow-hidden ${results.isPtCheaper ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-blue-200' : 'bg-gradient-to-r from-slate-800 to-slate-900 shadow-slate-200'}`}>
              {/* Background FX */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 opacity-90">
                    {results.isPtCheaper ? <Zap className="w-5 h-5 text-yellow-300" /> : <TrendingUp className="w-5 h-5 text-emerald-300" />}
                    <span className="font-bold uppercase tracking-wider text-sm">Optimal Strategy</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    {results.isPtCheaper ? "Switch to Provisioned" : "Stay on Pay-as-you-go"}
                  </h2>
                  <p className="text-lg opacity-80 max-w-lg">
                    {results.isPtCheaper
                      ? "Your high utilization justifies the fixed commitment."
                      : `You save money by only paying for the ${results.avgUtilization < 0.5 ? 'small' : ''} traffic you actually use.`}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[200px]">
                  <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Estimated Savings</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(results.savings)}</p>
                  <p className="text-xs opacity-70 mt-1">per year</p>
                </div>
              </div>
            </div>

            {/* KEY METRICS CARDS (RESTORED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard
                title="Hardware Required"
                value={results.gsusNeeded}
                unit="GSUs"
                desc={`To handle ${results.peakUnitsNeeded.toLocaleString()} peak units`}
                icon={<Server className="text-blue-500" />}
              />
              <MetricCard
                title="Effective Utilization"
                value={(results.avgUtilization * 100).toFixed(1)}
                unit="%"
                desc="Weighted 24h average load"
                icon={<TrendingUp className={results.avgUtilization < 0.77 ? "text-amber-500" : "text-emerald-500"} />}
                color={results.avgUtilization < 0.77 ? "text-amber-600" : "text-emerald-600"}
              />
            </div>

            {/* CHART 1: 24H TRAFFIC */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Clock size={20} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">24-Hour Traffic Simulator</h3>
                    <p className="text-slate-500 text-xs">Visualizing wasted capacity (gap between bars and dashed line)</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-400 uppercase">Avg Utilization</div>
                  <div className={`text-xl font-bold ${results.avgUtilization < 0.77 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {(results.avgUtilization * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DailyTooltip />} />
                    <Line type="step" dataKey="capacity" stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={2} dot={false} activeDot={false} name="Paid Capacity" />
                    <Bar dataKey="tps" radius={[4, 4, 0, 0]} name="Actual Traffic">
                      {dailyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isPeak ? '#2563eb' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 2: BREAK-EVEN */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Break-Even Analysis</h3>
                <p className="text-slate-500 text-sm">Where Provisioned Throughput becomes cheaper than PayGo</p>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={breakEvenData.data} margin={{ top: 25, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPaygo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} dataKey="utilization" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip content={<BreakEvenTooltip formatCurrency={formatCurrency} />} />
                    <Area type="monotone" dataKey="paygo" stroke="#10b981" strokeWidth={3} fill="url(#colorPaygo)" name="PayGo" />
                    <Line type="monotone" dataKey="pt" stroke="#3b82f6" strokeWidth={3} strokeDasharray="6 6" dot={false} name="Provisioned" />
                    {breakEvenData.breakEvenX >= 0 && (
                      <ReferenceLine x={breakEvenData.breakEvenX} stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3">
                        <Label value="Break-Even (1y)" position="top" offset={10} fill="#f59e0b" fontSize={10} fontWeight="bold" />
                      </ReferenceLine>
                    )}
                    {breakEvenData.breakEvenX >= 0 && (
                      <ReferenceDot x={breakEvenData.breakEvenX} y={results.ptYearlyCost} r={4} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                    )}
                    <ReferenceLine x={results.avgUtilization * 100} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'YOU', fill: '#64748b', fontSize: 10, position: 'top' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* COST TABLE */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing Model</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Monthly Cost</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Annual Cost</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Vs PayGo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <TableRow
                    label="Pay-as-you-go"
                    cost={results.paygoCost}
                    base={results.paygoCost}
                    isBase
                    details={results} // Pass all results for the tooltip breakdown
                  />
                  <TableRow label="PT (Monthly Commit)" cost={results.ptMonthlyCost} base={results.paygoCost} />
                  <TableRow label="PT (3-Month Commit)" cost={results.ptQuarterlyCost} base={results.paygoCost} />
                  <TableRow label="PT (1-Year Commit)" cost={results.ptYearlyCost} base={results.paygoCost} highlight />
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

      <footer className="w-full text-center py-6 text-slate-400 text-xs font-medium relative z-10 transition-colors hover:text-blue-500 cursor-default">
        by James Natavit
      </footer>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const ModelSelector = ({ models, selectedId, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = models.find((m: any) => m.id === selectedId) || models[0];
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-4 py-3 text-slate-900 font-medium flex items-center justify-between transition-all hover:bg-slate-100 hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
            <Box size={16} />
          </div>
          <span className="text-sm">{selectedModel.name}</span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'top-0 rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div className={`absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all duration-200 origin-top z-50 ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
        <div className="p-1.5 space-y-0.5 max-h-[280px] overflow-y-auto">
          {models.map((model: any) => {
            const isActive = model.id === selectedId;
            return (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                  {model.name}
                </span>
                {isActive && <Check size={14} className="text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const NumberInput = ({ label, value, setValue, step, disabled }: any) => {
  const [localValue, setLocalValue] = React.useState(value.toString());

  // Sync local value with prop value if they diverge significantly (e.g. external update)
  // We avoid syncing if the difference is just formatting to prevent cursor jumps or fighting
  React.useEffect(() => {
    // Only update if the parsed local value is different from the prop value
    // AND we are not currently effectively equal (handling 0 vs "0" vs "")
    if (Number(localValue) !== value) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (val === '') {
      setValue(0);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setValue(num);
      }
    }
  };

  const handleBlur = () => {
    // On blur, strictly format back to the number prop to ensure consistency
    setLocalValue(value.toString());
  };

  return (
    <div className={disabled ? "opacity-40 pointer-events-none grayscale" : ""}>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">{label}</label>
      <div className="relative group">
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          step={step}
          disabled={disabled}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all group-hover:bg-slate-100 disabled:bg-slate-100"
        />
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 text-xs font-bold">TPS</div>
      </div>
    </div>
  );
};

const PriceInput = ({ label, value, setValue }: any) => (
  <div className="relative">
    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
    <input
      type="number" value={value} onChange={e => setValue(Number(e.target.value))}
      className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
    />
    <span className="absolute right-2 top-3 text-[10px] text-slate-400 font-bold uppercase">{label}</span>
  </div>
);

const RangeControl = ({ label, value, setValue, min, max, suffix, desc }: any) => (
  <div>
    <div className="flex justify-between items-end mb-3">
      <div>
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <div className="text-lg font-bold text-blue-600">{value}<span className="text-sm text-slate-400 ml-1 font-medium">{suffix}</span></div>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => setValue(Number(e.target.value))} className="range-input" />
  </div>
);



const MetricCard = ({ title, value, unit, desc, icon, color = "text-slate-900" }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex items-start justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
        <span className="text-sm font-medium text-slate-400">{unit}</span>
      </div>
      <p className="text-xs text-slate-400 mt-2 bg-slate-50 inline-block px-2 py-1 rounded-md">{desc}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
  </div>
);

const TableRow = ({ label, cost, base, isBase, highlight, details }: any) => {
  const diff = cost - base;
  const percent = (diff / base) * 100;
  const isCheaper = diff < 0;

  return (
    <tr className={`group transition-colors ${highlight ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
      <td className={`px-6 py-4 text-sm font-medium ${highlight ? 'text-blue-900' : 'text-slate-700'}`}>
        <div className="flex items-center gap-2 relative">
          {label}
          {details && (
            <div className="group/info relative">
              <Info className="w-3.5 h-3.5 text-slate-300 cursor-help hover:text-blue-500 transition-colors" />
              {/* TOOLTIP POPUP */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-slate-900 text-white p-4 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 pointer-events-none">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700 pb-2">
                  Calculation Logic
                </div>
                <div className="space-y-1.5 text-xs">
                  {details.costInText > 0 && <div className="flex justify-between"><span>Text In:</span> <span className="font-mono text-emerald-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.costInText)}</span></div>}
                  {details.costInImage > 0 && <div className="flex justify-between"><span>Image In:</span> <span className="font-mono text-emerald-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.costInImage)}</span></div>}
                  {details.costInVideo > 0 && <div className="flex justify-between"><span>Video In:</span> <span className="font-mono text-emerald-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.costInVideo)}</span></div>}
                  {details.costInAudio > 0 && <div className="flex justify-between"><span>Audio In:</span> <span className="font-mono text-emerald-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.costInAudio)}</span></div>}

                  {(details.costInText > 0 || details.costInImage > 0) && (details.costOutText > 0 || details.costOutImage > 0) && <div className="border-t border-slate-700 my-1"></div>}


                  {details.costOutText > 0 && <div className="flex justify-between"><span>Text Out:</span> <span className="font-mono text-blue-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.costOutText)}</span></div>}
                  {details.costOutImage > 0 && <div className="flex justify-between"><span>Image Out:</span> <span className="font-mono text-blue-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.costOutImage)}</span></div>}
                  {details.costOutVideo > 0 && <div className="flex justify-between"><span>Video Out:</span> <span className="font-mono text-blue-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.costOutVideo)}</span></div>}
                  {details.costOutAudio > 0 && <div className="flex justify-between"><span>Audio Out:</span> <span className="font-mono text-blue-300">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(details.costOutAudio)}</span></div>}
                </div>
                <div className="mt-3 text-[9px] text-slate-500 italic leading-tight">
                  Annual Sum of (TPS × UsageTime / 1M) × Price
                </div>
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-mono text-right text-slate-600">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cost / 12)}
      </td>
      <td className="px-6 py-4 text-sm font-mono text-right text-slate-600">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cost)}
      </td>
      <td className="px-6 py-4 text-right">
        {isBase ? (
          <span className="text-xs font-bold text-slate-300 uppercase">Baseline</span>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isCheaper ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {isCheaper ? '' : '+'}{percent.toFixed(1)}%
          </span>
        )}
      </td>
    </tr>
  );
};

const BreakEvenTooltip = ({ active, payload, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
        <p className="font-bold text-slate-400 mb-2 uppercase tracking-wider">Utilization: {payload[0].payload.utilization}%</p>
        <div className="space-y-1">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-mono font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const DailyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const traffic = payload.find((p: any) => p.dataKey === 'tps') || { value: 0 };
    const capacity = payload.find((p: any) => p.dataKey === 'capacity') || { value: 0 };

    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
        <p className="font-bold text-slate-400 mb-2 uppercase tracking-wider">Time: {label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Traffic Load:</span>
            <span className="font-mono font-bold text-white">{Math.round(traffic.value).toLocaleString()} Units</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-indigo-300">Paid Capacity:</span>
            <span className="font-mono font-medium text-indigo-300">{Math.round(capacity.value).toLocaleString()} Units</span>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-700 text-slate-400 italic">
            {capacity.value > traffic.value
              ? `${Math.round(((capacity.value - traffic.value) / capacity.value) * 100)}% Wasted Capacity`
              : "100% Utilized"}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default App;