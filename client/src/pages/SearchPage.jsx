import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InPageNavigation from '../components/InPageNavigation';
import Loader from '../components/Loader';
import AnimationWrapper from '../common/AnimationWrapper';
import NoDataMessage from '../components/NoDataMessage';
import LoadMoreBtn from '../components/LoadMoreBtn';
import axios from 'axios';
import { filterPaginationData } from '../common/filter-pagination-data';
import BlogPostCard from '../components/BlogPostCard';
import UserCard from '../components/UserCard';

const SearchPage = () => {
  const { query } = useParams();
  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);

  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {
        query,
        page,
      })
      .then(async ({ data }) => {
        const formatedData = await filterPaginationData({
          state: blogs,
          page,
          countRoute: '/search-blog-count',
          data: data.blogs,
          data_to_send: { query },
          create_new_arr,
        });

        setBlogs(formatedData);
      })
      .catch((err) => console.log(err));
  };

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  const fetchUsers = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + '/search-users', {
        query,
      })
      .then(({ data: { users } }) => {
        // console.log(data);
        setUsers(users);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const UserCardWrapper = () => {
    return (
      <>
        {users == null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => {
            return (
              <AnimationWrapper
                key={i}
                transition={{ duration: 1, delay: i * 0.1 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No users found" />
        )}
      </>
    );
  };

  return (
    <section className="h-cover flex gap-10 justify-center">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results for "${query}"`, 'Accounts Matched']}
          hideOnLargeScreen={['Accounts Matched']}
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
                );
              })
            ) : (
              <NoDataMessage message="No blog published" />
            )}
            <LoadMoreBtn state={blogs} fetchDataFun={searchBlogs} />
          </>

          <UserCardWrapper />
        </InPageNavigation>
      </div>

      <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="text-xl font-medium mb-8">
          Users related to search <i className="fi fi-rr-user"></i>
        </h1>

        <UserCardWrapper />
      </div>
    </section>
  );
};

export default SearchPage;
