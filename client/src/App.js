import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import NoMatch from './components/NoMatch'

class App extends Component {
  render() {
    const token = localStorage.usertoken;
    console.log(token);
    return (
      <Router>
          <Switch>
             <Route exact path="/">
              {
                token ? <Home /> : <Redirect to="/login" />
              }
            </Route>
            <Route exact path="/register" component={Register} />
            <Route path="/login" component={Login} />
            <Route path="*">
              <NoMatch />
            </Route>
          </Switch>
      </Router>
    )
  }
}

export default App
