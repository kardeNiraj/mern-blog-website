import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AnimationWrapper from '../common/AnimationWrapper'
import Loader from '../components/Loader'
import { UserContext } from '../App'
import AboutUser from '../components/AboutUser'
import { filterPaginationData } from '../common/filter-pagination-data'
import InPageNavigation from '../components/InPageNavigation'
import BlogPostCard from '../components/BlogPostCard'
import NoDataMessage from '../components/NoDataMessage'
import LoadMoreBtn from '../components/LoadMoreBtn'
import Error404 from './Error404'

const ProfilePage = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState(null)
  const [currentProfile, setCurrentProfile] = useState('')

  const {
    userAuth: { username },
  } = useContext(UserContext)

  const {
    personal_info: { fullname, username: name, profile_img, bio } = {},
    social_links,
    joinedAt,
    account_info: { total_posts, total_reads } = {},
  } = profile || {}

  const fetchUserData = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + '/get-profile', {
        username: id,
      })
      .then(({ data: user }) => {
        console.log(user)
        if (user) {
          setProfile(user)
          fetchBlogs({ user_id: user._id })
        }

        setCurrentProfile(id)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err.message)
        setLoading(false)
      })
  }

  const fetchBlogs = ({ page = 1, user_id }) => {
    user_id = user_id || blogs.user_id

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          countRoute: '/search-blog-count',
          page,
          data_to_send: { author: user_id },
        })
        formatedData.user_id = user_id
        setBlogs(formatedData)
      })
  }

  const resetStates = () => {
    setProfile(null)
    setLoading(true)
  }

  useEffect(() => {
    if (currentProfile != id) setBlogs(null)

    if (!blogs) {
      resetStates()
      fetchUserData()
    }
  }, [id, blogs])

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : name ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          {/* user profile info */}
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              className="w-48 h-48 rounded-full bg-grey border border-grey md:w-32 md:h-32"
            />

            <h1 className="text-2xl font-medium">@{name}</h1>
            <p className="text-xl h-6 capitalize">{fullname}</p>
            <p>
              {total_posts?.toLocaleString()} Blogs -{' '}
              {total_reads?.toLocaleString()} Reads
            </p>

            {/* edit profile button */}
            <div className="flex gap-4 mt-2">
              {id === username && (
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            <AboutUser
              joinedAt={joinedAt}
              bio={bio}
              social_links={social_links}
              className={`max-md:hidden`}
            />
          </div>

          {/* render blogs posted by user */}
          <div className="max-md:mt-12 w-full">
            <InPageNavigation
              routes={['blogs published', 'about']}
              hideOnLargeScreen={['about']}
            >
              <>
                {blogs == null ? (
                  <Loader />
                ) : blogs.results.length ? (
                  blogs.results.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        transition={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimationWrapper>
                    )
                  })
                ) : (
                  <NoDataMessage message="No blog published" />
                )}
                <LoadMoreBtn state={blogs} fetchDataFun={fetchBlogs} />
              </>

              <AboutUser
                bio={bio}
                joinedAt={joinedAt}
                social_links={social_links}
              />
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <Error404 />
      )}
    </AnimationWrapper>
  )
}

export default ProfilePage
