import { message } from 'antd';

export default function Message({ type, content }) {
  if (type === 'success') {
    message.success(content);
  }

  if (type === 'error') {
    message.error(content);
  }

  if (type === 'warning') {
    message.warning(content);
  }
}
