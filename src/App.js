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
import Zribble from './screens/zribble/index';
import { ChakraProvider } from "@chakra-ui/react";

const load = (Component) => (props) => (
  <Suspense fallback={<Loader/>}>
    <Component {...props} />
  </Suspense>
);

const Main = load(lazy(()=> import('./screens/main/index')));

function App() {
  return (
    <ChakraProvider>
      <Provider store={appStore}>
        <div className="App">
          <Router>
            <Switch>
              <Route exact path="/">
                <Main />
              </Route>
              <Route path="/rooms/:id">
                <Zribble/>
              </Route>
            </Switch>
          </Router>
        </div>
      </Provider>
    </ChakraProvider>
  );
}

export default App;
