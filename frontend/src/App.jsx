import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useModalStore } from "./store/useModalStore";
import { useEffect } from "react";
import { useThemeStore } from "./store/useThemeStore";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

import Navbar from "./components/Navbar";
import SearchModal from "./components/SearchModal";
import CreateGroupModal from "./components/CreateGroupModal";
import QuickReplyModal from "./components/QuickReplyModal";

const LoadingScreen = () => (
  <div className="h-screen flex justify-center items-center bg-base-100">
    <div className="text-center">
      <span className="loading loading-spinner loading-lg"></span>
      <p className="mt-4 text-base-content/70">Loading...</p>
    </div>
  </div>
);


const ProtectedRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { 
    isSearchModalOpen, 
    isCreateGroupModalOpen,
    isMessageModalOpen
  } = useModalStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

 
  if (isCheckingAuth) {
    return <LoadingScreen />;
  }
  return (
    <div data-theme={theme}>
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated>
              <SignupPage />
            </RedirectIfAuthenticated>
          }
        />
      </Routes>

      {isSearchModalOpen && <SearchModal />}
      {isCreateGroupModalOpen && <CreateGroupModal />}
      {isMessageModalOpen && <QuickReplyModal />}
      
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--fallback-b1,oklch(var(--b1)))',
            color: 'var(--fallback-bc,oklch(var(--bc)))',
          },
        }}
      />
    </div>
    </div>
  );
};

export default App;