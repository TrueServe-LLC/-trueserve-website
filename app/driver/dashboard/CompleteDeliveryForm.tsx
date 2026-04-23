"use client";

import { useState, useRef } from "react";
import { completeDelivery, completePhotoDelivery } from "../actions";

export default function CompleteDeliveryForm({ orderId, customerName, deliveryInstructions }: { orderId: string, customerName?: string, deliveryInstructions?: string }) {
    const [mode, setMode] = useState<'PIN' | 'PHOTO'>(deliveryInstructions?.toLowerCase().includes('leave') ? 'PHOTO' : 'PIN');
    const [digits, setDigits] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    // Camera state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoCaptured, setPhotoCaptured] = useState<Blob | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch {
            setError("Camera access required to take delivery photo.");
        }
    };

    const stopCamera = () => {
        if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    };

    const handleTabChange = (newMode: 'PIN' | 'PHOTO') => {
        setMode(newMode);
        setError("");
        setPhotoCaptured(null);
        setDigits([]);
        if (newMode === 'PHOTO') startCamera();
        else stopCamera();
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx?.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob(blob => { if (blob) { setPhotoCaptured(blob); stopCamera(); } }, 'image/jpeg', 0.8);
    };

    const enterDigit = (d: string) => {
        if (digits.length < 4) setDigits(prev => [...prev, d]);
    };

    const delDigit = () => setDigits(prev => prev.slice(0, -1));

    const submitDelivery = async () => {
        if (mode === 'PIN' && digits.length < 4) return;
        if (mode === 'PHOTO' && !photoCaptured) return;
        setLoading(true);
        setError("");

        const doSubmit = async (lat: number, lng: number) => {
            try {
                let res;
                if (mode === 'PIN') {
                    res = await completeDelivery(orderId, digits.join(""), lat, lng);
                } else {
                    const fd = new FormData();
                    fd.append('orderId', orderId);
                    fd.append('driverLat', lat.toString());
                    fd.append('driverLng', lng.toString());
                    if (photoCaptured) fd.append('photo', photoCaptured, 'delivery.jpg');
                    res = await completePhotoDelivery(fd);
                }
                if (res?.error) { setError(res.error); setLoading(false); }
                else setDone(true);
            } catch {
                setError("Failed to complete delivery."); setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => doSubmit(pos.coords.latitude, pos.coords.longitude),
                () => { setError("Location access required for Safe Drop Verification."); setLoading(false); }
            );
        } else {
            setError("Geolocation not supported."); setLoading(false);
        }
    };

    const numpad = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

    return (
        <div style={{
            background: "#111418",
            borderRadius: 16,
            padding: 20,
            width: "100%",
            marginTop: 8,
            border: "1px solid #1e2530",
        }}>
            {/* Status bar */}
            <div style={{
                background: "#0a2e22",
                border: "1px solid #1a5c3e",
                borderRadius: 8,
                padding: "8px 16px",
                textAlign: "center",
                marginBottom: 16,
            }}>
                <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    color: "#2ee8a0",
                    textTransform: "uppercase",
                }}>
                    ● PICKED UP — HEADING TO CUSTOMER
                </span>
            </div>

            {/* Toggle */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "#1a1d22",
                borderRadius: 10,
                padding: 4,
                gap: 4,
                marginBottom: 16,
            }}>
                {(['PIN', 'PHOTO'] as const).map((m, i) => {
                    const label = m === 'PIN' ? 'HAND TO ME' : 'LEAVE AT DOOR';
                    const active = mode === m;
                    return (
                        <button
                            key={m}
                            type="button"
                            onClick={() => handleTabChange(m)}
                            style={{
                                fontFamily: "'Barlow Condensed', sans-serif",
                                fontSize: 13,
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                padding: "10px",
                                border: active ? "1px solid #2ee8a0" : "1px solid transparent",
                                borderRadius: 7,
                                cursor: "pointer",
                                background: active ? "#1a3d2e" : "transparent",
                                color: active ? "#2ee8a0" : "#5a6170",
                                transition: "all 0.15s",
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                    <p style={{ color: "#f87171", fontSize: 10, fontWeight: 700, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.12em" }}>{error}</p>
                </div>
            )}

            {mode === 'PIN' ? (
                <div style={{
                    background: "#0d1117",
                    border: "1px solid #1e2530",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 12,
                    textAlign: "center",
                }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "#3a4555", marginBottom: 14, textTransform: "uppercase" }}>
                        4-DIGIT PIN
                    </div>

                    {/* PIN boxes */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
                        {[0,1,2,3].map(i => {
                            const filled = i < digits.length;
                            const active = i === digits.length;
                            return (
                                <div key={i} style={{
                                    width: 56, height: 68,
                                    background: "#141820",
                                    border: `2px solid ${filled ? "#2ee8a0" : active ? "#5ee8b0" : "#2a3040"}`,
                                    borderRadius: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "'Barlow Condensed', sans-serif",
                                    fontSize: 36,
                                    fontWeight: 800,
                                    color: "#2ee8a0",
                                    transition: "border-color 0.15s",
                                    userSelect: "none",
                                }}>
                                    {digits[i] ?? "\u00a0"}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#3a4555", textTransform: "uppercase", marginBottom: 14 }}>
                        RETRIEVE ACCESS CODE FROM {customerName?.toUpperCase() || 'RECIPIENT'}
                    </div>

                    {/* Numpad */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        {numpad.map((key, i) => {
                            if (key === '') return <div key={i} />;
                            const isDel = key === '⌫';
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => isDel ? delDigit() : enterDigit(key)}
                                    style={{
                                        background: "#1a1d22",
                                        border: "1px solid #2a3040",
                                        borderRadius: 8,
                                        padding: "13px",
                                        fontFamily: "'Barlow Condensed', sans-serif",
                                        fontSize: isDel ? 14 : 20,
                                        fontWeight: 700,
                                        color: isDel ? "#5a6170" : "#c8d4e0",
                                        cursor: "pointer",
                                        transition: "background 0.1s",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#22262e")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "#1a1d22")}
                                >
                                    {key}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#080808", borderRadius: 12, overflow: "hidden", border: "1px solid #1e2530", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {!photoCaptured ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                {stream && (
                                    <button
                                        type="button"
                                        onClick={takePhoto}
                                        style={{ position: "absolute", bottom: 20, width: 64, height: 64, background: "#f97316", borderRadius: "50%", border: "4px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >
                                        <div style={{ width: 22, height: 22, background: "black", borderRadius: "50%" }} />
                                    </button>
                                )}
                                {!stream && !error && (
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.1)", fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>INITIATING UPLINK...</span>
                                )}
                            </>
                        ) : (
                            <>
                                <img src={URL.createObjectURL(photoCaptured)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Proof" />
                                <button
                                    type="button"
                                    onClick={() => { setPhotoCaptured(null); startCamera(); }}
                                    style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}
                                >
                                    Retake
                                </button>
                            </>
                        )}
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                    </div>
                </div>
            )}

            {/* Verify button */}
            <button
                type="button"
                onClick={submitDelivery}
                disabled={loading || done || (mode === 'PIN' && digits.length < 4) || (mode === 'PHOTO' && !photoCaptured)}
                style={{
                    width: "100%",
                    padding: "15px",
                    background: done ? "#2ee8a0" : (mode === 'PIN' && digits.length < 4) || (mode === 'PHOTO' && !photoCaptured) ? "#1a3d2e" : "#2ee8a0",
                    color: done ? "#071a12" : (mode === 'PIN' && digits.length < 4) || (mode === 'PHOTO' && !photoCaptured) ? "#2a5540" : "#071a12",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    border: "none",
                    borderRadius: 10,
                    cursor: (loading || done || (mode === 'PIN' && digits.length < 4) || (mode === 'PHOTO' && !photoCaptured)) ? "not-allowed" : "pointer",
                    transition: "background 0.15s, transform 0.1s",
                }}
            >
                {loading ? "FINALIZING MISSION..." : done ? "MISSION COMPLETE ✓" : "VERIFY & COMPLETE MISSION"}
            </button>
        </div>
    );
}
