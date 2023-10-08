import React from 'react';
import { BrowserRouter as Router, Switch, Route }  from "react-router-dom";

import Core from './routes/Core';
import Login from './routes/Login';
import SampleTest from './routes/SampleTest';
import Path from './constants/Paths';

import 'react-datepicker/dist/react-datepicker.css';
import 'photoswipe/dist/photoswipe.css';
import 'easymde/dist/easymde.min.css';
import './styles.module.scss';

function MyRoot() {
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

export default MyRoot;
