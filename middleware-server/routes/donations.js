const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/donations - Get donation data from external API
router.get('/', async (req, res) => {
  try {
    const { serviceCode, referalCode, page = 1, limit = 50 } = req.query;
    
    // This integrates with your existing external API
    const externalApiUrl = process.env.EXTERNAL_API_URL || 'https://capraise-backend.onrender.com/api/v1/fetchData';
    
    const response = await axios.get(externalApiUrl, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Authorization': process.env.EXTERNAL_API_KEY ? `Bearer ${process.env.EXTERNAL_API_KEY}` : undefined,
        'Content-Type': 'application/json'
      }
    });

    let donations = response.data || [];

    // Filter by serviceCode if provided
    if (serviceCode) {
      donations = donations.filter(donation => donation.serviceCode === serviceCode);
    }

    // Filter by referalCode if provided
    if (referalCode) {
      donations = donations.filter(donation => donation.referalCode === referalCode);
    }

    // Calculate pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedDonations = donations.slice(startIndex, endIndex);

    // Calculate summary statistics
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const uniqueDonors = new Set(donations.map(d => d.payerPhoneNumber)).size;

    res.json({
      donations: paginatedDonations,
      summary: {
        totalDonations: donations.length,
        totalAmount,
        uniqueDonors,
        averageDonation: donations.length > 0 ? totalAmount / donations.length : 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: donations.length,
        pages: Math.ceil(donations.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching donations:', error);
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'External API timeout',
        message: 'The donation service is currently unavailable'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch donations',
      message: 'Unable to retrieve donation data'
    });
  }
});

// GET /api/donations/campaign/:serviceCode - Get donations for specific campaign
router.get('/campaign/:serviceCode', async (req, res) => {
  try {
    const { serviceCode } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const externalApiUrl = process.env.EXTERNAL_API_URL || 'https://capraise-backend.onrender.com/api/v1/fetchData';
    
    const response = await axios.get(externalApiUrl, {
      timeout: 10000,
      headers: {
        'Authorization': process.env.EXTERNAL_API_KEY ? `Bearer ${process.env.EXTERNAL_API_KEY}` : undefined,
        'Content-Type': 'application/json'
      }
    });

    let donations = response.data || [];
    donations = donations.filter(donation => donation.serviceCode === serviceCode);

    // Group by referral codes to see fundraiser performance
    const fundraiserStats = {};
    donations.forEach(donation => {
      const referalCode = donation.referalCode;
      if (!fundraiserStats[referalCode]) {
        fundraiserStats[referalCode] = {
          referalCode,
          totalRaised: 0,
          donationCount: 0,
          donations: []
        };
      }
      fundraiserStats[referalCode].totalRaised += donation.amount || 0;
      fundraiserStats[referalCode].donationCount += 1;
      fundraiserStats[referalCode].donations.push(donation);
    });

    // Calculate pagination for donations
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedDonations = donations.slice(startIndex, endIndex);

    res.json({
      serviceCode,
      donations: paginatedDonations,
      fundraiserStats: Object.values(fundraiserStats).sort((a, b) => b.totalRaised - a.totalRaised),
      summary: {
        totalDonations: donations.length,
        totalAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
        uniqueFundraisers: Object.keys(fundraiserStats).length,
        uniqueDonors: new Set(donations.map(d => d.payerPhoneNumber)).size
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: donations.length,
        pages: Math.ceil(donations.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching campaign donations:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign donations',
      message: error.message
    });
  }
});

// GET /api/donations/fundraiser/:referalCode - Get donations for specific fundraiser
router.get('/fundraiser/:referalCode', async (req, res) => {
  try {
    const { referalCode } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const externalApiUrl = process.env.EXTERNAL_API_URL || 'https://capraise-backend.onrender.com/api/v1/fetchData';
    
    const response = await axios.get(externalApiUrl, {
      timeout: 10000,
      headers: {
        'Authorization': process.env.EXTERNAL_API_KEY ? `Bearer ${process.env.EXTERNAL_API_KEY}` : undefined,
        'Content-Type': 'application/json'
      }
    });

    let donations = response.data || [];
    donations = donations.filter(donation => donation.referalCode === referalCode);

    // Group by service codes to see campaign performance
    const campaignStats = {};
    donations.forEach(donation => {
      const serviceCode = donation.serviceCode;
      if (!campaignStats[serviceCode]) {
        campaignStats[serviceCode] = {
          serviceCode,
          totalRaised: 0,
          donationCount: 0,
          donations: []
        };
      }
      campaignStats[serviceCode].totalRaised += donation.amount || 0;
      campaignStats[serviceCode].donationCount += 1;
      campaignStats[serviceCode].donations.push(donation);
    });

    // Calculate pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedDonations = donations.slice(startIndex, endIndex);

    res.json({
      referalCode,
      donations: paginatedDonations,
      campaignStats: Object.values(campaignStats).sort((a, b) => b.totalRaised - a.totalRaised),
      summary: {
        totalDonations: donations.length,
        totalAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
        uniqueCampaigns: Object.keys(campaignStats).length,
        uniqueDonors: new Set(donations.map(d => d.payerPhoneNumber)).size
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: donations.length,
        pages: Math.ceil(donations.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching fundraiser donations:', error);
    res.status(500).json({
      error: 'Failed to fetch fundraiser donations',
      message: error.message
    });
  }
});

module.exports = router; 