import { useState } from 'react';

const InputBox = ({ name, id, type, placeholder, value, icon }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="relative mb-4 w-full">
      <input
        type={
          type == 'password' ? (passwordVisible ? 'text' : 'password') : type
        }
        name={name}
        id={id}
        placeholder={placeholder}
        defaultValue={value}
        className="input-box"
      />

      <i className={`fi ${icon} input-icon`}></i>

      {type == 'password' && (
        <i
          className={`fi fi-rr-eye${
            passwordVisible ? '' : '-crossed'
          } input-icon left-auto right-4 cursor-pointer`}
          onClick={() => setPasswordVisible((prev) => !prev)}
        ></i>
      )}
    </div>
  );
};

export default InputBox;
