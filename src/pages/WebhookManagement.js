import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import apiService from '../services/api';

const WebhookManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [webhookSecret, setWebhookSecret] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [secretVisible, setSecretVisible] = useState(false);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchWebhookSecret();
    fetchWebhookLogs();
  }, []);

  const fetchWebhookSecret = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/webhooks/secret');
      setWebhookSecret(response);
    } catch (error) {
      if (error.message.includes('404')) {
        setWebhookSecret(null);
      } else {
        console.error('Error fetching webhook secret:', error);
        toast.error('Failed to fetch webhook configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookLogs = async (page = 1) => {
    try {
      setLogsLoading(true);
      const response = await apiService.request(`/webhooks/logs?page=${page}&limit=20`);
      setWebhookLogs(response.logs || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
      toast.error('Failed to fetch webhook logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const generateNewSecret = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/webhooks/secret/generate', {
        method: 'POST'
      });
      
      setWebhookSecret({
        exists: true,
        secret: response.secret,
        createdAt: new Date(),
        note: response.note
      });
      
      setGenerateDialog(false);
      toast.success('New webhook secret generated successfully!');
      
    } catch (error) {
      console.error('Error generating webhook secret:', error);
      toast.error('Failed to generate webhook secret');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      success: { color: 'success', icon: <CheckCircleIcon /> },
      error: { color: 'error', icon: <ErrorIcon /> },
      pending: { color: 'warning', icon: <InfoIcon /> }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Chip
        label={status}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      fetchWebhookLogs();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <SecurityIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Webhook Management</h1>
          </div>
          <p className="text-gray-600">
            Manage webhook configurations and monitor payment notifications from Kowri
          </p>
        </div>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Configuration" />
            <Tab label="Webhook Logs" />
            <Tab label="Documentation" />
          </Tabs>
        </Box>

        {/* Configuration Tab */}
        {activeTab === 0 && (
          <div className="space-y-6">
            {/* Webhook Secret Card */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="flex items-center space-x-2">
                    <SecurityIcon className="w-5 h-5" />
                    <span>Webhook Secret</span>
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setGenerateDialog(true)}
                    disabled={loading}
                  >
                    {webhookSecret?.exists ? 'Regenerate Secret' : 'Generate Secret'}
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <CircularProgress />
                  </div>
                ) : webhookSecret?.exists ? (
                  <div className="space-y-4">
                    <Alert severity="info">
                      {webhookSecret.note}
                    </Alert>
                    
                    <div className="flex items-center space-x-2">
                      <TextField
                        fullWidth
                        label="Webhook Secret"
                        value={secretVisible ? webhookSecret.secret : '•'.repeat(64)}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <div className="flex items-center space-x-1">
                              <Tooltip title={secretVisible ? 'Hide' : 'Show'}>
                                <IconButton
                                  onClick={() => setSecretVisible(!secretVisible)}
                                  size="small"
                                >
                                  {secretVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Copy to clipboard">
                                <IconButton
                                  onClick={() => copyToClipboard(webhookSecret.secret)}
                                  size="small"
                                >
                                  <CopyIcon />
                                </IconButton>
                              </Tooltip>
                            </div>
                          )
                        }}
                      />
                    </div>

                    <div className="text-sm text-gray-600">
                      <p><strong>Created:</strong> {formatDate(webhookSecret.createdAt)}</p>
                      <p><strong>Environment Variable:</strong> KOWRI_WEBHOOK_SECRET</p>
                    </div>
                  </div>
                ) : (
                  <Alert severity="warning">
                    No webhook secret configured. Generate one to enable webhook authentication.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Webhook Endpoint Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" className="mb-4">
                  Webhook Endpoint Information
                </Typography>
                
                <div className="space-y-4">
                  <div>
                    <Typography variant="body2" color="textSecondary">
                      Webhook URL
                    </Typography>
                    <div className="flex items-center space-x-2 mt-1">
                      <TextField
                        fullWidth
                        value={`${window.location.origin.replace('3001', '4000')}/api/webhooks/donations`}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <Tooltip title="Copy webhook URL">
                              <IconButton
                                onClick={() => copyToClipboard(`${window.location.origin.replace('3001', '4000')}/api/webhooks/donations`)}
                                size="small"
                              >
                                <CopyIcon />
                              </IconButton>
                            </Tooltip>
                          )
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography variant="body2" color="textSecondary">
                        HTTP Method
                      </Typography>
                      <Typography variant="body1" className="font-mono">
                        POST
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="textSecondary">
                        Content Type
                      </Typography>
                      <Typography variant="body1" className="font-mono">
                        application/json
                      </Typography>
                    </div>
                  </div>

                  <div>
                    <Typography variant="body2" color="textSecondary" className="mb-2">
                      Required Headers
                    </Typography>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      <div>X-Kowri-Signature: sha256=&lt;hmac_signature&gt;</div>
                      <div>X-Kowri-Timestamp: &lt;unix_timestamp&gt;</div>
                      <div>Content-Type: application/json</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Webhook Logs Tab */}
        {activeTab === 1 && (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6">
                  Webhook Processing Logs
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchWebhookLogs(pagination.page)}
                  disabled={logsLoading}
                >
                  Refresh
                </Button>
              </div>

              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <CircularProgress />
                </div>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Fundraiser</TableCell>
                        <TableCell>Campaign</TableCell>
                        <TableCell>Processed At</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {webhookLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {getStatusChip(log.status)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.transactionId || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.amount ? `GHS ${log.amount.toLocaleString()}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.metadata?.referral_code || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.metadata?.service_code || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {formatDate(log.processedAt)}
                          </TableCell>
                          <TableCell>
                            {log.error && (
                              <Tooltip title={log.error}>
                                <Chip
                                  label="Error"
                                  color="error"
                                  size="small"
                                />
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {webhookLogs.length === 0 && !logsLoading && (
                <div className="text-center py-8 text-gray-500">
                  No webhook logs found
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documentation Tab */}
        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Kowri Webhook Integration Guide
              </Typography>
              
              <div className="prose max-w-none">
                <Alert severity="info" className="mb-4">
                  This documentation should be shared with your Kowri integration team.
                </Alert>

                <div className="space-y-6">
                  <div>
                    <Typography variant="h6" className="mb-2">
                      1. Webhook Configuration
                    </Typography>
                    <p>Configure Kowri to send webhook notifications to:</p>
                    <div className="bg-gray-100 p-3 rounded font-mono">
                      {`${window.location.origin.replace('3001', '4000')}/api/webhooks/donations`}
                    </div>
                  </div>

                  <div>
                    <Typography variant="h6" className="mb-2">
                      2. Authentication
                    </Typography>
                    <p>All webhook requests must include HMAC-SHA256 signature verification:</p>
                    <ul className="list-disc ml-6">
                      <li>Generate HMAC using the webhook secret</li>
                      <li>Sign the payload: <code>timestamp + '.' + JSON.stringify(payload)</code></li>
                      <li>Include signature in header: <code>X-Kowri-Signature: sha256=&lt;signature&gt;</code></li>
                      <li>Include timestamp in header: <code>X-Kowri-Timestamp: &lt;unix_timestamp&gt;</code></li>
                    </ul>
                  </div>

                  <div>
                    <Typography variant="h6" className="mb-2">
                      3. Expected Payload Format
                    </Typography>
                    <div className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      <pre>{`{
  "event_type": "donation.completed",
  "timestamp": "2025-01-23T20:45:00Z",
  "transaction_id": "txn_12345",
  "donation": {
    "amount": 100.00,
    "currency": "GHS",
    "referral_code": "REF123",
    "service_code": "CAMP456",
    "donor": {
      "name": "John Doe",
      "phone": "+233123456789",
      "email": "john@example.com"
    },
    "payment": {
      "method": "mobile_money",
      "provider": "MTN",
      "reference": "MM123456789"
    }
  }
}`}</pre>
                    </div>
                  </div>

                  <div>
                    <Typography variant="h6" className="mb-2">
                      4. Response Codes
                    </Typography>
                    <ul className="list-disc ml-6">
                      <li><strong>200:</strong> Webhook processed successfully</li>
                      <li><strong>400:</strong> Invalid payload or missing required fields</li>
                      <li><strong>401:</strong> Authentication failed (invalid signature)</li>
                      <li><strong>500:</strong> Internal processing error</li>
                    </ul>
                  </div>

                  <div>
                    <Typography variant="h6" className="mb-2">
                      5. Retry Policy
                    </Typography>
                    <p>Implement exponential backoff for failed webhooks:</p>
                    <ul className="list-disc ml-6">
                      <li>Retry on 5xx errors and timeouts</li>
                      <li>Do not retry on 4xx errors (client errors)</li>
                      <li>Maximum 5 retry attempts</li>
                      <li>Exponential backoff: 1s, 2s, 4s, 8s, 16s</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Secret Dialog */}
        <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)}>
          <DialogTitle>
            {webhookSecret?.exists ? 'Regenerate Webhook Secret' : 'Generate Webhook Secret'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {webhookSecret?.exists 
                ? 'This will generate a new webhook secret and invalidate the current one. Make sure to update your environment variable and notify Kowri of the new secret.'
                : 'This will generate a new webhook secret for authenticating Kowri webhook requests.'
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
            <Button 
              onClick={generateNewSecret} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Generate'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default WebhookManagement; 