import React from 'react';
import { Link } from 'react-router-dom';
import { getFullDay } from '../common/date';

const AboutUser = ({ bio, joinedAt, social_links, className }) => {
  return (
    <div className={`md:mt-7 md:w-[90%] ${className}`}>
      <p className="text-xl leading-7">
        {bio.length ? bio : 'Nothing here to read'}
      </p>

      <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
        {Object.keys(social_links).map((key) => {
          const link = social_links[key];
          return (
            link && (
              <Link to={link} key={key} target="_blank">
                <i
                  className={`fi ${
                    key === 'website' ? 'fi-rr-globe' : `fi-brands-${key}`
                  } text-2xl hover:text-black`}
                ></i>
              </Link>
            )
          );
        })}
      </div>

      <p className="text-xl text-dark-grey leading-7">
        Joined On - {getFullDay(joinedAt)}
      </p>
    </div>
  );
};

export default AboutUser;
