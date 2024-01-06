import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AnimationWrapper from '../common/AnimationWrapper'
import InPageNavigation, { activeTabRef } from '../components/InPageNavigation'
import Loader from '../components/Loader'
import BlogPostCard from '../components/BlogPostCard'
import MinimalBlogPost from '../components/MinimalBlogPost'
import NoDataMessage from '../components/NoDataMessage'
import { filterPaginationData } from '../common/filter-pagination-data'
import LoadMoreBtn from '../components/LoadMoreBtn'

const HomePage = () => {
  const [blogs, setBlogs] = useState(null)
  const [trendingBlogs, setTrendingBlogs] = useState(null)
  const [pageState, setPageState] = useState('home')

  const categories = [
    'programming',
    'test',
    'film making',
    'social media',
    'cooking',
    'tech',
    'finances',
    'travel',
    'love',
  ]

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + '/latest-blogs', { page })
      .then(async ({ data }) => {
        const formatedData = await filterPaginationData({
          state: blogs,
          page,
          countRoute: '/all-latest-post-count',
          data: data.blogs,
        })

        setBlogs(formatedData)
      })
      .catch((err) => console.log(err))
  }

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        const formatedData = await filterPaginationData({
          state: blogs,
          page,
          countRoute: '/search-blog-count',
          data: data.blogs,
          data_to_send: { tag: pageState },
        })

        setBlogs(formatedData)
      })
      .catch((err) => console.log(err))
  }

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + '/trending-blogs')
      .then(({ data: { blogs } }) => {
        setTrendingBlogs(blogs)
      })
      .catch(
        ({
          response: {
            data: { error },
          },
        }) => console.log(error)
      )
  }

  useEffect(() => {
    activeTabRef.current.click()

    if (pageState == 'home') fetchLatestBlogs({ page: 1 })
    else fetchBlogsByCategory({ page: 1 })

    if (!trendingBlogs) fetchTrendingBlogs()
  }, [pageState])

  const loadContentByCategory = (e) => {
    const category = e.target.innerText.toLowerCase()

    setBlogs(null)

    if (pageState == category) {
      setPageState('home')
      return
    }

    setPageState(category)
  }

  return (
    <AnimationWrapper>
      <section className="h-cover flex gap-10 justify-center">
        {/* latest blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, 'trending blogs']}
            hideOnLargeScreen={['trending blogs']}
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
              <LoadMoreBtn
                state={blogs}
                fetchDataFun={
                  pageState == 'home' ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>
            {trendingBlogs == null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                )
              })
            ) : (
              <NoDataMessage message="No Trending Blogs" />
            )}
          </InPageNavigation>
        </div>

        {/* filters and trending */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            {/* filters -- tags */}
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests:
              </h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => (
                  <button
                    onClick={loadContentByCategory}
                    key={i}
                    className={`tag ${
                      pageState == category && 'bg-black text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* trending */}
            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-sr-arrow-trend-up text-xl"></i>
              </h1>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  )
                })
              ) : (
                <NoDataMessage message="No Trending Blogs" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  )
}

export default HomePage
