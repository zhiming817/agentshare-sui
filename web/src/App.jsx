import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getFullnodeUrl } from '@mysten/sui/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './conversation/Home.jsx';
import ConversationCreate from './conversation/ConversationCreate.jsx';
import ConversationEdit from './conversation/ConversationEdit.jsx';
import ConversationList from './conversation/ConversationList.jsx';
import ConversationBrowse from './conversation/ConversationBrowse.jsx';
import AllowlistManager from './components/AllowlistManager.jsx';
import ConversationPreviewPage from './conversation/ConversationPreviewPage.jsx';
import PageLayout from './layout/PageLayout.jsx';
import { NETWORK_CONFIG } from './config.js';

const queryClient = new QueryClient();

// 配置网络
const networkConfig = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <HashRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/conversation/create" element={<ConversationCreate />} />
                <Route path="/conversation/edit/:id" element={<ConversationEdit />} />
                
                <Route path="/conversations" element={<ConversationList />} />
                <Route path="/conversations/browse" element={<ConversationBrowse />} />
                {/* <Route path="/conversation/browse" element={<ConversationBrowse />} /> */}
                <Route path="/allowlist" element={<PageLayout><AllowlistManager /></PageLayout>} />
                <Route path="/conversation/preview/:id" element={<ConversationPreviewPage />} />
                <Route path="/templates" element={<div className="p-8 text-center"><h2 className="text-2xl">模板功能开发中...</h2></div>} />
              </Routes>
            </HashRouter>
          </ThemeProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;