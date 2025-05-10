import { Fragment, useEffect } from "react"
import Navbar from "./components/Navbar"
import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import SignUp from "./pages/SignUp"
import Login from "./pages/Login"
import Settings from "./pages/Settings"
import ProfilePage from "./pages/ProfilePage"
import {useAuthStore} from "./store/useAuthStore"
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore"

function App() {
  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore();
  // console.log({onlineUsers});
  
  const {theme} = useThemeStore();
  useEffect(()=>{
    checkAuth();
  },[checkAuth]);
  if(isCheckingAuth && !authUser){
    return(
      <div className="flex item justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }
  return (
    <Fragment >
      <div className="" data-theme={theme}>
      <Navbar/>
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
      </div>
    </Fragment>
  )
}

export default App
