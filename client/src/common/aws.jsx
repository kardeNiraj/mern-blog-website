import axios from 'axios';

export const uploadImage = async (img) => {
  let imgUrl = null;

  await axios
    .get(`${import.meta.env.VITE_SERVER_DOMAIN}/get-upload-url`)
    .then(async ({ data: { uploadURL } }) => {
      await axios({
        method: 'PUT',
        headers: { 'Content-Type': 'multipart/form-data' },
        url: uploadURL,
        data: img,
      })
        .then(() => (imgUrl = uploadURL.split('?')[0]))
        .catch((err) => console.log(err.message));
    })
    .catch((err) => console.log(err.message));

  return imgUrl;
};
