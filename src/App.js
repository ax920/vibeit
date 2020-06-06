import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './Home'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
const axios = require('axios').default;
const querystring = require('query-string');
require('dotenv').config();

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/callback">
            <Callback />
          </Route>
          <Route path="/">
            <HomeRoute />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function HomeRoute() {
  const location = useLocation();
  return <Home jwtData={location.state.data} />
}

function Login() {
  const client_id = process.env.REACT_APP_CLIENT_ID;
  const client_secret = process.env.REACT_APP_CLIENT_SECRET;
  const redirect_uri = 'http://localhost:3000/callback';
  const scope = 'user-read-private user-read-email user-top-read';
  const state = generateRandomString(16);
  const queryObj = {
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  }
  const queryString = Object.keys(queryObj).map(key => key + '=' + queryObj[key]).join('&');
  console.log(queryString);

  window.location.href = 'https://accounts.spotify.com/authorize?' + queryString;
  return <h2>Login</h2>;
}

function Callback() {
  const history = useHistory();
  const request_url = 'https://accounts.spotify.com/api/token';
  const client_id = process.env.REACT_APP_CLIENT_ID;
  const client_secret = process.env.REACT_APP_CLIENT_SECRET;
  const redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri
  let uriObj = window.location.href.split("=")
  uriObj[1] = uriObj[1].substring(0, uriObj[1].length - 6)
  const code = uriObj[1] || null;
  const state = uriObj[2] || null;

  if (state === null) {
    console.log("oops bad state")
  } else {
    axios.post(request_url, querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      }
    }).then(response => {
      history.push({
        pathname: '/',
        state: {
          isLoggedIn: true,
          data: response.data
        }
      })
    });
  }
  return null;
}

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
