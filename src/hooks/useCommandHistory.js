import { useState } from 'react';

const useCommandHistory = () => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = (command) => {
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
  };

  // no se donde deberia ir 
  // const onClear = () => {
  //   setHistory([]);
  // };

  const navigateHistory = (direction) => {
    if (history.length === 0) return;

    if (direction === 'up') {
      setHistoryIndex(prev => 
        prev < history.length - 1 ? prev + 1 : prev
      );
    } else if (direction === 'down') {
      setHistoryIndex(prev => 
        prev > -1 ? prev - 1 : prev
      );
    }
  };

  return {
    history,
    historyIndex,
    addToHistory,
    navigateHistory
  };
};

export default useCommandHistory;
