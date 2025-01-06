import React from "react";
import AllLaunches from "./container/AllLaunches";
import CreateTeleFun from "./container/CreateTeleFun.tsx"
import BuyPage from "./container/BuyPage.jsx"
import Profile from "./container/Profile.tsx";
import EditProfile from "./container/EditProfile";
import Trending from "./container/Trending.jsx";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params';
import {
  http,
  createConfig,
  WagmiProvider,
} from "wagmi";

import { base, mainnet, polygon, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import './index.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = '4807d388fe495226b7fc14743af2e1d9'

export const config = createConfig({
  chains: [base, sepolia, polygon, mainnet],
  connectors: [injected()], // IN IFRAME MODE HOT available in window.ethereum
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http()
  },
});

const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      <QueryParamProvider>
        <div>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>

              <Toaster
                position="top-right"
                reverseOrder={true}
                toastOptions={{ duration: 5000 }}
              >
                {(t) => (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => toast.dismiss(t.id)}
                  >
                    <ToastBar onClick={() => alert(1)} toast={t} />
                  </div>
                )}
              </Toaster>
              {/* <ExampleEVM /> */}
              <Switch>
                <Route exact path="/">
                  <AllLaunches />
                </Route>
                <Route exact path="/AllLaunches">
                  <AllLaunches />
                </Route>
                <Route exact path="/CreateAgsys">
                  <CreateTeleFun />
                </Route>
                <Route exact path="/Buy">
                  <BuyPage />
                </Route>
                <Route exact path="/Profile">
                <Profile />
              </Route>
              <Route exact path="/EditProfile">
                <EditProfile />
              </Route>
              <Route exact path="/Trending">
                <Trending />
              </Route>
                {/* <Route exact path="/AllLaunches">
                <AllLaunches />
              </Route>
              <Route exact path="/CreateTeleFun">
                <CreateTeleFun />
              </Route>
              <Route exact path="/Buy">
                <BuyPage />
              </Route>
              <Route exact path="/Profile">
                <Profile />
              </Route>
              <Route exact path="/Trending">
                <Trending />
              </Route>
              <Route exact path="/EditProfile">
                <EditProfile />
              </Route>
              <Route exact path="/NotFound">
                <NotFound />
              </Route> */}
              </Switch>
            </QueryClientProvider>
          </WagmiProvider>
          {/* <Web3Modal
            projectId={projectId}
            ethereumClient={ethereumClient}
          /> */}
        </div>
      </QueryParamProvider>
    </Router>
  );
};

export default App;
