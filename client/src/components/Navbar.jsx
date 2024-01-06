import { useContext, useState } from 'react';
import logo from '../images/logo.png';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import UserNavigation from './UserNavigation';

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNav, setUserNav] = useState(false);

  const navigate = useNavigate();

  const {
    userAuth: { accessKey, profile_img },
  } = useContext(UserContext);

  const handleSubmit = (e) => {
    const query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="logo" className="w-full" />
        </Link>

        <div
          className={`absolute w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show ${
            searchBoxVisibility ? 'show' : 'hide'
          }`}
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
            onKeyDown={handleSubmit}
          />
          <i className="fi fi-rr-search absolute right-[10%] top-1/2 -translate-y-1/2 md:pointer-events-none md:left-5 text-xl text-dark-grey"></i>
        </div>

        <div className="ml-auto">
          <button
            className="bg-grey w-12 h-12 rounded-full md:hidden"
            onClick={() => setSearchBoxVisibility((prev) => !prev)}
          >
            <i className="fi fi-rr-search text-2xl flex justify-center"></i>
          </button>
        </div>

        {accessKey ? (
          <>
            <Link to="/editor" className="hidden md:flex gap-2 link">
              <i className="fi fi-rr-file-edit"></i>
              <p>Write</p>
            </Link>

            <Link to="/dashboard/notification">
              <button className="w-12 h-12 rounded-full bg-black/10">
                <i className="fi fi-rr-bell text-2xl flex justify-center"></i>
              </button>
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setUserNav((prev) => !prev)}
              onMouseLeave={() => setUserNav(false)}
            >
              <button className="w-12 h-12 mt-1">
                <img
                  src={profile_img}
                  className="rounded-full w-full object-cover h-full border border-grey"
                />
              </button>

              {userNav && <UserNavigation />}
            </div>
          </>
        ) : (
          <>
            <Link to="/signin" className="btn-dark py-2">
              Sign In
            </Link>

            <Link to="/signup" className="btn-light py-2 hidden md:block">
              Sign Up
            </Link>
          </>
        )}
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
