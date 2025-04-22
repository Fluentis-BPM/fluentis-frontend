
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

import { publicRoutes } from './routes/public';
import { privateRoutes } from './routes/private';

const router = createBrowserRouter([...publicRoutes, ...privateRoutes]);

function App() {
  return (
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
  );
}

export default App;