import React from 'react';
import { BrowserRouter as Router, Switch, Route }  from "react-router-dom";

import Core from './routes/Core';
import Login from './routes/Login';
import SampleTest from './routes/SampleTest';
import Path from './constants/Paths';

//import styled from "styled-components";
import 'react-datepicker/dist/react-datepicker.css';
import './styles.module.scss';

// import 'react-datepicker/dist/react-datepicker.css';
// import 'photoswipe/dist/photoswipe.css';
// import 'easymde/dist/easymde.min.css';

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

      <Header />

*/
function Root() {
  return (
    <Router>
      <Switch>
        <Route path = {Path.LOGIN}>
          <Login/>
        </Route>
        <Route path = {Path.PROJECTS}>
          <Core/>
        </Route>
        <Route path = {Path.BOARDS}>
          <Core/>
        </Route>
        <Route path = {Path.SAMPLE}>
          <SampleTest/>
        </Route>
        <Route path = {Path.ROOT}>
          <Core/>
        </Route>
      </Switch>
    </Router>
  );
}

export default Root;
