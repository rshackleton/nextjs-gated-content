import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

import { AppProps } from 'next/app';
import React from 'react';

export interface MyAppProps extends AppProps {}

const MyApp: React.FC<MyAppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
