import React from "react";
import styles from "../styles/TutorialOverlay.module.css";
import { tutorials } from "../lib/tutorials";

const ChooseTutorial = ({ onChoose, currentLanguage }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.tutorialBox}>
        <h3>Choosea tutoria:</h3>
       
        {tutorials.map((tutorial, index) => (
          <div key={index} className={styles.controls}>
            <button
              onClick={() => onChoose(index)}
              className={styles.skipButton}
            >
              {tutorial.title[currentLanguage]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChooseTutorial;
