import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AnimationWrapper from '../common/AnimationWrapper'
import Loader from '../components/Loader'
import { getDay } from '../common/date'
import BlogInteraction from '../components/BlogInteraction'

// context
export const BlogContext = createContext({})

const BlogPage = () => {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  const {
    activity,
    title,
    banner,
    desc,
    content,
    tags,
    publishedAt,
    author: {
      personal_info: { username: name, fullname, profile_img } = {},
    } = {},
  } = blog || {}

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog', {
        blog_id: id,
      })
      .then(({ data: blog }) => {
        setBlog(blog)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchBlog()
  }, [])

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={{ blog, setBlog }}>
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} className="aspect-video" />

            <div className="mt-12">
              <h2>{title}</h2>
            </div>

            <div className="flex justify-between max-sm:flex-col my-8">
              <div className="flex gap-5 items-start">
                <img
                  src={profile_img}
                  className="w-12 h-12 rounded-full border border-grey"
                />
                <p className="capitalize">
                  {fullname} <br /> @
                  <Link to={`/user/${name}`} className="underline">
                    {name}
                  </Link>
                </p>
              </div>

              <p className="text-dark-grey opacity-70 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                Published At - {getDay(publishedAt)}
              </p>
            </div>

            <BlogInteraction />
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  )
}

export default BlogPage
