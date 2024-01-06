import jwt from 'jsonwebtoken'
import cors from 'cors'
import bcrypt from 'bcrypt'
import express from 'express'
import mongoose from 'mongoose'
import { nanoid } from 'nanoid'
import 'dotenv/config'
import aws from 'aws-sdk'

// firebase configuration
import admin from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import serviceAccountKey from './mern-blog-website-ff208-firebase-adminsdk-zt2q9-553ef758e2.json' assert { type: 'json' }

// schemas
import Blog from './Schema/Blog.js'
import User from './Schema/User.js'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
})

const app = express()
const port = 3001

// regex
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/ // regex for password

// middleware
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGODB_URI, {
  autoIndex: true,
})

// aws setting
const s3 = new aws.S3({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_PUBLIC_KEY,
  secretAccessKey: process.env.AWS_PRIVATE_KEY,
})

// utility functions
const generateUploadUrl = async () => {
  const date = new Date()
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`

  return await s3.getSignedUrlPromise('putObject', {
    Bucket: 'mern-blog-website',
    Key: imageName,
    Expires: 1000,
    ContentType: 'image/jpeg',
  })
}

const formatDataToSend = (user) => {
  const { profile_img, username, fullname } = user.personal_info
  const accessKey = jwt.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY)

  return {
    accessKey,
    profile_img,
    username,
    fullname,
  }
}

const generateUsername = async (email) => {
  let username = email.split('@')[0]

  const usernameExists = await User.exists({
    'personal_info.username': username,
  }).then((res) => res)
  usernameExists && (username += '-' + nanoid().substring(0, 4))

  return username
}

// auth middleware
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader ? authHeader.split(' ')[1] : null

  if (token == null) return res.status(401).json({ error: 'Unauthorised user' })

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, result) => {
    if (err) return res.status(403).json({ error: 'Unauthorized user' })
    req.user = result.id
    next()
  })
}

// routes
app.get('/get-upload-url', (req, res) => {
  generateUploadUrl()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => res.status(500).json({ error: err.message }))
})

app.post('/signup', (req, res) => {
  const { fullname, email, password } = req.body

  //   validation
  if (fullname < 3)
    return res.status(403).json({ message: 'Full Name required!' })
  if (email == undefined || !email.length)
    return res.status(403).json({ message: 'enter email' })
  if (!emailRegex.test(email))
    return res.status(403).json({ error: 'invalid email' })
  if (!passwordRegex.test(password))
    return res.status(403).json({
      error:
        'Password should be 6 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letters',
    })

  // hashing password
  bcrypt.hash(password, 10, async (err, hash) => {
    const username = await generateUsername(email)
    const emailExists = await User.findOne({
      'personal_info.email': email,
    }).then((user) => {
      if (user) return res.status(403).json({ error: 'email already exists' })
    })

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hash,
        username,
      },
    })

    user
      .save()
      .then((u) => {
        res.status(200).json(formatDataToSend(u))
      })
      .catch((err) => res.status(500).json({ error: err.message }))
  })
})

app.post('/signin', (req, res) => {
  const { email, password } = req.body
  User.findOne({ 'personal_info.email': email })
    .then((user) => {
      if (!user) return res.status(404).json({ error: 'email not found' })

      if (user.google_auth)
        return res.status(403).json({
          error:
            'this account was created using google. try logging in with google.',
        })

      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) return res.status(500).json({ error: err.message })
        if (!result) return res.status(403).json({ error: 'invalid passowrd' })
        return res.json(formatDataToSend(user))
      })
    })
    .catch((err) => res.status(500).json({ error: err.message }))
})

app.post('/google-auth', async (req, res) => {
  const { accessKey } = req.body
  getAuth()
    .verifyIdToken(accessKey)
    .then(async (userData) => {
      let { email, name, picture } = userData
      picture = picture.replace('s96-c', 's384-c')

      let user = await User.findOne({ 'personal_info.email': email })
        .select(
          'personal_info.fullname personal_info.username personal_info.profile_img google_auth'
        )
        .then((u) => {
          return u || null
        })
        .catch((err) => res.status(500).json({ error: err.message }))

      if (user) {
        if (!user.google_auth)
          return res.status(403).json({
            error:
              'this email was signed up without google. please use your password to login',
          })
      } else {
        let username = await generateUsername(email)
        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username,
          },
          google_auth: true,
        })

        await user
          .save()
          .then((u) => (user = u))
          .catch((err) => res.status(500).json({ error: err.message }))
      }

      return res.status(200).json(formatDataToSend(user))
    })
    .catch((err) =>
      res.status(500).json({
        error:
          'Failed to authenticate you with google. try using another account.',
      })
    )
})

app.post('/latest-blogs', (req, res) => {
  const { page } = req.body
  const maxLimit = 5
  Blog.find({ draft: false })
    .populate(
      'author',
      'personal_info.profile_img personal_info.username personal_info.fullname -_id'
    )
    .sort({ publishedAt: -1 })
    .select('blog_id title desc banner activity tags publishedAt -_id')
    .skip(maxLimit * (page - 1))
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs })
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message })
    })
})

app.get('/trending-blogs', (req, res) => {
  Blog.find({ draft: false })
    .populate(
      'author',
      'personal_info.profile_img personal_info.username personal_info.fullname -_id'
    )
    .sort({
      'activity.total_reads': -1,
      'activity.total_likes': -1,
      publishedAt: -1,
    })
    .select('publishedAt title blog_id -_id')
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs })
    })
    .catch((err) => res.status(500).json({ error: err.message }))
})

app.post('/search-blogs', (req, res) => {
  const { tag, query, page, author } = req.body

  let findQuery

  if (tag) {
    findQuery = { tags: tag, draft: false }
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, 'i') }
  } else if (author) {
    findQuery = { draft: false, author }
  }

  const maxLimit = 5

  Blog.find(findQuery)
    .populate(
      'author',
      'personal_info.profile_img personal_info.username personal_info.fullname -_id'
    )
    .sort({ publishedAt: -1 })
    .select('blog_id title desc banner activity tags publishedAt -_id')
    .skip(maxLimit * (page - 1))
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs })
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message })
    })
})

app.post('/all-latest-post-count', (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      res.status(200).json({ totalDocs: count })
    })
    .catch((err) => res.status(500).json({ error: err.message }))
})

app.post('/search-blog-count', (req, res) => {
  const { tag, query, author } = req.body

  let findQuery

  if (tag) {
    findQuery = { tags: tag, draft: false }
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, 'i') }
  } else if (author) {
    findQuery = { draft: false, author }
  }

  Blog.countDocuments(findQuery)
    .then((count) => {
      res.status(200).json({ totalDocs: count })
    })
    .catch((err) => res.status(500).json({ error: err.message }))
})

app.post('/search-users', (req, res) => {
  const { query } = req.body

  User.find({ 'personal_info.username': new RegExp(query, 'i') })
    .limit(50)
    .select(
      'personal_info.username personal_info.fullname personal_info.profile_img -_id'
    )
    .then((users) => {
      return res.status(200).json({ users })
    })
    .catch((err) => res.status(500).json({ error: err.message }))
})

app.post('/get-profile', (req, res) => {
  const { username } = req.body
  User.findOne({ 'personal_info.username': username })
    .select('-personal_info.password -google_auth -updatedAt -blogs')
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(500).json({ error: err.message }))
})

app.post('/get-blog', (req, res) => {
  const { blog_id } = req.body
  Blog.findOneAndUpdate(
    { blog_id: blog_id },
    { $inc: { 'activity.total_reads': 1 } },
    { returnDocument: 'after' }
  )
    .populate(
      'author',
      'personal_info.username personal_info.fullname personal_info.profile_img -_id'
    )
    .select('-draft -_id')
    .then((blog) => {
      User.findOneAndUpdate(
        { 'personal_info.username': blog.author.personal_info.username },
        { $inc: { 'account_info.total_reads': 1 } }
      ).catch((err) => res.status(500).json({ error: err.message }))
      return res.status(200).json(blog)
    })
    .catch((err) => res.status(500).json({ error: err.message }))
})

app.post('/create-blog', verifyJWT, (req, res) => {
  const authorId = req.user
  let { title, desc, banner, tags, content, draft } = req.body
  if (!title?.length)
    return res.status(403).json({ error: 'please provide a title' })

  if (!draft) {
    if (!desc?.length || desc?.length > 200)
      return res
        .status(403)
        .json({ error: 'description should be provided under 200 characters' })
    if (!banner?.length)
      return res.status(403).json({ error: 'please provide a banner' })
    if (!tags?.length || tags?.length > 200)
      return res
        .status(403)
        .json({ error: 'tags should be added for search optimisation' })
    if (!content) {
      return res.status(403).json({
        error:
          'write someting in the blog in order to provide insignts on the topic.',
      })
    }
  }

  tags = tags?.map((tag) => tag.toLowerCase())

  let blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/\s+/g, '-')
      .trim() + nanoid()

  let blog = new Blog({
    title,
    banner,
    desc,
    content: content.blocks,
    tags,
    author: authorId,
    blog_id,
    draft: Boolean(draft),
  })

  blog
    .save()
    .then((blog) => {
      const increment = draft ? 0 : 1
      if (increment) {
        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { 'account_info.total_posts': increment },
            $push: { blogs: blog._id },
          }
        )
          .then((user) => {
            return res.status(200).json({ id: blog.blog_id })
          })
          .catch((err) => {
            return res.status(500).json({ error: 'error updating the user' })
          })
      }
    })
    .catch((err) =>
      res
        .status(400)
        .json({ error: 'Invalid JSON payload', details: err.message })
    )
})

app.listen(port, () => {
  console.log(`listening on port -> ${port}`)
})
