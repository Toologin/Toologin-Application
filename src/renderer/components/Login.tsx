/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-danger */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Space, Alert, message as Mess } from 'antd';
import parse from 'html-react-parser';

import Config from '../config.json';
import './Login.css';

async function loginUser(credentials) {
  return fetch(`${Config.WOO_API.url}/wp-json/custom-plugin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  }).then((data) => data.json());
}

export default function Login({ setToken }) {
  const [message, setMessage] = useState();
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState<boolean>(false);

  const forgotLink = `${Config.WOO_API.url}/my-account/lost-password/`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await loginUser({
        username,
        password,
      });
      if (res.message) {
        setMessage(res.message);
      } else {
        setToken({
          user_id: res.ID,
          display_name: res.data.display_name,
          role: res.roles,
        });
      }
      setLoading(false);
    } catch (error) {
      Mess.error(error.message);
    }
  };

  return (
    <div className="app">
      <div className="login-form">
        <div className="title">Đăng nhập</div>
        <div className="form">
          {message && <Alert message={parse(message)} type="error" />}
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <label>Username </label>
              <input
                type="text"
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <label>Mật khẩu </label>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="button-container">
              <Space style={{ width: '100%' }}>
                <Button type="default" htmlType="submit" loading={loading}>
                  Đăng nhập
                </Button>
              </Space>
            </div>
          </form>
        </div>
        <div className="forgotPass">
          <a href={forgotLink} target="_blank" rel="noreferrer">
            Quên mật khẩu?
          </a>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired,
};
