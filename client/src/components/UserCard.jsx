import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({
  user: {
    personal_info: { fullname, username, profile_img },
  },
}) => {
  //   console.log(user);
  return (
    <Link to={`/user/${username}`}>
      <img src={profile_img} className="w-14 h-14 rounded-full" />

      <div>
        <h1 className="text-xl font-medium line-clamp-2">{fullname}</h1>
        <p className="text-dark-grey">@{username}</p>
      </div>
    </Link>
  );
};

export default UserCard;
