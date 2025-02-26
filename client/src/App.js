import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// Admin Pages
import AdminDashboard from "../src/pages/admin/dashboard/AdminDashboard";
import Inventory from "./pages/admin/inventory/inventory";
import AccountManagement from "./pages/admin/accounts/AccountManagement";
import ForApproval from "./pages/admin/forApproval/approval";


// Login Page
import Login from "./pages/login/Login";

// Error Page
import ErrorPage from "./components/ErrorPage";

// User Pages
import RequestForm from './pages/user/request/requestForm';
import DashboardUser from './pages/user/dashboard/dashboardUser';
import TrackRequest from './pages/user/track/trackRequest';

//Supervisor Pages



// PrivateRoute Component
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const route = createBrowserRouter([
    { path: "/", element: <Login /> },
    
   
    // Protected user routes
    { 
      path: "/request", 
      element: (
        <PrivateRoute>
          <RequestForm />
        </PrivateRoute>
      ) 
    },
    { 
      path: "/dashboard-user", 
      element: (
        <PrivateRoute>
          <DashboardUser />
        </PrivateRoute>
      ) 
    },
    { 
      path: "/track-request", 
      element: (
        <PrivateRoute>
          <TrackRequest />
        </PrivateRoute>
      ) 
    },
   
    // Protected admin route
    { 
      path: "/admin", 
      element: (
        <PrivateRoute>
          <AdminDashboard />
        </PrivateRoute>
      )
    },

    { 
      path: "/inventory", 
      element: (
        <PrivateRoute>
          <Inventory />
        </PrivateRoute>
      ) 
    },

    { 
      path: "/account-management", 
      element: (
        <PrivateRoute>
          <AccountManagement />
        </PrivateRoute>
      )
    },

    { 
      path: "/for-approval", 
      element: (
        <PrivateRoute>
          <ForApproval />
        </PrivateRoute>
      )
    },
    





    
    // Fallback 
    { path: "*", element: <ErrorPage /> } 
  ]);

  return (
    <div className="App">
      <RouterProvider router={route} />
    </div>
  );
}

export default App;
