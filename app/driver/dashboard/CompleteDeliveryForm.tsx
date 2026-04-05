"use client";

import { useState, useRef } from "react";
import { completeDelivery, completePhotoDelivery } from "../actions";

export default function CompleteDeliveryForm({ orderId, customerName, deliveryInstructions }: { orderId: string, customerName?: string, deliveryInstructions?: string }) {
    const [mode, setMode] = useState<'PIN' | 'PHOTO'>(deliveryInstructions?.toLowerCase().includes('leave') ? 'PHOTO' : 'PIN');
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Camera state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoCaptured, setPhotoCaptured] = useState<Blob | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, 
                audio: false 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError("Camera access required to take delivery photo.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleTabChange = (newMode: 'PIN' | 'PHOTO') => {
        setMode(newMode);
        setError("");
        setPhotoCaptured(null);
        if (newMode === 'PHOTO') {
            startCamera();
        } else {
            stopCamera();
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        canvasRef.current.toBlob((blob) => {
            if (blob) {
                setPhotoCaptured(blob);
                stopCamera();
            }
        }, 'image/jpeg', 0.8);
    };

    const retakePhoto = () => {
        setPhotoCaptured(null);
        startCamera();
    };

    const submitDelivery = async () => {
        if (mode === 'PIN' && pin.length < 4) return;
        if (mode === 'PHOTO' && !photoCaptured) return;
        
        setLoading(true);
        setError("");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                
                try {
                    let res;
                    if (mode === 'PIN') {
                        res = await completeDelivery(orderId, pin, lat, lng);
                    } else {
                        const formData = new FormData();
                        formData.append('orderId', orderId);
                        formData.append('driverLat', lat.toString());
                        formData.append('driverLng', lng.toString());
                        if (photoCaptured) formData.append('photo', photoCaptured, 'delivery.jpg');
                        res = await completePhotoDelivery(formData);
                    }

                    if (res?.error) {
                        setError(res.error);
                        setLoading(false);
                    }
                } catch (e: any) {
                    setError("Failed to complete delivery.");
                    setLoading(false);
                }
            }, (err) => {
                setError("Location access required for Safe Drop Verification.");
                setLoading(false);
            });
        } else {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full mt-2 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-xl">
            {/* Delivery Tabs */}
            <div className="flex bg-black/50 rounded-xl p-1.5 mb-6 border border-white/5">
                <button 
                    onClick={() => handleTabChange('PIN')}
                    className={`flex-1 py-3 text-[10px] uppercase font-black tracking-[0.2em] rounded-lg transition-all italic ${mode === 'PIN' ? 'bg-[#3dd68c] text-black shadow-[0_4px_20px_rgba(61,214,140,0.2)]' : 'text-[#444] hover:text-white'}`}
                >
                    Hand to Me
                </button>
                <button 
                    onClick={() => handleTabChange('PHOTO')}
                    className={`flex-1 py-3 text-[10px] uppercase font-black tracking-[0.2em] rounded-lg transition-all italic ${mode === 'PHOTO' ? 'bg-[#e8a230] text-black shadow-[0_4px_20px_rgba(232,162,48,0.2)]' : 'text-[#444] hover:text-white'}`}
                >
                    Leave at Door
                </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4"><p className="text-red-400 text-[10px] uppercase font-bold text-center tracking-widest">{error}</p></div>}
            
            <div className="flex flex-col gap-3">
                {mode === 'PIN' ? (
                    <>
                        <input 
                            type="text" 
                            placeholder="4-DIGIT PIN" 
                            className="w-full bg-[#080808] border border-[#3dd68c]/20 rounded-2xl p-5 text-[#3dd68c] tracking-[0.8em] text-center font-black placeholder:text-[#3dd68c]/10 focus:outline-none focus:border-[#3dd68c] transition-all text-4xl bebas italic"
                            maxLength={4}
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, ''))} // Numeric only
                            disabled={loading}
                        />
                        <p className="text-[10px] text-center text-[#333] uppercase font-black tracking-[0.3em] mt-2 italic">Retrieve Access Code from {customerName || 'Recipient'}</p>
                    </>
                ) : (
                    <>
                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 flex flex-col items-center justify-center">
                            {!photoCaptured ? (
                                <>
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    {stream && (
                                        <button onClick={takePhoto} className="absolute bottom-4 w-12 h-12 bg-white rounded-full border-4 border-slate-300 shadow-xl flex items-center justify-center active:scale-95 transition-all">
                                            <span className="sr-only">Take Photo</span>
                                        </button>
                                    )}
                                    {!stream && !error && <p className="text-xs text-slate-500 animate-pulse">Loading camera...</p>}
                                </>
                            ) : (
                                <>
                                    <img src={URL.createObjectURL(photoCaptured)} className="w-full h-full object-cover" alt="Proof" />
                                    <button onClick={retakePhoto} className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold px-3 py-1 rounded shadow-lg border border-white/10">Retake</button>
                                </>
                            )}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <p className="text-[9px] text-center text-primary/70 uppercase font-bold tracking-widest">Photo will be sent to customer</p>
                    </>
                )}

                <button 
                    onClick={submitDelivery}
                    disabled={loading || (mode === 'PIN' && pin.length < 4) || (mode === 'PHOTO' && !photoCaptured)}
                    className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-30 disabled:scale-100 mt-4 italic
                        ${mode === 'PIN' ? 'bg-[#3dd68c] text-black hover:bg-white shadow-[0_10px_30px_rgba(61,214,140,0.2)]' : 'bg-[#e8a230] text-black hover:bg-white shadow-[0_10px_30_rgba(232,162,48,0.2)]'}`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            Finalizing Mission...
                        </div>
                    ) : "Verify & Complete Mission"}
                </button>
            </div>
        </div>
    );
}
