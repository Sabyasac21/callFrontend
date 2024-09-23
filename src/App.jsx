import './App.css'
import AuthPage from './components/AuthComponent/AuthPage';
import Login from './components/AuthComponent/Login'
import Register from './components/AuthComponent/Register'
import Home from './components/Home/Home';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/NavBar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import CallsComponent from './components/Dashboard/CallQueue/Queue';
import { RefreshProvider } from './contextApI/RefreshContext'

function App() {
  const isAuth = localStorage.getItem('auth')

  return (
    <>
    <RefreshProvider>
    
       <Router>
       <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<AuthPage><Login /></AuthPage>} />
        <Route path="/login" element={<AuthPage><Login /></AuthPage>} />
        <Route path="/register" element={<AuthPage><Register/></AuthPage>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/dashboard/:id/join" element={<CallsComponent/>} />

      </Routes>
    </Router>
    </RefreshProvider>
    </>
  )
}

export default App
