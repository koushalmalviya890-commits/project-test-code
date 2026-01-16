import "./Navbar.css";
import { Moon } from 'lucide-react';
// import logo from "../../assets/logo.png";


export default function Navbar({ onJoinEarly }) {
    return (
        <nav className="navbar">
            <div className="nav-left">
                <img src="/logo-green.png" alt="Cumma Logo" className="logo-img" />
            </div>
            {/* <div className="nav-center">
                <a href="#">How it works</a>
                <a href="#">Facilities</a>
                <a href="#">Startup</a>
                <a href="#">Affiliates</a>
                <a href="#">Strategic Partner</a>
            </div> */}

            <div className="nav-right">
                {/* <button className="theme-btn"><Moon  color="grey"/></button> */}
                <button className="join-btn" onClick={onJoinEarly}>
                    Join Early <span>→</span>
                </button>
            </div>
        </nav>
    );
}
