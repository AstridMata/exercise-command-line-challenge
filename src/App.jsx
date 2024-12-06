import React from 'react';
import { Switch, Route } from "wouter";
import Terminal from "./pages/Terminal";
import styles from './styles/App.module.css';

const App = () => {
  return (
    <div className={styles.container}>
      <Switch>
        <Route path="/" component={Terminal} />
        <Route>
          <div className={styles.error}>
            <h1>404 - Page Not Found</h1>
          </div>
        </Route>
      </Switch>
    </div>
  );
};

export default App;

