import 'antd/dist/antd.css';
import './App.css';
import { Outlet, Link } from 'react-router-dom';
import { Layout as LayoutAnt, Menu, Avatar, Popover } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import UseToken from './components/useToken';

const { Header, Content, Footer } = LayoutAnt;

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

const contentAvatar = (
  <div>
    <Link className="logout" to="/" onClick={logout}>
      Thoát
    </Link>
  </div>
);

const Layout = () => {
  const { token } = UseToken();
  return (
    <LayoutAnt className="layout">
      <Header>
        <div className="logo left">
          TOOLOGIN<sup>&reg;</sup>
        </div>
        <div className="left">
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['tools']}>
            <Menu.Item key="tools">
              <Link to="/">Access Tool</Link>
            </Menu.Item>
            {/* <Menu.Item>
            <Link to="/shop">Shop</Link>
          </Menu.Item> */}
          </Menu>
        </div>
        <div className="right">
          <Popover content={contentAvatar} title={token.display_name}>
            <Avatar className="avatar" size={30} icon={<UserOutlined />} />
          </Popover>
        </div>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Copyright 2022 © Toologin. All Rights Reserved.
      </Footer>
    </LayoutAnt>
  );
};

export default Layout;
