import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import { uploadImage } from '../common/aws';

// const uploadImageByUrl = async (e) => {
//   let link = await new Promise((resolve, reject) => {
//     try {
//       resolve(e);
//     } catch (err) {
//       reject(err);
//     }
//   });

//   return link.then((url) => {
//     return {
//       success: 1,
//       file: { url },
//     };
//   });
// };

// const uploadImageByFile = async (e) => {
//   return await uploadImage(e).then((url) => {
//     if (url) {
//       return {
//         success: 1,
//         file: { url },
//       };
//     }
//   });
// };

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: ImageTool,
    config: {
      uploader: {
        /**
         * Upload file to the server and return an uploaded image data
         * @param {File} file - file selected from the device or pasted by drag-n-drop
         * @return {Promise.<{success, file: {url}}>}
         */
        uploadByFile(file) {
          return uploadImage(file).then((url) => {
            if (url) {
              return {
                success: 1,
                file: { url },
              };
            }
          });
        },

        /**
         * Send URL-string to the server. Backend should load image by this URL and return an uploaded image data
         * @param {string} url - pasted image URL
         * @return {Promise.<{success, file: {url}}>}
         */
        async uploadByUrl(url) {
          const link = await new Promise((resolve, reject) => {
            try {
              resolve(url);
            } catch (err) {
              reject(err);
            }
          });

          return link.then((imgurl) => {
            return {
              success: 1,
              file: { url: imgurl },
            };
          });
        },
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: 'Type Heading...',
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
