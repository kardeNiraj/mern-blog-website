import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserAuthForm from './pages/UserAuthForm';
import { createContext, useState } from 'react';
import { useEffect } from 'react';
import { checkSession } from './common/session';

export const UserContext = createContext();

const App = () => {
  const [userAuth, setUserAuth] = useState({});
  useEffect(() => {
    const userInSession = checkSession('user');
    console.log(JSON.parse(userInSession));
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
