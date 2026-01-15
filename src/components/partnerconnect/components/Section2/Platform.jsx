// import { FileQuestionMark } from "lucide-react";
import { CircleCheckBig, FileQuestionIcon } from "lucide-react";
import { ArrowDown } from "lucide-react";

import { Search } from "lucide-react";

import "./Platform.css";

export default function Problems() {
  return (
    <section className="problems">
      <h2 className="heading1">Two Problems. One Platform.</h2>

      <div className="cards">
        {/* Facilities */}
        <div className="problem-card">
          <div className="icons">
            <div className="icon-wrap red">
              <FileQuestionIcon />
            </div>

            <ArrowDown className="arrow" />

            <div className="icon-wrap green">
              <CircleCheckBig />
            </div>
          </div>

          <h3>FACILITIES</h3>

          <div className="box red-box">
            Manual bookings, zero visibility, underutilised capacity
          </div>

          <ArrowDown className="down-arrow" />

          <div className="box green-box">
            Solution: Smart dashboard, QR access, revenue automation
          </div>
        </div>

        {/* Startups */}
        <div className="problem-card">
          <div className="icons">
            <div className="icon-wrap orange">
              <Search />
            </div>

            <ArrowDown className="arrow" />
            <div className="icon-wrap green">
              <CircleCheckBig />
            </div>
          </div>

          <h3>STARTUPS</h3>

          <div className="box orange-box">
            Scattered infra, unverified listings, access barriers
          </div>

          <ArrowDown className="down-arrow" />

          <div className="box green-box">
            Solution: Unified marketplace, verified facilities, instant booking
          </div>
        </div>
      </div>
    </section>
  );
}
