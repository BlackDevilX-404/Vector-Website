import { useState, useEffect, useRef } from 'react';
import './LiveEditText.css';

const LiveEditText = ({ draftText, finalText }) => {
  const [isStruck, setIsStruck] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textRef = useRef(null);
  
  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    
    // Helper to pause execution
    const wait = (ms) => new Promise(resolve => {
      timeoutId = setTimeout(resolve, ms);
    });

    const typeText = async (text, speed = 80) => {
      setIsTyping(true);
      if (textRef.current) textRef.current.textContent = '';
      
      for (let i = 0; i < text.length; i++) {
        if (!isMounted) return;
        if (textRef.current) textRef.current.textContent = text.slice(0, i + 1);
        await wait(speed + (Math.random() * 50)); // Randomize typing speed slightly
      }
      setIsTyping(false);
    };
    
    const deleteText = async (speed = 40) => {
      setIsTyping(true);
      if (!textRef.current) return;
      
      let currentText = textRef.current.textContent;
      while (currentText.length > 0) {
        if (!isMounted) return;
        currentText = currentText.slice(0, -1);
        textRef.current.textContent = currentText;
        await wait(speed);
      }
      setIsTyping(false);
    };

    const runSequence = async () => {
      // 1. Initial wait (allow loader to finish on first mount)
      setIsStruck(false);
      await wait(4500);
      if (!isMounted) return;

      while (isMounted) {
        // 2. Type Draft
        await typeText(draftText);
        if (!isMounted) return;

        // 3. Pause, then Strike
        await wait(800);
        if (!isMounted) return;
        setIsStruck(true);

        // 4. Pause, then Delete
        await wait(1200);
        if (!isMounted) return;
        setIsStruck(false);
        await deleteText();
        if (!isMounted) return;

        // 5. Type Final
        await typeText(finalText, 70); // Type final slightly faster
        if (!isMounted) return;

        // 6. Done. Wait a long time, then loop.
        await wait(8000);
      }
    };

    runSequence();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [draftText, finalText]);

  return (
    <span className="live-edit-wrapper">
      <span className={`live-edit-container ${isStruck ? 'strike-active' : ''}`}>
        <span className="live-edit-text" ref={textRef}></span>
        <span className="live-edit-strike"></span>
      </span>
      <span className={`live-edit-caret ${isTyping ? 'hide' : ''}`}></span>
    </span>
  );
};

export default LiveEditText;
