import React from 'react';
import { BrowserRouter as Router, Switch, Route }  from "react-router-dom";

import Header from './components/Header';
import Core from './routes/Core';
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
function Root() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/">
          <Core/>
        </Route>
        <Route path ="/settings">
          <Settings/>
        </Route>
      </Switch>
    </Router>
  );
}

export default Root;
