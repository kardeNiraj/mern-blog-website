import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAMIGQqtkBJ5IN610PZcmsZAE-0_2I4K0Q',
  authDomain: 'mern-blog-website-ff208.firebaseapp.com',
  projectId: 'mern-blog-website-ff208',
  storageBucket: 'mern-blog-website-ff208.appspot.com',
  messagingSenderId: '460814597713',
  appId: '1:460814597713:web:4658a349eba652420a4270',
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;
  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => console.log(err));

  return user;
};
