import React, { useState, useEffect } from 'react';

interface AnimatedPriceProps {
  finalValue: number;
  duration: number;
}

const AnimatedPrice: React.FC<AnimatedPriceProps> = ({ finalValue, duration }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < duration) {
        setCurrentValue(Math.min((progress / duration) * finalValue, finalValue));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCurrentValue(finalValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [finalValue, duration]);

  return <span>{currentValue.toFixed(2)}</span>;
};

export default AnimatedPrice;