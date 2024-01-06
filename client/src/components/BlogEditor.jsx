import { Link, useNavigate } from 'react-router-dom';
import logo from '../images/logo.png';
import defaultBanner from '../images/blog banner.png';
import AnimationWrapper from '../common/AnimationWrapper';
import { uploadImage } from '../common/aws';
import { useContext, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import EditorJS from '@editorjs/editorjs';
import { tools } from './tools.js';
import axios from 'axios';

// contexts
import { EditorContext } from '../pages/EditorPage';
import { UserContext } from '../App.jsx';

const BlogEditor = () => {
  const navigate = useNavigate();

  let {
    blog,
    blog: { title, content, banner, tags, desc },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  const {
    userAuth: { accessKey },
  } = useContext(UserContext);

  // useEffects
  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: 'textEditor',
          data: content,
          placeholder: "Let's write an awesome story!",
          tools: tools,
        })
      );
    }
  }, []);

  const handleBannerUpload = (e) => {
    e.preventDefault();
    const img = e.target.files[0];

    if (img) {
      const loadingToast = toast.loading('Uploading...');
      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success('Uploaded 👍');

            setBlog({ ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err);
        });
    }
  };

  // publish
  const handleBlogPublish = () => {
    if (!blog.banner.length) return toast.error('Please upload a banner image');
    if (!blog.title.length) return toast.error('Please enter a blog title');
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks?.length) {
            // console.log(data.blocks);
            setBlog({ ...blog, content: data });
            setEditorState('publish');
          } else return toast.error('Write some content to publish the blog');
        })
        .catch((err) => toast.error(err.message));
    }
  };

  // draft
  const handleBlogDraftSave = (e) => {
    if (e.target.className.includes('disable')) return;

    if (!title?.length)
      return toast.error('please provide a title to draft the blog');

    const loadingToast = toast.loading('saving...');

    e.target.classList.add('disable');

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        const blogBody = {
          title,
          desc,
          tags,
          content,
          banner,
          draft: true,
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
            toast.success('Saved 👍');

            setTimeout(() => {
              navigate('/');
            }, 600);
          })
          .catch(({ response }) => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);

            return toast.error(response.data.error);
          });
      });
    }
  };

  // banner utils
  const handleBannerError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };

  // textarea utils
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      // enter key pressed
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    const input = e.target;

    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';

    setBlog({ ...blog, title: input.value });
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} />
        </Link>
        <p className="text-black line-clamp-1 max-md:hidden w-full">
          {title.length ? title : 'New Blog'}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark my-2" onClick={handleBlogPublish}>
            Publish
          </button>
          <button className="btn-light my-2" onClick={handleBlogDraftSave}>
            Save Draft
          </button>
        </div>
      </nav>

      <Toaster />

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  onError={handleBannerError}
                  className="z-20"
                />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".jpg, .jpeg, .png"
                  onChange={handleBannerUpload}
                  hidden
                />
              </label>
            </div>
          </div>

          <textarea
            defaultValue={title}
            placeholder="Blog Title"
            className="text-4xl font-medium resize-none outline-none w-full h-20 leading-tight mt-10"
            onKeyDown={handleTitleKeyDown}
            onChange={handleTitleChange}
          ></textarea>

          <hr className="opacity-10 w-full py-5" />

          <div id="textEditor" className="font-gelasio"></div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
