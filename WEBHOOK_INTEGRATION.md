# CapRaise Webhook Integration Guide

## Overview

This document provides comprehensive integration instructions for Kowri payment provider to send donation webhooks to the CapRaise platform. The webhook system enables real-time donation processing, fundraiser statistics updates, and donor tracking.

## 🔗 Webhook Endpoint

```
POST https://your-domain.com/api/webhooks/donations
```

**Environment URLs:**
- Development: `http://localhost:4000/api/webhooks/donations`
- Production: `https://your-production-domain.com/api/webhooks/donations`

## 🔐 Authentication

### HMAC-SHA256 Signature Verification

All webhook requests must include HMAC-SHA256 signature verification for security.

#### Required Headers

```http
Content-Type: application/json
X-Kowri-Signature: sha256=<hmac_signature>
X-Kowri-Timestamp: <unix_timestamp>
```

#### Signature Generation Process

1. **Create the signing payload:**
   ```
   signing_payload = timestamp + '.' + JSON.stringify(request_body)
   ```

2. **Generate HMAC signature:**
   ```javascript
   const crypto = require('crypto');
   const signature = crypto
     .createHmac('sha256', webhook_secret)
     .update(signing_payload)
     .digest('hex');
   ```

3. **Include in header:**
   ```
   X-Kowri-Signature: sha256=${signature}
   ```

#### Example Implementation (Node.js)

```javascript
const crypto = require('crypto');

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

// Usage
const payload = { /* your webhook payload */ };
const { signature, timestamp } = generateWebhookSignature(payload, 'your-webhook-secret');

// Include in headers
headers['X-Kowri-Signature'] = signature;
headers['X-Kowri-Timestamp'] = timestamp;
```

## 📋 Payload Schema

### Required Payload Structure

```json
{
  "event_type": "donation.completed",
  "timestamp": "2025-01-23T20:45:00Z",
  "transaction_id": "txn_unique_12345",
  "donation": {
    "amount": 100.00,
    "currency": "GHS",
    "referral_code": "REF123456",
    "service_code": "CAMP789",
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
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_type` | string | ✅ | Event type (currently: "donation.completed") |
| `timestamp` | string | ✅ | ISO 8601 timestamp of the event |
| `transaction_id` | string | ✅ | Unique transaction identifier |
| `donation.amount` | number | ✅ | Donation amount (decimal) |
| `donation.currency` | string | ❌ | Currency code (defaults to "GHS") |
| `donation.referral_code` | string | ✅ | Fundraiser's referral code |
| `donation.service_code` | string | ✅ | Campaign's service code |
| `donation.donor.name` | string | ✅ | Donor's full name |
| `donation.donor.phone` | string | ✅ | Donor's phone number |
| `donation.donor.email` | string | ❌ | Donor's email address |
| `donation.payment.method` | string | ❌ | Payment method (defaults to "mobile_money") |
| `donation.payment.provider` | string | ❌ | Payment provider (e.g., "MTN", "Vodafone") |
| `donation.payment.reference` | string | ❌ | Payment reference number |

### Validation Rules

- `transaction_id` must be unique across all transactions
- `amount` must be a positive number
- `referral_code` must exist in the CapRaise system
- `service_code` must exist in the CapRaise system
- `phone` should include country code (e.g., +233...)
- `timestamp` should be within 5 minutes of request time

## 📡 Response Codes

### Success Responses

| Code | Description | Response Body |
|------|-------------|---------------|
| 200 | Donation processed successfully | `{"success": true, "message": "Donation processed successfully", "transaction_id": "txn_12345", "donation_id": "doc_id"}` |
| 200 | Duplicate transaction (idempotent) | `{"success": true, "message": "Transaction already processed", "transaction_id": "txn_12345"}` |

### Error Responses

| Code | Description | Common Causes |
|------|-------------|---------------|
| 400 | Bad Request | Missing required fields, invalid payload structure |
| 401 | Unauthorized | Invalid signature, missing headers, expired timestamp |
| 404 | Not Found | Invalid referral_code or service_code |
| 500 | Internal Server Error | Database issues, processing errors |

### Example Error Response

```json
{
  "error": "Invalid referral code",
  "message": "Fundraiser not found"
}
```

## 🔄 Retry Policy

### When to Retry

- **Retry on:** 5xx errors, network timeouts, connection errors
- **Do NOT retry on:** 4xx errors (client errors)

### Recommended Retry Strategy

```javascript
const retryConfig = {
  maxAttempts: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2
};

async function sendWebhookWithRetry(payload, attempt = 1) {
  try {
    const response = await sendWebhook(payload);
    return response;
  } catch (error) {
    if (attempt >= retryConfig.maxAttempts) {
      throw error;
    }
    
    // Don't retry client errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      throw error;
    }
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
      retryConfig.maxDelay
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return sendWebhookWithRetry(payload, attempt + 1);
  }
}
```

## 🧪 Testing

### Test Webhook Endpoint

```
GET https://your-domain.com/api/webhooks/test
```

This endpoint returns basic status information without requiring authentication.

### Sample Test Payload

```json
{
  "event_type": "donation.completed",
  "timestamp": "2025-01-23T20:45:00Z",
  "transaction_id": "test_txn_12345",
  "donation": {
    "amount": 50.00,
    "currency": "GHS",
    "referral_code": "TEST123",
    "service_code": "TESTCAMP",
    "donor": {
      "name": "Test Donor",
      "phone": "+233123456789",
      "email": "test@example.com"
    },
    "payment": {
      "method": "mobile_money",
      "provider": "MTN",
      "reference": "TEST_MM_123"
    }
  }
}
```

### Testing with cURL

```bash
# Generate signature (you'll need to implement this)
TIMESTAMP=$(date +%s)
PAYLOAD='{"event_type":"donation.completed",...}'
SIGNATURE=$(echo -n "${TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "your-webhook-secret" | cut -d' ' -f2)

# Send webhook
curl -X POST https://your-domain.com/api/webhooks/donations \
  -H "Content-Type: application/json" \
  -H "X-Kowri-Signature: sha256=${SIGNATURE}" \
  -H "X-Kowri-Timestamp: ${TIMESTAMP}" \
  -d "${PAYLOAD}"
```

## 🔍 Monitoring & Debugging

### Webhook Logs

Administrators can view webhook processing logs at:
```
GET /api/webhooks/logs
```

### Log Information Includes:
- Processing status (success/error)
- Transaction details
- Error messages
- Processing timestamps
- Payload metadata

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid signature | Verify signature generation algorithm |
| 401 Unauthorized | Timestamp too old | Ensure timestamp is current (within 5 minutes) |
| 400 Bad Request | Missing fields | Validate payload against required schema |
| 404 Not Found | Invalid codes | Verify referral_code and service_code exist |

## 🚀 Production Deployment

### Environment Variables

Ensure the following environment variable is set:

```bash
KOWRI_WEBHOOK_SECRET=your-64-character-hex-secret
```

### Security Considerations

1. **HTTPS Only:** Always use HTTPS in production
2. **Secret Management:** Store webhook secret securely
3. **IP Whitelisting:** Consider whitelisting Kowri's IP addresses
4. **Rate Limiting:** Built-in rate limiting protects against abuse
5. **Monitoring:** Set up alerts for webhook failures

### Webhook Secret Management

- Secrets can be generated via the admin panel
- Rotate secrets periodically for security
- Coordinate secret updates with Kowri team
- Test new secrets before going live

## 📞 Support & Contact

For technical issues or questions regarding webhook integration:

- **Documentation:** This file and admin panel documentation tab
- **Logs:** Check webhook logs in admin panel for debugging
- **Testing:** Use the test endpoint for connectivity verification

## 📋 Integration Checklist

- [ ] Webhook endpoint configured with correct URL
- [ ] HMAC-SHA256 signature implementation verified
- [ ] Payload structure matches required schema
- [ ] Error handling and retry logic implemented
- [ ] Test transactions successful
- [ ] Production webhook secret configured
- [ ] Monitoring and alerting set up
- [ ] Documentation reviewed with development team

---

**Last Updated:** January 2025  
**Version:** 1.0  
**API Version:** v1 