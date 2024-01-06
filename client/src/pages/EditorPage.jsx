import { createContext, useContext, useState } from 'react';
import { UserContext } from '../App';
import { Navigate } from 'react-router-dom';
import PublishForm from '../components/PublishForm';
import BlogEditor from '../components/BlogEditor';

const blogStructure = {
  title: '',
  banner: '',
  content: [],
  tags: [],
  desc: '',
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const EditorPage = () => {
  const {
    userAuth: { accessKey },
  } = useContext(UserContext);

  //   states
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState('editor');
  const [textEditor, setTextEditor] = useState({ isReady: false });

  return (
    <>
      <EditorContext.Provider
        value={{
          blog,
          setBlog,
          editorState,
          setEditorState,
          textEditor,
          setTextEditor,
        }}
      >
        {accessKey === null ? (
          <Navigate to="/signin" />
        ) : editorState == 'editor' ? (
          <BlogEditor />
        ) : (
          <PublishForm />
        )}
      </EditorContext.Provider>
    </>
  );
};

export default EditorPage;
