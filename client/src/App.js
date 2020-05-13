import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import NoMatch from './components/NoMatch'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      token: null
    }
  }
  componentWillMount() {
    const token = localStorage.usertoken;
    this.setState({token: token});
    console.log(this.state.token);
  }

  render() {
    
    return (
      <Router>
          <Switch>
             <Route exact path="/">
              {
                this.state.token ? <Home /> : <Redirect to="/login" />
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
