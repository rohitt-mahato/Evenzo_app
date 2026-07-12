import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import EventDetail from './pages/EventDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import TicketDetail from './pages/TicketDetail';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    if (role && user.role !== role) {
        return <Navigate to="/" />;
    }
    
    return children;
};

const AppContent = () => {
    const location = useLocation();
    
    // Hide navbar on auth routes and admin routes (Stitch design for admin is full page)
    const hideNavbarRoutes = ['/login', '/register', '/forgot-password'];
    // Let's also hide it if we are on a reset-password route
    const isAuthRoute = hideNavbarRoutes.includes(location.pathname) || location.pathname.startsWith('/reset-password');
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased">
            {(!isAuthRoute && !isAdminRoute) && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                <Route path="/events/:id" element={<EventDetail />} />
                
                <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
                <Route path="/ticket/:id" element={<PrivateRoute><TicketDetail /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
                <Route path="/failed" element={<PrivateRoute><PaymentFailed /></PrivateRoute>} />
                
                <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
                
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

export default App;
