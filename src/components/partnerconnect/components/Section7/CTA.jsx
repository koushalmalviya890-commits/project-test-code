import "./CTA.css";
import { Rocket } from 'lucide-react';


export default function CTA({ onSelectRole }) {
    return (
        <section className="cta">
            <div className="cta-pill"><Rocket /> Launching March 30, 2026</div>

            <h2>
                Ready to Transform India's <br />
                Startup Infrastructure?
            </h2>

            <div className="cta-buttons">
                <button 
                  className="btn green" 
                  onClick={() => onSelectRole('facility')}
                >
                  Facilities Trial
                </button>
                
                <button 
                  className="btn purple" 
                  onClick={() => onSelectRole('affiliate')}
                >
                  Affiliate Program
                </button>
                
                <button 
                  className="btn orange" 
                  onClick={() => onSelectRole('strategic')}
                >
                  Strategic Partnership
                </button>
            </div>

            <div className="divider"></div>

            <div className="cta-stats">
                <div>
                    <h3>247+</h3>
                    <span>Facilities</span>
                </div>
                <div>
                    <h3>12</h3>
                    <span>States</span>
                </div>
                <div>
                    <h3>89</h3>
                    <span>Early Partners</span>
                </div>
                <div>
                    <h3>₹1.2M</h3>
                    <span>Revenue Processed</span>
                </div>
            </div>
        </section>
    );
}
