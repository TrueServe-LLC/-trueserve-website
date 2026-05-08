"use client";

import { useState } from "react";
import { archiveMenuItem, toggleItemStock } from "../actions";
import EditItemModal from "./EditItemModal";
import { AlertTriangle, CheckCircle2, ImageIcon, Pencil, Sparkles, Trash2 } from "lucide-react";

interface MenuRowProps {
    item: any;
    outOfStockIngredients: string[];
}

export default function MenuRow({ item, outOfStockIngredients }: MenuRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const missingIngredients = (item.ingredients || []).filter((ing: string) =>
        outOfStockIngredients.includes(ing.toLowerCase())
    );
    const isSpecial = Boolean(item.saleUntil && new Date(item.saleUntil) > new Date());
    const status = String(item.status || "APPROVED");

    const handleToggleStock = async () => {
        setIsUpdating(true);
        try {
            const result = await toggleItemStock(item.id, item.isAvailable);
            if ((result as any)?.error) throw new Error((result as any).error);
        } catch (e: any) {
            alert(e?.message || "Failed to update stock.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm(`Remove "${item.name}" from the public menu? Existing order history will stay intact.`)) return;
        setIsRemoving(true);
        try {
            const result = await archiveMenuItem(item.id);
            if ((result as any)?.error) throw new Error((result as any).error);
        } catch (e: any) {
            alert(e?.message || "Failed to remove item.");
            setIsRemoving(false);
        }
    };

    return (
        <>
            <style>{`
                .menu-row-card {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto;
                    gap: 16px;
                    align-items: center;
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 12px;
                    padding: 13px;
                    transition: border-color .15s, background .15s, opacity .15s;
                }
                .menu-row-card:hover {
                    border-color: rgba(249,115,22,.26);
                    background: #161d1a;
                }
                .menu-row-card.unavailable {
                    opacity: .68;
                    background: rgba(20,26,24,.72);
                }
                .menu-row-main {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    min-width: 0;
                }
                .menu-row-image {
                    width: 62px;
                    height: 62px;
                    border-radius: 10px;
                    overflow: hidden;
                    flex-shrink: 0;
                    background: #101513;
                    border: 1px solid #222b27;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #59645f;
                    position: relative;
                }
                .menu-row-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .menu-row-image .sold-out-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(5,7,8,.72);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #f87171;
                    font-size: 10px;
                    font-weight: 950;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                }
                .menu-row-copy {
                    min-width: 0;
                }
                .menu-row-title {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 5px;
                }
                .menu-row-title h3 {
                    color: #f5f7f6;
                    font-size: 16px;
                    font-weight: 900;
                    line-height: 1.15;
                    margin: 0;
                    letter-spacing: -.01em;
                }
                .menu-row-desc {
                    color: #8e9993;
                    font-size: 12px;
                    line-height: 1.45;
                    max-width: 780px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                .menu-row-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 8px;
                }
                .menu-row-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    border-radius: 999px;
                    padding: 4px 8px;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: .1em;
                    text-transform: uppercase;
                    border: 1px solid #26312c;
                    color: #9ea7a2;
                    background: rgba(255,255,255,.025);
                }
                .menu-row-pill.good {
                    color: #3dd68c;
                    border-color: rgba(61,214,140,.25);
                    background: rgba(61,214,140,.08);
                }
                .menu-row-pill.warn {
                    color: #f97316;
                    border-color: rgba(249,115,22,.26);
                    background: rgba(249,115,22,.08);
                }
                .menu-row-pill.bad {
                    color: #f87171;
                    border-color: rgba(248,113,113,.28);
                    background: rgba(248,113,113,.08);
                }
                .menu-row-side {
                    display: grid;
                    justify-items: end;
                    gap: 10px;
                }
                .menu-row-price {
                    color: #fff;
                    font-size: 22px;
                    line-height: 1;
                    font-weight: 950;
                    letter-spacing: -.02em;
                }
                .menu-row-price-wrap {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }
                .menu-row-original {
                    color: #747c78;
                    font-size: 12px;
                    font-weight: 800;
                    text-decoration: line-through;
                }
                .menu-row-actions {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    flex-wrap: wrap;
                    gap: 7px;
                }
                .menu-row-btn {
                    min-height: 32px;
                    border-radius: 8px;
                    border: 1px solid #28342d;
                    background: rgba(255,255,255,.035);
                    color: #d7dfda;
                    padding: 0 10px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .09em;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                .menu-row-btn.orange {
                    color: #f97316;
                    border-color: rgba(249,115,22,.28);
                    background: rgba(249,115,22,.07);
                }
                .menu-row-btn.green {
                    color: #3dd68c;
                    border-color: rgba(61,214,140,.25);
                    background: rgba(61,214,140,.08);
                }
                .menu-row-btn.red {
                    color: #f87171;
                    border-color: rgba(248,113,113,.25);
                    background: rgba(248,113,113,.07);
                }
                .menu-row-btn:disabled {
                    opacity: .55;
                    cursor: wait;
                }
                @media (max-width: 760px) {
                    .menu-row-card {
                        grid-template-columns: 1fr;
                    }
                    .menu-row-side {
                        justify-items: stretch;
                    }
                    .menu-row-actions {
                        justify-content: stretch;
                    }
                    .menu-row-btn {
                        flex: 1;
                        justify-content: center;
                    }
                    .menu-row-price-wrap {
                        justify-content: space-between;
                    }
                }
            `}</style>
            <div className={`menu-row-card${item.isAvailable === false ? " unavailable" : ""}`}>
                <div className="menu-row-main">
                    <div className="menu-row-image">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <ImageIcon size={20} aria-hidden="true" />}
                        {item.isAvailable === false && <span className="sold-out-overlay">Sold out</span>}
                    </div>
                    <div className="menu-row-copy">
                        <div className="menu-row-title">
                            <h3>{item.name}</h3>
                            {isSpecial && <span className="menu-row-pill warn"><Sparkles size={11} /> Special</span>}
                            {status === "APPROVED" && <span className="menu-row-pill good"><CheckCircle2 size={11} /> Approved</span>}
                            {status !== "APPROVED" && status !== "ARCHIVED" && <span className="menu-row-pill warn">{status}</span>}
                            {item.isAvailable === false && <span className="menu-row-pill bad">Unavailable</span>}
                        </div>
                        {item.description ? <div className="menu-row-desc">{item.description}</div> : null}
                        <div className="menu-row-meta">
                            {item.category ? <span className="menu-row-pill">{item.category}</span> : null}
                            {missingIngredients.length > 0 && (
                                <span className="menu-row-pill bad">
                                    <AlertTriangle size={11} /> Missing {missingIngredients.join(", ")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="menu-row-side">
                    <div className="menu-row-price-wrap">
                        {isSpecial && item.originalPrice ? <span className="menu-row-original">${Number(item.originalPrice).toFixed(2)}</span> : null}
                        <span className="menu-row-price">${Number(item.price).toFixed(2)}</span>
                    </div>
                    <div className="menu-row-actions">
                        <button type="button" onClick={() => setIsEditing(true)} className="menu-row-btn">
                            <Pencil size={13} /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleStock}
                            disabled={isUpdating}
                            className={`menu-row-btn ${item.isAvailable === false ? "green" : "orange"}`}
                        >
                            {item.isAvailable === false ? "Restock" : "Mark sold out"}
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isRemoving}
                            className="menu-row-btn red"
                        >
                            <Trash2 size={13} /> {isRemoving ? "Removing" : "Remove"}
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <EditItemModal item={item} onClose={() => setIsEditing(false)} />
                )}
            </div>
        </>
    );
}
