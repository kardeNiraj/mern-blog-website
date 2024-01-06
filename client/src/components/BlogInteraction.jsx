import React, { useContext } from 'react'
import { BlogContext } from '../pages/BlogPage'
import { Link } from 'react-router-dom'
import { UserContext } from '../App'

const BlogInteraction = () => {
  const {
    blog: {
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: name },
      },
    },
    setBlog,
  } = useContext(BlogContext)

  const {
    userAuth: { username },
  } = useContext(UserContext)

  return (
    <>
      <hr className="border-grey my-2" />

      <div className="flex gap-6 justify-between items-center">
        <div className="flex gap-3 items-center">
          <button className="w-10 h-10 bg-grey/80 rounded-full flex items-center justify-center">
            <i className="fi fi-rr-heart"></i>
          </button>

          <p className="text-dark-grey text-xl">{total_likes}</p>

          <button className="w-10 h-10 bg-grey/80 rounded-full flex items-center justify-center">
            <i className="fi fi-rr-comment-smile"></i>
          </button>

          <p className="text-dark-grey text-xl">{total_comments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {username == name && (
            <Link
              to={`/editor/${blog_id}`}
              className="hover:text-purple underline"
            >
              Edit
            </Link>
          )}

          <Link
            target="_blank"
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
          >
            <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
          </Link>
        </div>
      </div>

      <hr className="border-grey my-2" />
    </>
  )
}

export default BlogInteraction
