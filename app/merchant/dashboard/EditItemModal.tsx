"use client";

import { useState, useActionState } from "react";
import { updateMenuItem } from "../actions";
import { ImageIcon, Sparkles, X } from "lucide-react";

interface EditItemModalProps {
    item: any;
    onClose: () => void;
}

export default function EditItemModal({ item, onClose }: EditItemModalProps) {
    const [state, formAction, isPending] = useActionState(updateMenuItem, { message: "" });
    const [preview, setPreview] = useState(item.imageUrl);
    const [isSpecial, setIsSpecial] = useState(Boolean(item.saleUntil && new Date(item.saleUntil) > new Date()));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreview(URL.createObjectURL(file));
    };

    if (state.success) onClose();

    return (
        <>
            <style>{`
                .edit-menu-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 18px;
                    background: rgba(0,0,0,.76);
                    backdrop-filter: blur(8px);
                }
                .edit-menu-modal {
                    width: min(920px, 100%);
                    max-height: calc(100vh - 36px);
                    overflow: auto;
                    background: linear-gradient(180deg, #111713 0%, #0d110f 100%);
                    border: 1px solid #202a24;
                    border-radius: 18px;
                    box-shadow: 0 28px 90px rgba(0,0,0,.55);
                }
                .edit-menu-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 18px;
                    padding: 22px 24px 16px;
                    border-bottom: 1px solid #202a24;
                }
                .edit-menu-kicker {
                    color: #f97316;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .14em;
                    text-transform: uppercase;
                    margin-bottom: 7px;
                }
                .edit-menu-title {
                    margin: 0;
                    color: #fff;
                    font-size: 28px;
                    line-height: 1.05;
                    font-weight: 950;
                    letter-spacing: -.02em;
                }
                .edit-menu-close {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    border: 1px solid #28342d;
                    background: rgba(255,255,255,.035);
                    color: #aab4ae;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .edit-menu-body {
                    padding: 22px 24px 24px;
                }
                .edit-menu-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
                    gap: 18px;
                    align-items: start;
                }
                .edit-menu-fields {
                    display: grid;
                    gap: 14px;
                }
                .edit-menu-two {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .edit-menu-field label {
                    display: block;
                    color: #7e8a84;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .13em;
                    text-transform: uppercase;
                    margin-bottom: 7px;
                }
                .edit-menu-field input,
                .edit-menu-field textarea,
                .edit-menu-field select {
                    width: 100%;
                    border-radius: 10px;
                    border: 1px solid #26312c;
                    background: #0b0f0d;
                    color: #f4f7f5;
                    padding: 12px 13px;
                    font-size: 14px;
                    outline: none;
                }
                .edit-menu-field textarea {
                    min-height: 118px;
                    resize: vertical;
                    line-height: 1.5;
                }
                .edit-menu-field input:focus,
                .edit-menu-field textarea:focus,
                .edit-menu-field select:focus {
                    border-color: rgba(249,115,22,.55);
                    box-shadow: 0 0 0 3px rgba(249,115,22,.08);
                }
                .edit-menu-image {
                    border: 1px dashed #344139;
                    border-radius: 14px;
                    min-height: 260px;
                    overflow: hidden;
                    background: #0b0f0d;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #748079;
                    position: relative;
                }
                .edit-menu-image img {
                    width: 100%;
                    height: 100%;
                    min-height: 260px;
                    object-fit: cover;
                    display: block;
                }
                .edit-menu-image-empty {
                    display: grid;
                    justify-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: .1em;
                    text-transform: uppercase;
                }
                .edit-menu-special {
                    border: 1px solid rgba(249,115,22,.22);
                    background: rgba(249,115,22,.06);
                    border-radius: 12px;
                    padding: 13px;
                    display: grid;
                    gap: 12px;
                }
                .edit-menu-check {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    color: #f3f7f4;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                }
                .edit-menu-check input {
                    margin-top: 2px;
                    accent-color: #f97316;
                }
                .edit-menu-actions {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    margin-top: 18px;
                    padding-top: 18px;
                    border-top: 1px solid #202a24;
                }
                .edit-menu-btn {
                    min-height: 44px;
                    border-radius: 10px;
                    border: 1px solid #28342d;
                    background: rgba(255,255,255,.035);
                    color: #d7dfda;
                    padding: 0 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: .11em;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                .edit-menu-btn.primary {
                    background: #f97316;
                    color: #071009;
                    border-color: #f97316;
                    min-width: 170px;
                }
                .edit-menu-msg {
                    margin-top: 12px;
                    font-size: 12px;
                    font-weight: 800;
                    color: #3dd68c;
                }
                .edit-menu-msg.error {
                    color: #f87171;
                }
                @media (max-width: 820px) {
                    .edit-menu-grid,
                    .edit-menu-two {
                        grid-template-columns: 1fr;
                    }
                    .edit-menu-actions {
                        flex-direction: column-reverse;
                    }
                    .edit-menu-btn {
                        width: 100%;
                    }
                }
            `}</style>
            <div className="edit-menu-overlay" role="dialog" aria-modal="true" aria-label={`Edit ${item.name}`}>
                <div className="edit-menu-modal">
                    <div className="edit-menu-header">
                        <div>
                            <div className="edit-menu-kicker">Menu item</div>
                            <h2 className="edit-menu-title">Edit item</h2>
                        </div>
                        <button type="button" onClick={onClose} className="edit-menu-close" aria-label="Close editor">
                            <X size={18} />
                        </button>
                    </div>

                    <form action={formAction} className="edit-menu-body">
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="currentImageUrl" value={item.imageUrl || ""} />

                        <div className="edit-menu-grid">
                            <div className="edit-menu-fields">
                                <div className="edit-menu-two">
                                    <div className="edit-menu-field">
                                        <label>Item name</label>
                                        <input name="name" defaultValue={item.name} placeholder="Veggie Combo" required />
                                    </div>
                                    <div className="edit-menu-field">
                                        <label>Price</label>
                                        <input name="price" type="number" step="0.01" defaultValue={item.price} placeholder="13.99" required />
                                    </div>
                                </div>

                                <div className="edit-menu-two">
                                    <div className="edit-menu-field">
                                        <label>Category</label>
                                        <input name="category" defaultValue={item.category || ""} placeholder="Combos, Sides, Drinks" />
                                    </div>
                                    <div className="edit-menu-field">
                                        <label>Ingredients</label>
                                        <input name="ingredients" defaultValue={item.ingredients?.join(", ")} placeholder="rice, beans, plantain" />
                                    </div>
                                </div>

                                <div className="edit-menu-field">
                                    <label>Description</label>
                                    <textarea name="description" defaultValue={item.description || ""} placeholder="Short customer-facing description." />
                                </div>

                                <div className="edit-menu-special">
                                    <label className="edit-menu-check">
                                        <input type="checkbox" name="isSpecial" checked={isSpecial} onChange={(event) => setIsSpecial(event.target.checked)} />
                                        <span>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                                                <Sparkles size={14} color="#f97316" /> Promote as local special
                                            </span>
                                            <span style={{ display: "block", color: "#8e9993", fontSize: 12, fontWeight: 650, lineHeight: 1.45, marginTop: 3 }}>
                                                Shows above the menu for customers browsing this restaurant in the delivery area.
                                            </span>
                                        </span>
                                    </label>
                                    {isSpecial && (
                                        <div className="edit-menu-two">
                                            <div className="edit-menu-field">
                                                <label>Original price</label>
                                                <input name="originalPrice" type="number" step="0.01" defaultValue={item.originalPrice || ""} placeholder="Optional" />
                                            </div>
                                            <div className="edit-menu-field">
                                                <label>Special duration</label>
                                                <select name="specialHours" defaultValue="24">
                                                    <option value="6">6 hours</option>
                                                    <option value="12">12 hours</option>
                                                    <option value="24">24 hours</option>
                                                    <option value="48">48 hours</option>
                                                    <option value="168">7 days</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="edit-menu-field">
                                <label>Item photo</label>
                                <label className="edit-menu-image">
                                    {preview ? (
                                        <img src={preview} alt="Preview" />
                                    ) : (
                                        <span className="edit-menu-image-empty">
                                            <ImageIcon size={24} />
                                            Add photo
                                        </span>
                                    )}
                                    <input type="file" name="image" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        {state.message && (
                            <p className={`edit-menu-msg${state.error ? " error" : ""}`}>{state.message}</p>
                        )}

                        <div className="edit-menu-actions">
                            <button type="button" onClick={onClose} className="edit-menu-btn">
                                Cancel
                            </button>
                            <button type="submit" disabled={isPending} className="edit-menu-btn primary">
                                {isPending ? "Saving" : "Update item"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
