import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginScreen from './screens/LoginScreen'
import ChatScreen from './screens/ChatScreen'
import NotFoundScreen from './screens/NotFoundScreen'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<LoginScreen />} />
      <Route path='/chats' element={<ChatScreen />} />
      <Route path='*' element={<NotFoundScreen />} />
    </Routes>
  )
}

export default App
