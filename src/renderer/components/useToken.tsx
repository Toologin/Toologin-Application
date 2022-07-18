import { useState } from 'react';

export default function UseToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    const token = JSON.parse(tokenString);
    return token;
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken) => {
    localStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken.token);
    window.location.reload();
  };

  return {
    setToken: saveToken,
    token,
  };
}
