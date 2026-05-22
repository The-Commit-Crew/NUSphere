import { Link } from 'react-router-dom'
function Homepage(){
    return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to NUSphere</h1>
      <p className="text-gray-500">Your NUS community hub</p>
       <Link to="/login" className="text-blue-600 underline">
        Go to Login
      </Link>
    </div>
  )
}
export default Homepage