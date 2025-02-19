import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";


import Update from "./pages/admin/updateuser/Update";
import AddUser from "./pages/admin/adduser/AddUser";
import User from "./pages/admin/getuser/User";

import Login from "./pages/auth/Login";
import Register from './pages/auth/Register';

import ErrorPage from "./pages/ErrorPage";

import RequestForm from './pages/user/request/requestForm';
import DashboardUser from './pages/user/dashboard/dashboardUser';
import TrackRequest from './pages/user/track/trackRequest';


import Inventory from './pages/admin/inventory/inventory';

function App() {
  const route = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/register", element: <Register /> },
    
    { path: "/user", element: <User /> },
    { path: "/add", element: <AddUser /> },
    { path: "/update/:id", element: <Update /> },    

    { path: "/inventory", element: <Inventory /> },    
    { path: '/request', element: <RequestForm /> },
    { path: '/dashboard-user', element: <DashboardUser /> },
    { path: '/track-request', element: <TrackRequest /> },

    { path: "*", element: <ErrorPage /> } 
  ]);

  return (
    <div className="App">
      <RouterProvider router={route} />
    </div>
  );
}

export default App;