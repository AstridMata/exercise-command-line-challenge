import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import CommandLine from "../components/CommandLine";
import Instructions from "../components/Instructions";
import TutorialOverlay from "../components/TutorialOverlay";
import ChooseTutorial from "../components/ChooseTutorial";
import styles from "../styles/Terminal.module.css";
import { executeCommand } from "../lib/commands";
import useCommandHistory from "../hooks/useCommandHistory";
import { tutorials, checkCommand } from "../lib/tutorials";
import { fileSystem } from "../lib/fileSystem";

const Terminal = () => {
  // Get language from URL query parameter, default to 'en'
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("lang") || "en";
  });

  const [output, setOutput] = useState([
    {
      type: "system",
      content:
        currentLanguage === "en"
          ? "Welcome to 4Geeks' Terminal Simulator v1.0.0"
          : "Bienvenido al Simulador de Terminal de 4Geeks v1.0.0",
    },
    {
      type: "system",
      content:
        currentLanguage === "en"
          ? 'Type "help" to see available commands.'
          : 'Escribe "help" para ver los comandos disponibles.',
    },
    {
      type: "system",
      content:
        currentLanguage === "en"
          ? "A tutorial will guide you through the basics."
          : "Un tutorial te guiará a través de los conceptos básicos.",
    },
  ]);

  const { history, addToHistory, navigateHistory, historyIndex } =
    useCommandHistory();
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentPath, setCurrentPath] = useState("/");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const terminalInputRef = useRef(null);

  function loadTutorial(tutorialIndex) {
    setCurrentTutorial(tutorials[tutorialIndex]);
    fileSystem.initializeDefaultStructure(
      tutorials[tutorialIndex].defaultStructure || {},
    );
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextStep = () => {
    if (currentStepIndex < currentTutorial.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setOutput((prev) => [
        ...prev,
        {
          type: "system",
          content:
            currentLanguage === "en"
              ? "🎉 Congratulations! You've completed the tutorial!"
              : "🎉 ¡Felicitaciones! ¡Has completado el tutorial!",
        },
      ]);
      setCurrentTutorial(tutorials[0]);
    }
  };

  const handleCommand = (command) => {
    if (!command.trim()) return;
  
    setOutput((prev) => [...prev, { type: "input", content: command }]);
  
    if (command.trim().toLowerCase() === "clear") {
      setOutput([]); // Limpiar la terminal
      return;
    }
  
    const result = executeCommand(command);
    setOutput((prev) => [...prev, { type: "output", content: result }]);
    addToHistory(command);
  
    // Verifica si el comando es correcto para el paso actual del tutorial
    if (currentTutorial && checkCommand(command, currentTutorial.steps[currentStepIndex])) {
      // Solo muestra el confeti si el comando es correcto
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); // Esconde el confeti después de 3 segundos
  
      // Avanza al siguiente paso del tutorial
      nextStep();
    } else {
      // Si el comando no es correcto, no haces nada con el confeti
      setShowConfetti(false);
    }
  };

  // const handleSkipTutorial = () => {
  //   setCurrentTutorial(tutorials[0]);
  //   setOutput((prev) => [
  //     ...prev,
  //     {
  //       type: "system",
  //       content:
  //         currentLanguage === "en"
  //           ? 'Tutorial skipped. Type "help" if you need assistance.'
  //           : 'Tutorial omitido. Escribe "help" si necesitas ayuda.',
  //     },
  //   ]);
  // };

  useEffect(() => {
    const terminal = document.querySelector(`.${styles.output}`);
    if (terminal) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  }, [output]);

  if (!currentTutorial)
    return (
      <ChooseTutorial
        onChoose={(tutorialIndex) => loadTutorial(tutorialIndex)}
        currentLanguage={currentLanguage}
      />
    );

  return (
    <div className={styles.container}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <button
        className={styles.hamburgerButton}
        onClick={() => setShowInstructions((prev) => !prev)}
        aria-label={
          currentLanguage === "en"
            ? "Toggle instructions"
            : "Alternar instrucciones"
        }
      >
        ☰
      </button>
      <div
        className={styles.terminal}
        onClick={(e) => {
          const selection = window.getSelection();
          const hasSelection = selection.toString().length > 0;
          if (!hasSelection && terminalInputRef.current) {
            terminalInputRef.current.focus();
          }
        }}
      >
        <div className={styles.output}>
          {output.map((line, index) => (
            <div key={index} className={styles[line.type]}>
              {line.type === "input" && (
                <span className={styles.prompt}>{currentPath}$ </span>
              )}
              {line.content}
            </div>
          ))}
        </div>
        <CommandLine
          onSubmit={handleCommand}
          history={history}
          historyIndex={historyIndex}
          onHistoryNavigate={navigateHistory}
          currentPath={currentPath}
          inputRef={terminalInputRef}
        />
      </div>
      <div
        className={`${styles.instructions} ${showInstructions ? "" : styles.collapsed}`}
      >
        <Instructions currentLanguage={currentLanguage} />
      </div>
      <TutorialOverlay
        currentTutorial={currentTutorial}
        currentStep={currentTutorial?.steps[currentStepIndex]}
        // onSkip={handleSkipTutorial}
        onContinue={() => nextStep()}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default Terminal;
