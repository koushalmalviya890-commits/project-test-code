import "./Hero.css";
import { PartyPopper, X } from "lucide-react";
import { MoveRight } from "lucide-react";

import Navbar from "../Navbar/Navbar";


export default function Hero({ onJoinEarly }) {
  return (
    <section className="hero" style={{ backgroundImage: `url('/hero.png')` }}>
      {/* Navbar */}
      <Navbar onJoinEarly={onJoinEarly} />

      {/* Announcement Bar */}
      <div className="announce-bar">
        <span>
          <PartyPopper size={16} /> Cumma 2.0 launches March 30, 2026 —
          Facilities, Affiliates & Strategic Partners: Lock founding benefits{" "}
          <MoveRight size={16} />
        </span>
        <X size={16} className="close-icon" />
      </div>

      <div className="hero-overlay"></div>

      <div className="hero-content">
        <span className="hero-pill">Cumma 2.0 Early Access</span>

        <h1>
          Streamline <span>Revenue</span> Amplify <br />
          Discovery
        </h1>

        <p>
          A powerful backend for facilities to digitise operations and a
          seamless frontend marketplace that connects startups with the right
          infrastructure to grow faster.
        </p>

        <button className="hero-btn" onClick={onJoinEarly}>
         <span className="buttontext"> Choose your partnership{" "}</span>
          <span className="hero-btn-icon">
            <PartyPopper size={16} />
          </span>
        </button>
        <div className="backed">
          <span className="backed-text">Backed by</span>
          <div className="backed-row">
            <div className="backed-logo">
              <img src="/bizdate.png" alt="" className="h-[50px] w-[50px]"/>
              <span>BizDateUp</span>
            </div>

            {/* <div className="backed-laptop">
                            <img src={laptopImg} alt="Live Bookings" />
                        </div> */}
          </div>
        </div>
        <div className="hero-stats">
          <div>
            <span>Facilities</span>
            <h3>245+</h3>
          </div>
          <div>
            <span>States</span>
            <h3>12+</h3>
          </div>
          <div>
            <span>Early Partners</span>
            <h3>89+</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
