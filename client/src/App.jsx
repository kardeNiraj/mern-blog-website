import { Route, Routes } from 'react-router-dom'
import { createContext, useState } from 'react'
import { useEffect } from 'react'

// utils
import { checkSession } from './common/session'

// components
import Navbar from './components/Navbar'

// pages
import UserAuthForm from './pages/UserAuthForm'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import Error404 from './pages/Error404'
import ProfilePage from './pages/ProfilePage'
import BlogPage from './pages/BlogPage'

export const UserContext = createContext()

const App = () => {
  const [userAuth, setUserAuth] = useState({})
  useEffect(() => {
    const userInSession = checkSession('user')
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null })
  }, [])

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="search/:query" element={<SearchPage />} />
          <Route path="user/:id" element={<ProfilePage />} />
          <Route path="blog/:id" element={<BlogPage />} />
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  )
}

export default App
