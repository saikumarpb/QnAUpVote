import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import Room from './Room/index.js';
import App from './App.js';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
      path: '/room/:roomId',
      element: <Room />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
