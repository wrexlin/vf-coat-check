/* @refresh reload */
import { render } from 'solid-js/web';

import 'terminal.css'
import './index.css';
import App from './App';
import { pb, useAuthState } from './api';
import { Login } from './Login';
import { PBContext } from '@hibas123/solid-pb';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

function Entry() {
  const loginState = useAuthState();
  return <p>
    <PBContext.Provider value={pb}>
      {loginState() ? <App /> : <Login />}
    </PBContext.Provider>
  </p>
}

render(() => <Entry />, root!);
