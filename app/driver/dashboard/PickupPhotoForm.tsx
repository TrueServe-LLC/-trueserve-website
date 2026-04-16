"use client";

import { useState, useRef } from "react";
import { confirmPickupWithPhoto } from "../actions";

export default function PickupPhotoForm({ orderId, restaurantName }: { orderId: string; restaurantName?: string }) {
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Camera state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoCaptured, setPhotoCaptured] = useState<Blob | null>(null);

    const startCamera = async () => {
        try {
            setShowCamera(true);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError("Camera access required. Please allow camera permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const context = canvasRef.current.getContext("2d");
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        canvasRef.current.toBlob(
            (blob) => {
                if (blob) {
                    setPhotoCaptured(blob);
                    stopCamera();
                }
            },
            "image/jpeg",
            0.8
        );
    };

    const retakePhoto = () => {
        setPhotoCaptured(null);
        startCamera();
    };

    const submitPickup = async () => {
        if (!photoCaptured) return;
        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("orderId", orderId);
            formData.append("photo", photoCaptured, "pickup.jpg");

            const res = await confirmPickupWithPhoto(formData);
            if (res?.error) {
                setError(res.error);
                setLoading(false);
            }
            // Success: page will revalidate automatically
        } catch (e: any) {
            setError("Failed to confirm pickup.");
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-[10px] uppercase font-bold text-center tracking-widest">{error}</p>
                </div>
            )}

            {!showCamera ? (
                <button
                    onClick={startCamera}
                    className="badge-emerald w-full py-5 text-[10px] flex items-center justify-center gap-3 group"
                >
                    <span className="text-lg group-hover:scale-110 transition-transform">📸</span>
                    Confirm Pickup with Photo
                </button>
            ) : (
                <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 space-y-4 animate-fade-in-up">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🏎️</span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316] italic">Pickup Verification</p>
                                <p className="text-[9px] text-[#444] font-black uppercase mt-0.5 tracking-widest italic">
                                    Secure photo: {restaurantName || "the restaurant"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                stopCamera();
                                setShowCamera(false);
                                setPhotoCaptured(null);
                            }}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors border border-white/5"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Camera Preview */}
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 flex flex-col items-center justify-center">
                        {!photoCaptured ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                {/* Crosshair overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/60 rounded-tl-lg"></div>
                                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500/60 rounded-tr-lg"></div>
                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500/60 rounded-bl-lg"></div>
                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500/60 rounded-br-lg"></div>
                                </div>
                                {stream && (
                                    <button
                                        onClick={takePhoto}
                                        className="absolute bottom-6 w-16 h-16 bg-[#f97316] rounded-full border-4 border-white shadow-[0_0_40px_rgba(249,115,22,0.4)] flex items-center justify-center active:scale-95 transition-all hover:bg-white"
                                    >
                                        <span className="sr-only">Take Photo</span>
                                        <div className="w-6 h-6 bg-black rounded-full"></div>
                                    </button>
                                )}
                                {!stream && !error && (
                                    <p className="text-xs text-slate-500 animate-pulse">Loading camera...</p>
                                )}
                            </>
                        ) : (
                            <>
                                <img
                                    src={URL.createObjectURL(photoCaptured)}
                                    className="w-full h-full object-cover"
                                    alt="Pickup Proof"
                                />
                                {/* Verified overlay */}
                                <div className="absolute top-3 left-3 bg-emerald-500/90 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                                    <span>✓</span> Photo Captured
                                </div>
                                <button
                                    onClick={retakePhoto}
                                    className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg shadow-lg border border-white/10 hover:bg-black/80 transition-colors"
                                >
                                    Retake
                                </button>
                            </>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Checklist hint */}
                    <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <span className="text-lg mt-0.5 italic">📋</span>
                        <div className="text-[9px] text-[#444] font-black uppercase tracking-[0.2em] space-y-2 italic">
                            <p className="text-[#3dd68c]">Scan Protocol Verification:</p>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#3dd68c]"></span> Sealed bag / container</p>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#3dd68c]"></span> Restaurant counter or branded bag</p>
                            <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#3dd68c]"></span> All items accounted for</p>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={submitPickup}
                        disabled={loading || !photoCaptured}
                        className="w-full py-5 rounded-2xl bg-[#3dd68c] text-black font-black uppercase tracking-[0.3em] text-[11px] 
                            disabled:opacity-30 disabled:scale-100 hover:bg-white active:scale-95 
                            transition-all shadow-[0_10px_30px_rgba(61,214,140,0.2)] flex items-center justify-center gap-3 italic"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                Transmitting...
                            </>
                        ) : (
                            <>
                                <span>🚀</span> Secured — Broadcast to Fleet
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
