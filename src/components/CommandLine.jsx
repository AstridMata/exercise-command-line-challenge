import React, { useState, useEffect } from "react";
import styles from "../styles/Terminal.module.css";
import { getSuggestions } from "../lib/commands";

const CommandLine = ({
  onSubmit,
  onClear,
  history,
  historyIndex,
  onHistoryNavigate,
  currentPath,
  inputRef, // Added inputRef prop
}) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  useEffect(() => {
    if (historyIndex !== -1) {
      setInput(history[historyIndex]);
      setSuggestions([]);
    }
  }, [historyIndex, history]);
  
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
  
    if (trimmedInput === "clear") {
      onClear();
    } else if (trimmedInput.startsWith("mkdir") && trimmedInput.split(" ").length < 2) {
     
      alert("mkdir: missing operand");
    } else if (trimmedInput.startsWith("touch") && trimmedInput.split(" ").length < 2) {
      
      alert("touch: missing operand");
    } else if (trimmedInput) {
      onSubmit(trimmedInput);
    }

    if (trimmedInput === "pwd") {
      onSubmit(`Current directory: ${currentPath}`);
    }
  
    setInput("");
    setSuggestions([]);
    setSelectedSuggestion(-1);
  };

  const applySuggestion = (suggestion) => {
    const parts = input.split(" ");
    if (parts.length <= 1) {
      setInput(suggestion);
    } else {
      parts[parts.length - 1] = suggestion;
      setInput(parts.join(" "));
    }
    setSuggestions([]);
    setSelectedSuggestion(-1);

    // If suggestion ends with '/', trigger new suggestions for the directory
    // if (suggestion.endsWith('/')) {
    //   setTimeout(() => {
    //     const newSuggestions = getSuggestions(parts[0] + ' ' + suggestion);
    //     setSuggestions(newSuggestions);
    //     if (newSuggestions.length > 0) {
    //       setSelectedSuggestion(0);
    //     }
    //   }, 0);
    // }

    // Set cursor at the end of input after suggestion is applied
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.value.length;
        inputRef.current.selectionEnd = inputRef.current.value.length;
      }
    }, 0);
  };

  const updateInputWithSelectedSuggestion = () => {
    if (selectedSuggestion !== -1 && suggestions.length > 0) {
      const parts = input.split(" ");
      const newInput =
        parts.length <= 1
          ? suggestions[selectedSuggestion]
          : parts
              .slice(0, -1)
              .concat(suggestions[selectedSuggestion])
              .join(" ");
      setInput(newInput);
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const newIndex =
          e.key === "ArrowUp"
            ? selectedSuggestion > 0
              ? selectedSuggestion - 1
              : suggestions.length - 1
            : selectedSuggestion < suggestions.length - 1
              ? selectedSuggestion + 1
              : 0;

        setSelectedSuggestion(newIndex);
        // Update input as user navigates through suggestions
        const parts = input.split(" ");
        const updatedInput =
          parts.length <= 1
            ? suggestions[newIndex]
            : parts.slice(0, -1).concat(suggestions[newIndex]).join(" ");
        setInput(updatedInput);
        return;
      }

      if (e.key === "Enter" && selectedSuggestion !== -1) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
        return;
      }
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      onHistoryNavigate(e.key === "ArrowUp" ? "up" : "down");
    } else if (e.key === "Tab") {
      e.preventDefault();

      if (suggestions.length === 0) {
        // Get new suggestions
        const newSuggestions = getSuggestions(input);
        setSuggestions(newSuggestions);
        if (newSuggestions.length > 0) {
          setSelectedSuggestion(0);
          // Update input with first suggestion
          const parts = input.split(" ");
          const updatedInput =
            parts.length <= 1
              ? newSuggestions[0]
              : parts.slice(0, -1).concat(newSuggestions[0]).join(" ");
          setInput(updatedInput);
        }
      } else if (selectedSuggestion !== -1) {
        applySuggestion(suggestions[selectedSuggestion]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSelectedSuggestion(-1);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setSuggestions([]);
    setSelectedSuggestion(-1);
  };

  return (
    <div className={styles.commandLineContainer}>
      <form onSubmit={handleSubmit} className={styles.commandLine}>
        <span className={styles.prompt}>{currentPath}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={styles.input}
          autoFocus
          spellCheck="false"
        />
      </form>
      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`${styles.suggestion} ${
                index === selectedSuggestion ? styles.selected : ""
              }`}
              onClick={() => {
                applySuggestion(suggestion);
                inputRef.current?.focus();
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommandLine;
