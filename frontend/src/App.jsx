import { Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Loginpage from './pages/Loginpage'
import Registerpage from './pages/Registerpage'
import Verifyotppage from './pages/Verifyotppage'
import Navbar from './components/Navbar'
import Createpostpage from './pages/Createpostpage'
import Protectedroute from './components/Protectedroute'

function App() {
  return (
    <div style={{ backgroundColor: '#F5F0EB' }} className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/verify-otp" element={<Verifyotppage />} />
        <Route path="/create-post" element={<Protectedroute><Createpostpage /></Protectedroute>}/>
      </Routes>
    </div>
  )
}

export default App