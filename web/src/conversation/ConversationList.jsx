import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField 
} from '@mui/material';
import PageLayout from '../layout/PageLayout';
import { conversationService } from '../services';

export default function ConversationList() {
  const currentAccount = useCurrentAccount();
  const connected = !!currentAccount;
  const publicKey = currentAccount?.address;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Price Dialog State
  const [openPriceDialog, setOpenPriceDialog] = useState(false);
  const [priceConversationId, setPriceConversationId] = useState(null);
  const [priceValue, setPriceValue] = useState('');
  const [settingPrice, setSettingPrice] = useState(false);

  // Rename Dialog State
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [renameConversationId, setRenameConversationId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Load conversation list
  useEffect(() => {
    load();
  }, [connected, publicKey]);

  const load = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const walletAddress = publicKey;
      const data = await conversationService.getConversationSummaries(walletAddress);
      
      // Transform backend data format to frontend format
      const formattedResumes = data.map(resume => {
        const encryptionMode = resume.encryption_mode || 'subscription';
        const isSubscription = encryptionMode === 'subscription';
        
        return {
          id: resume.id, // Use id instead of resume_id
          title: resume.title || 'Untitled Conversation',
          updatedAt: new Date(resume.updated_at * 1000).toLocaleDateString('en-US'), // Convert timestamp
          views: resume.view_count || 0,
          unlocks: resume.unlock_count || 0,
          encryptionMode, // Encryption mode
          price: resume.price || 0, // Price (SUI MIST, 9 decimals)
          priceSUI: isSubscription ? ((resume.price || 0) / 1_000_000_000).toFixed(9) + ' SUI' : null, // Show price only for subscription mode
          earnings: isSubscription ? (((resume.price || 0) * (resume.unlock_count || 0)) / 1_000_000_000).toFixed(9) + ' SUI' : null, // Show earnings only for subscription mode
          status: resume.status || 'active',
          rawData: resume, // Save raw data
        };
      });
      
      setConversations(formattedResumes);
    } catch (err) {
      console.error('Failed to load conversation list:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const walletAddress = publicKey;
      await conversationService.deleteConversation(id, walletAddress);
      
      // Remove from list
      setConversations(conversations.filter(r => r.id !== id));
      alert('Conversation deleted successfully');
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSetPrice = (id) => {
    // Find current conversation and display its current price
    const conversation = conversations.find(r => r.id === id);
    const currentPrice = conversation ? ((conversation.price || 0) / 1_000_000_000).toFixed(9) : '0.000000000';
    
    setPriceConversationId(id);
    setPriceValue(currentPrice);
    setOpenPriceDialog(true);
  };

  const handlePriceSubmit = async () => {
    const priceFloat = parseFloat(priceValue);
    if (isNaN(priceFloat) || priceFloat < 0) {
      alert('Please enter a valid price');
      return;
    }

    setSettingPrice(true);
    try {
      const walletAddress = publicKey;
      await conversationService.setConversationPrice(priceConversationId, walletAddress, priceFloat);
      
      setOpenPriceDialog(false);
      load();
    } catch (err) {
      console.error('Failed to set conversation price:', err);
      alert(`Set price failed: ${err.message}`);
    } finally {
      setSettingPrice(false);
    }
  };

  const handleRename = (id, currentName) => {
    setRenameConversationId(id);
    // If it's the default name, clear it for easier editing
    setRenameValue(currentName === 'Untitled Conversation' ? '' : currentName);
    setOpenRenameDialog(true);
  };

  const handleRenameSubmit = async () => {
    if (!renameValue.trim()) {
      alert('Name cannot be empty');
      return;
    }

    setRenaming(true);
    try {
      const walletAddress = publicKey;
      await conversationService.updateConversationName(renameConversationId, walletAddress, renameValue);
      
      setOpenRenameDialog(false);
      load();
    } catch (err) {
      console.error('Failed to rename conversation:', err);
      alert(`Rename failed: ${err.message}`);
    } finally {
      setRenaming(false);
    }
  };

  // if (!connected || !publicKey) {
  //   return (
  //     <PageLayout>
  //       <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
  //         <div className="text-center">
  //           <div className="text-6xl mb-4">🔒</div>
  //           <h2 className="text-3xl font-bold text-gray-900 mb-4">
  //             Please Connect Wallet
  //           </h2>
  //           <p className="text-xl text-gray-600">
  //             You need to connect your wallet 
  //           </p>
  //         </div>
  //       </div>
  //     </PageLayout>
  //   );
  // }

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading conversation list...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={load}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        

        {/* Stats Cards */}
        

        {/* Conversation List */}
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Conversations Yet</h3>
            <p className="text-gray-600 mb-6">Create your first encrypted conversation and start earning</p>
            <Link to="/conversation/create">
              <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors">
                Create Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{conversation.title}</h3>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        conversation.encryptionMode === 'allowlist'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {conversation.encryptionMode === 'allowlist' ? '📋 Allowlist' : '💰 Subscription'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2"> ID: {conversation.id}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                     
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {conversation.views} views
                      </span>
                      
                      {conversation.encryptionMode === 'subscription' && (
                        <>
                          <span className="flex items-center gap-1 font-semibold text-purple-600">
                            💎 Price: {conversation.priceSUI}
                          </span>
                         
                        </>
                      )}
                      {conversation.encryptionMode === 'allowlist' && (
                        <span className="flex items-center gap-1 font-semibold text-blue-600">
                          🔐 Whitelist Access
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link  to={`/conversation/preview/${conversation.id}`}>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View
                      </button>
                    </Link>
                    
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Dialog */}
      <Dialog 
        open={openPriceDialog} 
        onClose={() => setOpenPriceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Conversation Price</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Price (SUI)"
            type="number"
            fullWidth
            variant="outlined"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            inputProps={{ 
              step: "0.000000001",
              min: "0"
            }}
            sx={{ mt: 1 }}
          />
          <p className="text-sm text-gray-500 mt-2">
            Set the price for others to unlock your conversation. 
            (Precision: 9 decimals, unit: SUI)
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPriceDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handlePriceSubmit} 
            variant="contained" 
            color="primary"
            disabled={settingPrice}
          >
            {settingPrice ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog 
        open={openRenameDialog} 
        onClose={() => setOpenRenameDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Name"
            type="text"
            fullWidth
            variant="outlined"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRenameDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleRenameSubmit} 
            variant="contained" 
            color="primary"
            disabled={renaming}
          >
            {renaming ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}
