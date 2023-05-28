import React from 'react';
import { BrowserRouter as Router, Switch, Route }  from "react-router-dom";

import './App.css';
import Header from './components/Header';
import Home from './routes/Home';
import Settings from './routes/Settings';

/*
<div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
*/
function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/">
          <Home/>
        </Route>
        <Route path ="/settings">
          <Settings/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
