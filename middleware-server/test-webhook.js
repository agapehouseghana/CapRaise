const crypto = require('crypto');
const axios = require('axios');

// Webhook configuration
const WEBHOOK_URL = 'http://localhost:4000/api/webhooks/donations';
const WEBHOOK_SECRET = 'a409d72fb5d09d78e89b67ba56593124065153170788afda0750b71036883b89';

// Test payload with your specified data
const testPayload = {
  event_type: "donation.completed",
  timestamp: new Date().toISOString(),
  transaction_id: `test_txn_${Date.now()}`,
  donation: {
    amount: 10.00,
    currency: "GHS",
    referral_code: "58644",
    service_code: "1234", // Using service code from the campaigns
    donor: {
      name: "John Doe",
      phone: "+233123456789",
      email: "john.doe@example.com"
    },
    payment: {
      method: "mobile_money",
      provider: "MTN",
      reference: `MM_${Date.now()}`
    }
  }
};

// Generate webhook signature
function generateWebhookSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signingPayload = timestamp + '.' + JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingPayload)
    .digest('hex');
  
  return {
    signature: `sha256=${signature}`,
    timestamp: timestamp
  };
}

// Send test webhook
async function testWebhook() {
  try {
    console.log('🧪 Testing webhook with payload:');
    console.log(JSON.stringify(testPayload, null, 2));
    
    const { signature, timestamp } = generateWebhookSignature(testPayload, WEBHOOK_SECRET);
    
    console.log('\n🔐 Generated signature:', signature);
    console.log('⏰ Timestamp:', timestamp);
    
    const response = await axios.post(WEBHOOK_URL, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Kowri-Signature': signature,
        'X-Kowri-Timestamp': timestamp.toString()
      },
      timeout: 10000
    });
    
    console.log('\n✅ Webhook test successful!');
    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Webhook test failed:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('🌐 Network error:', error.message);
    } else {
      console.error('💥 Error:', error.message);
    }
  }
}

// Run the test
console.log('🚀 Starting webhook test...\n');
testWebhook(); 