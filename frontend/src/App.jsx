import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/homepage'
import LoginSignup from './pages/loginsignup'
import Dashboard from './pages/dashboard'


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginSignup key="login" initialMode="login" />} />
      <Route path="/signup" element={<LoginSignup key="signup" initialMode="signup" />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
