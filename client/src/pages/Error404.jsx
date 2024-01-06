import { Link } from 'react-router-dom';

// images
import errorImage from '../images/404.png';
import fullLogo from '../images/full-logo.png';

const Error404 = () => {
  return (
    <div className="flex h-cover relative p-10 flex-col items-center gap-20 text-center">
      <img src={errorImage} className="w-72 h-72 select-none aspect-square" />
      <h1 className="text-4xl font-medium font-gelasio leading-7">
        Page Not Found
      </h1>

      <p className="text-xl leading-7 -mt-8 text-dark-grey">
        The page you are looking for does not exist. Head back to the{' '}
        <Link to="/" className="text-[#f6ca45] text-xl underline">
          home page
        </Link>
        .
      </p>

      <div className="mt-auto">
        <img
          src={fullLogo}
          className="h-8 object-contain mx-auto block select-none"
        />
        <p className="text-dark-grey mt-5">
          Reads different stories around the world
        </p>
      </div>
    </div>
  );
};

export default Error404;
