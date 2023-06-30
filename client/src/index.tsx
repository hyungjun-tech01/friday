import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from "recoil";
import Root from './Root';
import {QueryClient, QueryClientProvider} from "react-query";
import 'semantic-ui-css/semantic.min.css';
import './index.css';

const client = new QueryClient();


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RecoilRoot>    
      <QueryClientProvider client = {client}>
        <Root />
      </QueryClientProvider>
    </RecoilRoot>
  </React.StrictMode>
);

