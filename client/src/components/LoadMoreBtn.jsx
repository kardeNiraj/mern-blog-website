import React from 'react';

const LoadMoreBtn = ({ state, fetchDataFun }) => {
  // console.log(state);
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <button
        onClick={() => fetchDataFun({ page: state.page + 1 })}
        className="text-dark-grey p-2 px-3 rounded-md hover:bg-grey/30 flex items-center gap-2"
      >
        Load More
      </button>
    );
  }
};

export default LoadMoreBtn;
