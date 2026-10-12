import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

// lazy so each page only loads its own CSS — loginsignup.css restyles
// shared classes (.btn, .hero, .lead) and must not leak onto the homepage
const HomePage = lazy(() => import('./pages/homepage'))
const LoginSignup = lazy(() => import('./pages/loginsignup'))

const App = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginSignup key="login" initialMode="login" />} />
        <Route path="/signup" element={<LoginSignup key="signup" initialMode="signup" />} />
      </Routes>
    </Suspense>
  )
}

export default App
