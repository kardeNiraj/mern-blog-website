import { useContext } from 'react';
import { EditorContext } from '../pages/EditorPage';

const Tag = ({ tag }) => {
  let {
    blog,
    setBlog,
    blog: { tags },
  } = useContext(EditorContext);

  const handleTagRemove = () => {
    tags = tags.filter((val) => val != tag);
    setBlog({ ...blog, tags });
  };

  return (
    <div className="relative p-2 mr-2 mt-2 px-5 bg-white inline-block rounded-full hover:bg-opacity-50 pr-10">
      <p>{tag}</p>
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 mt-[2px] rounded-full"
        onClick={handleTagRemove}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tag;
