"use client";
import "./Partnership.css";
import { Check } from 'lucide-react';
import { ChevronRight } from 'lucide-react';


export default function Partnership({ onSelectRole }) {
    return (
        <section className="partner">
            <h2>
                Three Ways to Win with <span>Cumma 2.0</span>
            </h2>
            <p className="subtitle">
                Choose your partnership path and lock in founding benefits
            </p>

            <div className="cards-row">
                {/* Left */}
                <div className="plan-card orange">
                    <h4>Strategic Partnership</h4>
                    <p>Everything you need to supercharge your partnership.</p>
                    <h3>
                        Co-Build India's Infra <span>/ All time</span>
                    </h3>

                    <div className="list">
                        <p>What’s included</p>
                        <ul>
                            <li><Check /> Co-branding</li>
                            <li><Check /> Data Access</li>
                            <li><Check /> Joint PR</li>
                            <li><Check /> API access</li>
                        </ul>
                    </div>
<div className="cards-row">
                    <button onClick={() => onSelectRole('strategic')} className="btn orange-btn"><span className="btn-text">Subscribe</span> < ChevronRight /></button>
                    </div>
                </div>

                {/* Center */}
                <div className="plan-card green active">
                    <h4>Facility Trial</h4>
                    <p>Unlock a new level of your Facilities productivity.</p>
                    <h3>
                        90 <span>Days Trial</span> <span className="tag green-tag">Free</span>
                    </h3>

                    <div className="list">
                        <p>What’s included</p>
                        <ul>
                            <li><Check /> Dashboard</li>
                            <li><Check /> Listing & Managing</li>
                            <li><Check /> Bookings</li>
                            <li><Check /> Analytics</li>
                            <li><Check /> High-end clients</li>
                            <li><Check /> Custom Extensions</li>
                            <li><Check /> Support Tools</li>
                        </ul>
                    </div>

                    <button onClick={() => onSelectRole('facility')} className="btn green-btn"><span className="btn-text">Start Trial </span>< ChevronRight /></button>
                </div>

                {/* Right */}
                <div className="plan-card purple">
                    <h4>Affiliate Program</h4>
                    <p>Everything you need to supercharge your Commission.</p>
                    <h3>
                        20% <span>/ Life Time</span>{" "}
                        <span className="tag purple-tag">Commission</span>
                    </h3>

                    <div className="list">
                        <p>What’s included</p>
                        <ul>
                            <li><Check /> Easy Tracking</li>
                            <li><Check /> Creatives</li>
                            <li><Check /> 1-click links</li>
                            <li><Check /> Real time stats</li>
                        </ul>
                    </div>

                    <button onClick={() => onSelectRole('affiliate')}className="btn purple-btn"><span className="btn-text">Join Affiliates</span>< ChevronRight /></button>
                </div>
            </div>
        </section>
    );
}
