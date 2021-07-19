import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { lazy, Suspense } from 'react';
import Loader from './components/loader';
import { Provider } from 'react-redux';
import appStore from './store';

const load = (Component) => (props) => (
  <Suspense fallback={<Loader/>}>
    <Component {...props} />
  </Suspense>
);

const Main = load(lazy(()=> import('./screens/main/index')));

function App() {
  return (
    <Provider store={appStore}>
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/">
              <Main />
            </Route>
          </Switch>
        </Router>
      </div>
    </Provider>
  );
}

export default App;
