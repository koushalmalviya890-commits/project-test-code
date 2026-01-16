import "./Ecosystem.css";
import {
    Building2,
    Lightbulb,
    Microscope,
    School,
    Users,
    TrendingUp,
    DollarSign,
    Handshake
} from "lucide-react";

const data = [
    { icon: <Building2 />, title: "Coworking", desc: "Fill seats, track usage" },
    { icon: <Lightbulb />, title: "Incubators", desc: "Digitise cohorts" },
    { icon: <Microscope />, title: "R&D Labs", desc: "Monetise capacity" },
    { icon: <School />, title: "Institutions", desc: "Open infra to startups" },
    { icon: <Users />, title: "Communities", desc: "Connect members" },
    { icon: <TrendingUp />, title: "Investors", desc: "Structured dealflow" },
    { icon: <DollarSign />, title: "Creators", desc: "Earn 20% commission" },
    { icon: <Handshake />, title: "State Missions", desc: "Co-build infra layer" },
];

export default function Ecosystem() {
    return (
        <section className="ecosystem">
            <h2>Built for India's Complete Startup Ecosystem</h2>

            <div className="ecosystem-grid">
                {data.map((item, i) => (
                    <div key={i} className="ecosystem-card">
                        <div className="icon-box">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
