import React from 'react';

import ReactDOM from 'react-dom/client';
import { RecoilRoot } from "recoil";
import MyRoot from './MyRoot';
import {QueryClient, QueryClientProvider} from "react-query";
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import './i18n';

const REACT_APP_MODE = "development";

const client = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
if (REACT_APP_MODE === "development") { // "product"가 아닌 "develop"로 수정
  root.render(
    <React.StrictMode>
      <RecoilRoot>    
        <QueryClientProvider client={client}>
          <MyRoot />
        </QueryClientProvider>
      </RecoilRoot>
    </React.StrictMode>
  );
} 
// if (REACT_APP_MODE === "production") {
//   root.render(
//     <RecoilRoot>    
//       <QueryClientProvider client={client}>
//         <MyRoot />
//       </QueryClientProvider>
//     </RecoilRoot>
//   );
// }





