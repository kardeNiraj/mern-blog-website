import { Toaster, toast } from 'react-hot-toast';
import AnimationWrapper from '../common/AnimationWrapper';
import { useContext } from 'react';
import { EditorContext } from '../pages/EditorPage';
import Tag from './Tag';
import axios from 'axios';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';

const PublishForm = () => {
  const maxChar = 200;
  const tagsLimit = 10;

  const navigate = useNavigate();

  let {
    blog,
    setBlog,
    setEditorState,
    blog: { title, banner, desc, tags, content },
  } = useContext(EditorContext);

  const {
    userAuth: { accessKey },
  } = useContext(UserContext);

  const handleClosePublish = () => {
    setEditorState('editor');
  };

  // utils
  const handleTagsKeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();

      const tag = e.target.value;

      if (tags.length < tagsLimit && tag.length) {
        if (!tags.includes(tag)) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else toast.error(`maximum ${tagsLimit} tags allowed`);
      e.target.value = '';
    }
  };

  const handleBlogPublish = (e) => {
    if (e.target.className.includes('disable')) return;

    if (!title?.length) return toast.error('please provide a title');
    if (!desc?.length || desc?.length > maxChar)
      return toast.error('please provide a short description');
    if (!tags?.length || tags?.length > tagsLimit)
      return toast.error('include atleast 1 tag for us to rank your blog');

    const loadingToast = toast.loading('publishing...');

    e.target.classList.add('disable');

    const blogBody = {
      title,
      desc,
      tags,
      content,
      banner,
    };
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`, blogBody, {
        headers: {
          Authorization: `Bearer ${accessKey}`,
        },
      })
      .then(() => {
        e.target.classList.remove('disable');
        toast.dismiss(loadingToast);
        toast.success('Published 👍');

        setTimeout(() => {
          navigate('/');
        }, 600);
      })
      .catch(({ response }) => {
        e.target.classList.remove('disable');
        toast.dismiss(loadingToast);

        return toast.error(response.data.error);
      });
  };

  return (
    <>
      <AnimationWrapper>
        <section className="grid w-screen min-h-screen items-center py-16 lg:grid-cols-2 lg:gap-4">
          <Toaster />
          <button
            className="w-12 h-12 absolute right-[5vw] top-[5%] lg:top-[10%] z-10"
            onClick={handleClosePublish}
          >
            <i className="fi fi-br-cross"></i>
          </button>

          <div className="max-w-[550px] center">
            <p className="text-dark-grey mb-1">Preview</p>
            <img
              src={banner}
              className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4"
            />
            <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
              {title}
            </h1>
            <p className="font-gelasio line-clamp-2 leading-7 mt-4">{desc}</p>
          </div>

          <div>
            <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
            <input
              type="text"
              defaultValue={title}
              placeholder="Blog Title"
              className="input-box pl-4"
              onChange={(e) => setBlog({ ...blog, title: e.target.value })}
            />

            <p className="text-dark-grey mb-2 mt-9">
              Short description about the blog
            </p>
            <textarea
              defaultValue={desc}
              placeholder="Description"
              maxLength={maxChar}
              className="w-full h-32 resize-none input-box pl-4 leading-7"
              onChange={(e) => setBlog({ ...blog, desc: e.target.value })}
            ></textarea>

            <p className="text-dark-grey text-sm mt-1 text-right">
              {maxChar - desc.length} characters left
            </p>

            <p className="text-dark-grey mb-2 mt-9">
              Topics - ( helps us to search and rank your blog )
            </p>

            <div className="relative input-box p-2 pb-4">
              <input
                type="text"
                placeholder="Topic"
                className="input-box bg-white pl-4 sticky top-0 left-0 mb-3 focus:bg-white"
                onKeyDown={handleTagsKeyDown}
              />
              {tags?.map((tag, i) => (
                <Tag tag={tag} key={i} />
              ))}
            </div>

            <p className="text-dark-grey text-sm mt-1 text-right">
              {tagsLimit - tags.length} tags left
            </p>

            <button className="btn-dark px-8" onClick={handleBlogPublish}>
              Publish
            </button>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default PublishForm;
