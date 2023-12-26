import axios from 'axios';
import InputBox from '../components/InputBox';
import googleIcon from '../images/google.png';
import AnimationWrapper from '../common/AnimationWrapper';
import { Link, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { createSession } from '../common/session';
import { UserContext } from '../App';
import { authWithGoogle } from '../common/firebase';

const UserAuthForm = ({ type }) => {
  const {
    userAuth: { accessKey },
    setUserAuth,
  } = useContext(UserContext);

  const useAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        createSession('user', JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        return toast.error(response.data?.error);
      });
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        const serverRoute = '/google-auth';
        const formdata = {
          accessKey: user.accessToken,
        };

        useAuthThroughServer(serverRoute, formdata);
      })
      .catch((err) => {
        toast.error('trouble while logging in with google');
        return console.log(err);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // this does not directly provide the form data in required format so we have to manually append every item
    const form = new FormData(formElement);
    let formdata = {};

    // looping through the FormData
    for (let [key, value] of form.entries()) {
      formdata[key] = value;
    }

    // validation
    // regex
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const { email, password, fullname } = formdata;

    if (fullname?.length < 3) return toast.error('Full Name required !');
    if (email == undefined || !email.length) return toast.error('enter email');
    if (!emailRegex.test(email)) return toast.error('invalid email');
    if (!passwordRegex.test(password))
      return toast.error(
        'Password should be 6 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letters'
      );

    const serverRoute = type == 'sign-in' ? '/signin' : '/signup';

    useAuthThroughServer(serverRoute, formdata);
  };

  return accessKey ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyVal={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl capitalize text-center font-gelasio">
            {type == 'sign-in' ? 'welcome back' : 'join us today'}
          </h1>

          {type != 'sign-in' && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="full name"
              icon="fi-rr-user"
            />
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-lock"
          />

          <button
            className="btn-dark mt-14 center"
            type="submit"
            onClick={(e) => handleSubmit(e)}
          >
            {type.replace('-', ' ')}
          </button>

          {/* seperator */}
          <div className="text-black opacity-10 flex gap-2 w-full uppercase font-bold relative my-10 items-center">
            <hr className="w-1/2" />
            <p>or</p>
            <hr className="w-1/2" />
          </div>

          <button
            className="btn-dark flex gap-4 items-center justify-center w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} className="w-4" />
            continue with google
          </button>

          {type == 'sign-in' ? (
            <p className="text-center mt-6 text-dark-gray text-xl">
              Don't have an account ?{' '}
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Register Here.
              </Link>
            </p>
          ) : (
            <p className="text-center mt-6 text-dark-gray text-xl">
              Don't have an account ?{' '}
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Login Here.
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
