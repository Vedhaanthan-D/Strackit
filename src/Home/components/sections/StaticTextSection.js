import React from 'react';
import '../styles/StaticTextSection.css';

const StaticTextSection = () => {
  return (
    <section className="quoteSection">
      <div className="static-text-row">
        <div className="static-label">HIGH FASHION</div>

        <h2 className="static-quote">
          "The point of using Morem Apsum is that it has a more-or-less<br/>
          normal distribution of letters, as opposed to using 'Content here,<br/>
          content here', making it look like readable English."
        </h2>

        <button className="static-btn">READ ABOUT US</button>
      </div>
    </section>
  );
};

export default StaticTextSection;
