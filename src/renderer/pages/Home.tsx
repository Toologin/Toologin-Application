/* eslint-disable promise/catch-or-return */
/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-array-index-key */
import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography } from 'antd';
import { ArrowRightOutlined, UndoOutlined } from '@ant-design/icons';
import UseToken from '../components/useToken';

const bar = message;
const { Text } = Typography;

function Home() {
  const { token } = UseToken();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  function destroy() {
    bar.destroy();
    setBtnLoading(false);
    return false;
  }

  window.electron.ipcRenderer.on('load_success', () => {
    destroy();
  });

  async function accessData(path, body) {
    try {
      bar
        .loading('Đã kết nối tới máy chủ.....', 2.5)
        .then(() =>
          bar.loading(`Đang tải dữ liệu từ ${body.path.toUpperCase()}.....`, 10)
        )
        .then(() =>
          bar.loading(
            'Server đang nạp tool, hãy click nút "Refresh" và đăng nhập lại nếu quá 15 giây chờ đợi.',
            99
          )
        );
      setBtnLoading(true);
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      };
      const response = await fetch(
        `${process.env.SERVER_URL}/${path}`,
        requestOptions
      );
      const data = await response.json();
      if (data.error || data.expired) {
        if (data.expired) {
          return window.location.reload();
        }
        message.error(data.error);
        destroy();
      }
      window.open(
        `https://toologin.com?data=${JSON.stringify(data)}`,
        '_blank'
      );
    } catch (error) {
      destroy();
    }
  }

  const columns = [
    {
      title: 'TT',
      dataIndex: 'stt',
      key: 'stt',
      align: 'center',
    },
    {
      title: 'Tên công cụ',
      dataIndex: 'name',
      key: 'name',
      render: (_, { name }) => (
        <>
          {name.image && (
            <img
              src={name.image}
              alt=""
              height="50px"
              style={{ marginRight: '10px' }}
            />
          )}
          {name.name}
        </>
      ),
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      render: (_, { date }) => (
        <>
          {date.expire_date !== null && date.expired_status === false && (
            <Text>{date.expire_date}</Text>
          )}
          {date.expire_date !== null && date.expired_status === true && (
            <Text type="warning">{date.expire_date}</Text>
          )}
        </>
      ),
    },
    {
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      align: 'center',
      render: (_, { actions }) => (
        <>
          {actions.expire_date !== null && actions.expired_status === false && (
            <Space style={{ width: '100%' }}>
              <Button
                type="primary"
                onClick={() => accessData(actions.path, actions)}
                block
                disabled={btnLoading}
              >
                Đăng nhập <ArrowRightOutlined />
              </Button>
            </Space>
          )}
          {actions.expire_date !== null && actions.expired_status === true && (
            <Button type="primary" block disabled>
              Đã hết hạn
            </Button>
          )}
        </>
      ),
    },
  ];

  const getOrders = async () => {
    try {
      const data = [];
      setLoading(true);
      let path = `orders?per_page=99&orderby=id&status=completed`;
      path = `${path}&customer=${token.user_id}`;
      const orders = await window.WooCommerce.get(path);
      if (orders && orders.length > 0) {
        let i = 1;
        orders.forEach((order) => {
          order.line_items.forEach((item) => {
            data.push({
              stt: i,
              key: item.id,
              name: {
                url: item.url,
                name: item.name,
                image: item.shop_thumbnail,
              },
              date: {
                expire_date: item.expire_date,
                expired_status: item.expired_status,
              },
              actions: {
                id: item.id,
                user: token,
                expire_date: item.expire_date,
                expire_range: item.expire_range,
                expired_status: item.expired_status,
                path: item.slug,
              },
            });
            i++;
          });
        });
        setDataSource(data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const refresh = () => {
    setBtnLoading(false);
    setDataSource([]);
    getOrders();
  };

  return (
    <>
      <h1>Tools đã mua</h1>
      <div className="btn_actions">
        <Button type="dashed" shape="round" onClick={refresh}>
          <UndoOutlined /> Refresh
        </Button>
      </div>
      <Table
        bordered
        size="small"
        dataSource={!loading && dataSource.length > 0 ? dataSource : []}
        columns={columns}
        loading={loading}
      />
    </>
  );
}

export default Home;
