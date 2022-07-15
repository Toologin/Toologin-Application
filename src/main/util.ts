/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
// import path from 'path';

export let resolveHtmlPath: (htmlFileName: string) => string;

const port = process.env.PORT || 1212;
const host =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${port}`
    : 'https://gentle-kangaroo-6e80df.netlify.app';

// eslint-disable-next-line prefer-const
resolveHtmlPath = (htmlFileName: string) => {
  const url = new URL(host);
  url.pathname = htmlFileName;
  return url.href;
};
