import React from 'react';
import { getDay } from '../common/date';
import { Link } from 'react-router-dom';

const BlogPostCard = ({ content, author }) => {
  const {
    blog_id: id,
    title,
    tags,
    desc,
    banner,
    publishedAt,
    activity: { total_likes },
  } = content;
  const { username, fullname, profile_img } = author;

  return (
    <Link
      to={`/blog/${id}`}
      className="flex gap-8 border-b border-grey pb-5 mb-4 items-center"
    >
      <div className="w-full">
        {/* author info with time of blog publishing */}
        <div className="flex gap-2 items-center mb-7">
          <img
            src={profile_img}
            className="w-6 h-6 rounded-full border border-grey"
          />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p>{getDay(publishedAt)}</p>
        </div>

        <p className="blog-title">{title}</p>

        <p className="my-3 line-clamp-2 max-sm:hidden md:max-[1100px]:hidden leading-7 font-gelasio text-xl">
          {desc}
        </p>

        <div className="flex gap-4 mt-7 items-center">
          <span className="btn-light py-1 px-4">{tags[0]}</span>
          <span className="ml-3 flex gap-2 items-center">
            <i className="fi fi-rr-heart text-xl"></i>
            {total_likes}
          </span>
        </div>
      </div>

      {/* image on the right side */}
      <div className="h-28 aspect-square bg-grey">
        <img
          src={banner}
          className="h-full w-full aspect-square object-cover"
        />
      </div>
    </Link>
  );
};

export default BlogPostCard;
