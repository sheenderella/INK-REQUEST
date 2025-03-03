import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// Login Page
import Login from "./pages/login/Login";

// Error Page
import ErrorPage from "./components/ErrorPage";

// Admin Pages
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import Inventory from "./pages/admin/inventory/inventory";
import AccountManagement from "./pages/admin/accounts/AccountManagement";
import ForApproval from "./pages/admin/forApproval/approval";
import PrinterModel from "./pages/admin/inventory/PrinterModel";
import InkModel from "./pages/admin/inventory/InkModel";





// User Pages
import DashboardUser from './pages/user/dashboard/dashboardUser';
import RequestForm from './pages/user/request/requestForm';
import TrackRequest from './pages/user/track/trackRequest';

// Supervisor Pages
import DashboardSupervisor from './pages/supervisor/dashboard/dashboardSupervisor';
import ApprovalSupervisor from './pages/supervisor/approval/approval';
import TrackSupervisor from './pages/supervisor/track/trackRequest'; // Renamed for consistency

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
   
    // Protected admin routes
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
      path: "/PrinterModel", 
      element: (
        <PrivateRoute>
          <PrinterModel />
        </PrivateRoute>
      ) 
    },

    { 
      path: "/InkModel", 
      element: (
        <PrivateRoute>
          <InkModel />
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
    
    // Protected supervisor routes
    { 
      path: "/dashboardSupervisor", 
      element: (
        <PrivateRoute>
          <DashboardSupervisor />
        </PrivateRoute>
      )
    },

    { 
      path: "/ApprovalSupervisor", 
      element: (
        <PrivateRoute>
          <ApprovalSupervisor />
        </PrivateRoute>
      )
    },

    { 
      path: "/TrackSupervisor",  // Added missing route for TrackSupervisor
      element: (
        <PrivateRoute>
          <TrackSupervisor />
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
