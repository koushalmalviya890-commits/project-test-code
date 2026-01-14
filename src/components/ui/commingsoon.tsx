import React from 'react';
import styles from './ComingSoon.module.css';

interface ComingSoonProps {
  text?: string;
  subtitle?: string;
  wordDelay?: number;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  text = "Coming Soon", 
  subtitle = "Something amazing is on the way!",
  wordDelay = 200 
}) => {
  const words = text.split(' ').filter(word => word.length > 0);
  
  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
        {words.map((word, index) => (
          <span 
            key={`word-${index}`}
            className={styles.animatedWord}
            style={{ 
              animationDelay: `${index * wordDelay}ms` 
            }}
          >
            {word}
          </span>
        ))}
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

export default ComingSoon;
