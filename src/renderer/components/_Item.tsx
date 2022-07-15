/* eslint-disable no-console */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import { ipcRenderer } from '../helpers/api';

const ProductItem = (props) => {
  async function getData() {
    try {
      const response = await fetch(
        `${process.env.SERVER_URL}/${props.item.directory}/${props.item.path}`
      );
      const data = await response.json();
      ipcRenderer(`${props.item.path}`, data);
    } catch (error) {
      console.log('error', error);
    }
  }

  return (
    <>
      <button type="button" className="App-link" onClick={getData}>
        {props.item.name}
      </button>
    </>
  );
};

export default ProductItem;
