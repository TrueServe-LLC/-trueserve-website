"use client";

import { useActionState, useState } from "react";
import { addMenuItem, MerchantActionState } from "../actions";
import { Plus, Sparkles, X } from "lucide-react";

const initialState: MerchantActionState = {
    message: "",
    success: false,
    error: false,
};

export default function AddItemForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSpecial, setIsSpecial] = useState(false);
    const [state, formAction, isPending] = useActionState(addMenuItem, initialState);

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="menu-add-button">
                <Plus size={15} /> Add menu item
                <style>{`
                    .menu-add-button {
                        min-height: 42px;
                        border-radius: 10px;
                        border: 1px solid #f97316;
                        background: #f97316;
                        color: #071009;
                        padding: 0 15px;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 11px;
                        font-weight: 900;
                        letter-spacing: .11em;
                        text-transform: uppercase;
                        cursor: pointer;
                    }
                `}</style>
            </button>
        );
    }

    return (
        <>
            <style>{`
                .add-menu-card {
                    background: linear-gradient(180deg, #111713 0%, #0d110f 100%);
                    border: 1px solid #202a24;
                    border-radius: 14px;
                    padding: 16px;
                    margin-bottom: 8px;
                }
                .add-menu-head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 14px;
                }
                .add-menu-kicker {
                    color: #f97316;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .14em;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                }
                .add-menu-head h3 {
                    color: #fff;
                    margin: 0;
                    font-size: 20px;
                    line-height: 1.1;
                    font-weight: 950;
                    letter-spacing: -.02em;
                }
                .add-menu-close {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    border: 1px solid #28342d;
                    background: rgba(255,255,255,.035);
                    color: #aab4ae;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .add-menu-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }
                .add-menu-field.full {
                    grid-column: 1 / -1;
                }
                .add-menu-field label {
                    display: block;
                    color: #7e8a84;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .13em;
                    text-transform: uppercase;
                    margin-bottom: 7px;
                }
                .add-menu-field input,
                .add-menu-field textarea,
                .add-menu-field select {
                    width: 100%;
                    border-radius: 10px;
                    border: 1px solid #26312c;
                    background: #0b0f0d;
                    color: #f4f7f5;
                    padding: 12px 13px;
                    font-size: 14px;
                    outline: none;
                }
                .add-menu-field textarea {
                    min-height: 92px;
                    resize: vertical;
                }
                .add-menu-special {
                    grid-column: 1 / -1;
                    border: 1px solid rgba(249,115,22,.22);
                    background: rgba(249,115,22,.06);
                    border-radius: 12px;
                    padding: 13px;
                    display: grid;
                    gap: 12px;
                }
                .add-menu-check {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    color: #f3f7f4;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                }
                .add-menu-check input {
                    margin-top: 2px;
                    accent-color: #f97316;
                }
                .add-menu-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #202a24;
                }
                .add-menu-btn {
                    min-height: 42px;
                    border-radius: 10px;
                    border: 1px solid #28342d;
                    background: rgba(255,255,255,.035);
                    color: #d7dfda;
                    padding: 0 14px;
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
                .add-menu-btn.primary {
                    background: #f97316;
                    color: #071009;
                    border-color: #f97316;
                }
                .add-menu-msg {
                    margin-bottom: 12px;
                    border-radius: 10px;
                    padding: 11px 12px;
                    font-size: 12px;
                    font-weight: 800;
                    border: 1px solid rgba(61,214,140,.25);
                    background: rgba(61,214,140,.08);
                    color: #3dd68c;
                }
                .add-menu-msg.error {
                    border-color: rgba(248,113,113,.25);
                    background: rgba(248,113,113,.08);
                    color: #f87171;
                }
                @media (max-width: 720px) {
                    .add-menu-grid {
                        grid-template-columns: 1fr;
                    }
                    .add-menu-actions {
                        flex-direction: column-reverse;
                    }
                    .add-menu-btn {
                        width: 100%;
                    }
                }
            `}</style>
            <div className="add-menu-card">
                <div className="add-menu-head">
                    <div>
                        <div className="add-menu-kicker">New menu item</div>
                        <h3>Add an item or special</h3>
                    </div>
                    <button type="button" onClick={() => setIsOpen(false)} className="add-menu-close" aria-label="Close add item form">
                        <X size={16} />
                    </button>
                </div>

                {state.message && (
                    <div className={`add-menu-msg${state.error ? " error" : ""}`}>{state.message}</div>
                )}

                <form action={formAction}>
                    <div className="add-menu-grid">
                        <div className="add-menu-field">
                            <label>Item name</label>
                            <input name="name" type="text" required placeholder="Jerk Chicken Combo" />
                        </div>
                        <div className="add-menu-field">
                            <label>Price</label>
                            <input name="price" type="number" step="0.01" required placeholder="15.99" />
                        </div>
                        <div className="add-menu-field">
                            <label>Category</label>
                            <input name="category" type="text" placeholder="Combos, Sides, Drinks" />
                        </div>
                        <div className="add-menu-field">
                            <label>Food photo</label>
                            <input name="image" type="file" accept="image/*" />
                        </div>
                        <div className="add-menu-field full">
                            <label>Description</label>
                            <textarea name="description" placeholder="Short customer-facing description." />
                        </div>
                        <div className="add-menu-special">
                            <label className="add-menu-check">
                                <input type="checkbox" name="isSpecial" checked={isSpecial} onChange={(event) => setIsSpecial(event.target.checked)} />
                                <span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                                        <Sparkles size={14} color="#f97316" /> Promote as local special
                                    </span>
                                    <span style={{ display: "block", color: "#8e9993", fontSize: 12, fontWeight: 650, lineHeight: 1.45, marginTop: 3 }}>
                                        This appears above the menu for nearby customers browsing the restaurant.
                                    </span>
                                </span>
                            </label>
                            {isSpecial && (
                                <div className="add-menu-grid">
                                    <div className="add-menu-field">
                                        <label>Original price</label>
                                        <input name="originalPrice" type="number" step="0.01" placeholder="Optional" />
                                    </div>
                                    <div className="add-menu-field">
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

                    <div className="add-menu-actions">
                        <button type="button" onClick={() => setIsOpen(false)} className="add-menu-btn">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending} className="add-menu-btn primary">
                            {isPending ? "Adding" : "Save item"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
