import React, { Component, Fragment } from 'react';
import Login from './Login';
import Authenticate from './Auth';
import Register from './Register';
import Logout from './Logout';
import Genres from './Genres';
import ListQuiz from './ListQuiz';
import ListQuestion from './ListQuestion';
import ListOption from './ListOption';
import EditQuiz from './EditQuiz';
import EditGenre from './EditGenre';
import EditQuestion from './EditQuestion';
import EditOption from './EditOption';
import Play from './Play';
import ErrorMessage from './Error';
import Leaderboard from './Leaderboard';
import GenreLeaderboard from './GenreLeaderboard';
import History from './History';
import Users from './Users';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

function LoggedInButtons(props) {
  if(props.auth)
    return (<Fragment>
  <li className="nav-item">
            <Link to={'/genres'} className="nav-link">Play</Link>
  </li>
  <li className="nav-item">
            <Link to={'/history'} className="nav-link">History</Link>
  </li>
  <li className="nav-item">
            <Link to={'/logout'} className="nav-link">Logout</Link>
  </li>
  </Fragment>);
  else
    return null;
}
function LoginButton(props) {
  if(!props.auth)
  return <li className="nav-item">
            <Link to={'/login'} className="nav-link">Login</Link>
          </li>;
  else
    return null;
}
function RegisterButton(props) {
  if(!props.auth)
  return <li className="nav-item">
            <Link to={'/register'} className="nav-link">Register</Link>
          </li>;
  else
    return null;
}

function AdminButtons(props) {
  if(props.admin)
    return <li className="nav-item">
            <Link to={'/users'} className="nav-link">Users</Link>
          </li>;
  else
    return null;
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      auth : {auth : false, isAdmin : false}
    }
  }
  componentDidMount() {
    Authenticate.bind(this)();
  }
  render() {
    const user = this.state.auth;
    try {
    return (
      <Router>
      <div className="App">
        <h1>Quiz App</h1>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="collapse navbar-collapse" id="navbarColor01">
          <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={'/'} className="nav-link">Home</Link>
          </li>
          <LoginButton auth={user.auth} />
          <RegisterButton auth={user.auth} />
          <LoggedInButtons auth={user.auth} />
          <AdminButtons admin={user.auth && user.isAdmin} />
          </ul>
          </div>
        </nav>
        <Switch>
          <Route exact path='/' component={Leaderboard} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/history' component={History} />
          <Route exact path='/register' component={Register} />
          <Route exact path='/logout' component={Logout} />
          <Route exact path='/genres' component={Genres} />
          <Route exact path='/users' component={Users} />
          <Route exact path='/quizzes/:id' render={
            ({match}) => <ListQuiz id={match.params.id} />
          } />
          <Route exact path='/edit_genre/:id' render={
            ({match}) => <EditGenre id={match.params.id} />
          } />
          <Route exact path='/edit_quiz/:id' render={
            ({match}) => <EditQuiz id={match.params.id} />
          } />
          <Route exact path='/questions/:id' render={
            ({match}) => <ListQuestion id={match.params.id} />
          } />
          <Route exact path='/edit_question/:id' render={
            ({match}) => <EditQuestion id={match.params.id} />
          } />
          <Route exact path='/options/:id' render={
            ({match}) => <ListOption id={match.params.id} />
          } />
          <Route exact path='/edit_option/:id' render={
            ({match}) => <EditOption id={match.params.id} />
          } />
          <Route exact path='/play/:id' render={
            ({match}) => <Play id={match.params.id} />
          } />
          <Route exact path='/genre_leaderboards/:id' render={
            ({match}) => <GenreLeaderboard id={match.params.id} />
          } />
        </Switch>
      </div>
      </Router>
    );
  } catch (err) {
    return <ErrorMessage show={true} message={err} />
  }
  }
}

export default App;
