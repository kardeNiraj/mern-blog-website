import jwt from 'jsonwebtoken';
import cors from 'cors';
import User from './Schema/User.js';
import bcrypt from 'bcrypt';
import express from 'express';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import 'dotenv/config';
import { getAuth } from 'firebase-admin/auth';

// firebase configuration
import admin from 'firebase-admin';
import serviceAccountKey from './mern-blog-website-ff208-firebase-adminsdk-zt2q9-553ef758e2.json' assert { type: 'json' };
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

const app = express();
const port = 3000;

// regex
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// middleware
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  autoIndex: true,
});

// utility functions
const formatDataToSend = (user) => {
  const { profile_img, username, fullname } = user.personal_info;
  const accessKey = jwt.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY);

  return {
    accessKey,
    profile_img,
    username,
    fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split('@')[0];

  const usernameExists = await User.exists({
    'personal_info.username': username,
  }).then((res) => res);
  usernameExists && (username += '-' + nanoid().substring(0, 4));

  return username;
};

// routes
app.post('/signup', (req, res) => {
  const { fullname, email, password } = req.body;

  //   validation
  if (fullname < 3)
    return res.status(403).json({ message: 'Full Name required!' });
  if (email == undefined || !email.length)
    return res.status(403).json({ message: 'enter email' });
  if (!emailRegex.test(email))
    return res.status(403).json({ error: 'invalid email' });
  if (!passwordRegex.test(password))
    return res.status(403).json({
      error:
        'Password should be 6 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letters',
    });

  // hashing password
  bcrypt.hash(password, 10, async (err, hash) => {
    const username = await generateUsername(email);
    const emailExists = await User.findOne({
      'personal_info.email': email,
    }).then((user) => {
      if (user) return res.status(403).json({ error: 'email already exists' });
    });

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hash,
        username,
      },
    });

    user
      .save()
      .then((u) => {
        res.status(200).json(formatDataToSend(u));
      })
      .catch((err) => res.status(500).json({ error: err.message }));
  });
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ 'personal_info.email': email })
    .then((user) => {
      if (!user) return res.status(404).json({ error: 'email not found' });

      if (user.google_auth)
        return res.status(403).json({
          error:
            'this account was created using google. try logging in with google.',
        });

      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result) return res.status(403).json({ error: 'invalid passowrd' });
        return res.json(formatDataToSend(user));
      });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post('/google-auth', async (req, res) => {
  const { accessKey } = req.body;
  getAuth()
    .verifyIdToken(accessKey)
    .then(async (userData) => {
      let { email, name, picture } = userData;
      picture = picture.replace('s96-c', 's384-c');

      let user = await User.findOne({ 'personal_info.email': email })
        .select(
          'personal_info.fullname personal_info.username personal_info.profile_img google_auth'
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => res.status(500).json({ error: err.message }));

      if (user) {
        if (!user.google_auth)
          return res.status(403).json({
            error:
              'this email was signed up without google. please use your password to login',
          });
      } else {
        let username = await generateUsername(email);
        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username,
          },
          google_auth: true,
        });

        await user
          .save()
          .then((u) => (user = u))
          .catch((err) => res.status(500).json({ error: err.message }));
      }

      return res.status(200).json(formatDataToSend(user));
    })
    .catch((err) =>
      res.status(500).json({
        error:
          'Failed to authenticate you with google. try using another account.',
      })
    );
});

app.listen(port, () => {
  console.log(`listening on port -> ${port}`);
});
