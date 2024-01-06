import React from 'react';

const NoDataMessage = ({ message }) => {
  return (
    <div className="w-full p-4 rounded-full text-center mt-4 bg-grey/50">
      {message}
    </div>
  );
};

export default NoDataMessage;
