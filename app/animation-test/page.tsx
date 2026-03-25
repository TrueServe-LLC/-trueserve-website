"use client";
import { useState } from "react";
import OrderConfirmAnimation from "@/components/OrderConfirmAnimation";

export default function AnimationTestPage() {
    const [show, setShow] = useState(false);

    return (
        <div style={{ background: "#09090b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {show ? (
                <OrderConfirmAnimation
                    restaurantName="The Golden Fork"
                    onComplete={() => setShow(false)}
                />
            ) : (
                <button
                    id="play-animation"
                    onClick={() => setShow(true)}
                    style={{
                        background: "#f5a623",
                        color: "#09090b",
                        border: "none",
                        borderRadius: 12,
                        padding: "16px 40px",
                        fontSize: 18,
                        fontWeight: 900,
                        cursor: "pointer",
                        letterSpacing: "0.05em"
                    }}
                >
                    ▶ Play Animation
                </button>
            )}
        </div>
    );
}
