/* eslint-disable promise/always-return */
import { useState } from 'react';
import UseToken from './useToken';
import Config from '../config.json';

export default function VerifyToken() {
  const [verify, setVerify] = useState(true);

  async function makeVerify(token) {
    try {
      await fetch(`${Config.WOO_API.url}/wp-json/custom-plugin/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: token.user_id }),
      }).then((res) => {
        if (res) {
          setVerify(true);
        } else {
          setVerify(false);
        }
      });
    } catch (error) {
      localStorage.clear();
      window.location.reload();
    }
  }

  const { token } = UseToken();
  if (token) {
    makeVerify(token);
  }

  return {
    setVerify,
    verify,
  };
}
