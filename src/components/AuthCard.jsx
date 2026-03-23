import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AuthCard({ onLogin, onSignup, authError, isSubmitting }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    onLogin(email.trim(), password)
  }

  const handleSignup = (e) => {
    e.preventDefault()
    onSignup(name.trim(), email.trim(), password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-gray-100 px-4 py-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl shadow-md p-6 bg-white"
      >
        <h1 className="text-2xl font-bold text-gray-800">AI Life Admin</h1>
        <p className="text-sm text-gray-500 mt-1">💸 Smart Finance Starts Here</p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {authError && (
            <div className="p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">
              {authError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <motion.button
              type="submit"
              onClick={handleLogin}
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md disabled:opacity-60"
            >
              Login
            </motion.button>
            <motion.button
              type="submit"
              onClick={handleSignup}
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md disabled:opacity-60"
            >
              Sign Up
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
