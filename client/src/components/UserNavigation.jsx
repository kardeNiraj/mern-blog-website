import { Link } from 'react-router-dom';
import AnimationWrapper from '../common/AnimationWrapper';
import { useContext } from 'react';
import { UserContext } from '../App';
import { clearSession } from '../common/session';

const UserNavigation = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);

  const handleSignout = () => {
    clearSession('user');
    setUserAuth({ accessKey: null });
  };

  return (
    <AnimationWrapper transition={{ duration: 0.2 }}>
      <div className="absolute right-0 w-60 border border-grey bg-white duration-200">
        <Link to="/editor" className="md:hidden flex gap-2 link pl-8 py-4">
          <i className="fi fi-rr-file-edit"></i>
          <p>Write</p>
        </Link>

        <Link to={`/user/${username}`} className="link pl-8 py-4">
          Profile
        </Link>

        <Link to="/dashboard/blogs" className="link pl-8 py-4">
          Dashboard
        </Link>

        <Link to="/settings/edit-profile" className="link pl-8 py-4">
          Settings
        </Link>

        <span className="absolute border border-grey -translate-x-[1px] w-[101%]">
          <button
            className="text-left pl-8 py-4 bg-white hover:bg-grey w-full"
            onClick={handleSignout}
          >
            <h1 className="font-bold text-xl mb-1">Sign Out</h1>
            <p className="text-dark-grey">@{username}</p>
          </button>
        </span>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigation;
