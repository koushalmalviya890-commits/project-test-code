// components/layout/Marquee.tsx
import React, { useEffect, useRef, FC } from 'react';
import { gsap } from 'gsap';

// ... (CompanyContent and MarqueeProps interfaces remain the same) ...

interface CompanyContent {
  id: number | string;
  logoUrl: string;
  name: string;
}

interface MarqueeProps {
  companies: CompanyContent[];
  speed?: number;
}

const Marquee: FC<MarqueeProps> = ({ companies, speed = 50 }) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null); 
  
  // Renders the content structure
  const renderableContent = (
    // ADJUSTMENT: Increased gap to 80px for better separation and removed fixed width for better responsiveness.
    <div className="marquee-items-group" style={{ display: 'flex', gap: '150px' }}>
      {companies.map((company, index) => (
        <div 
          key={company.id} 
          className="marquee-item"
          ref={index === 0 ? firstItemRef : null} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            // Ensures text and image are vertically centered
          }}
        >
          {/* ADJUSTMENT: Centered the image to the overall height for visual balance */}
          <img 
            src={company.logoUrl} 
            alt={`${company.name} logo`} 
            style={{ 
              height: '40px', 
              marginRight: '10px',
              objectFit: 'contain' // Ensures the logo scales correctly without stretching
            }} 
          />
          {/* ADJUSTMENT: If you don't want the name, you can remove this span. */}
          <span style={{ whiteSpace: 'nowrap', fontSize: '1.25rem', color: '#666' }}>{company.name}</span>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (!marqueeRef.current || !firstItemRef.current || companies.length === 0) return;

    const marqueeContainer = marqueeRef.current;
    
    const originalContentGroup = firstItemRef.current.parentElement;
    if (!originalContentGroup) return;

    // Remove any previous clones before re-cloning
    const existingClones = marqueeContainer.querySelectorAll('.marquee-items-group.clone');
    existingClones.forEach(clone => clone.remove());

    // 1. Duplicate the entire group of content and add a class for cleanup
    const contentGroupClone = originalContentGroup.cloneNode(true) as HTMLDivElement;
    contentGroupClone.classList.add('clone');
    marqueeContainer.appendChild(contentGroupClone);

    // 2. Calculate the width of the original content group
    const totalWidth: number = originalContentGroup.scrollWidth; 

    // 3. Set up the GSAP animation
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'linear' } });

    tl.to(marqueeContainer, {
      x: -totalWidth, 
      duration: totalWidth / speed,
    });

    return () => {
      tl.kill();
      // Clean up the cloned node on component unmount/update
      if (marqueeContainer.contains(contentGroupClone)) {
        marqueeContainer.removeChild(contentGroupClone);
      }
    };
  }, [companies, speed]); 

  return (
    // ADJUSTMENT: Removed 'marquee-wrapper' class and set width to auto for centering
    <div
    style={{
      overflow: "hidden",
      whiteSpace: "nowrap",
      display: "flex",          // <— Flex container
      justifyContent: "center", // <— Centers horizontally
      alignItems: "center",     // <— Centers vertically
      width: "100%",            // <— Ensures full width
    }}
  >
      {/* This is the inner container that scrolls.
        Use inline-flex to ensure the original and clone sit side-by-side.
      */}
      <div 
        className="marquee-content" 
        ref={marqueeRef} 
        style={{ display: "inline-flex",
        alignItems: "center", }} 
      >
        {renderableContent}
      </div>
    </div>
  );
};

export default Marquee;