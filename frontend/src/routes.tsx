import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';

import Home from './pages/Home'; 
import CreatePoint from './pages/CreatePoint'; 

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact component={Home}/>
        <Route path='/create-point' component={CreatePoint}/>
      </Switch>
    </BrowserRouter>
  )
}

export default Routes;