
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

import { router } from './routes';
const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  return (
    <Provider store={store}>
      <MsalProvider instance={msalInstance}>
        <RouterProvider router={router} />
      </MsalProvider>
    </Provider>
  );
}

export default App;