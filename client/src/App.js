import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import JoinRoom from './Home/JoinRoom';
import GameRoom from './GameRoom/GameRoom';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={JoinRoom} />
        <Route exact path="/:gameId/:pseudo" component={GameRoom} />
      </Switch>
    </Router>
  );
}

export default App;
