const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const router = express.Router();

const db = admin.firestore();

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const adminId = req.user.adminId || req.user.uid;

    // Fetch campaigns
    const campaignsSnapshot = await db.collection('campaigns')
      .where('adminId', '==', adminId)
      .get();

    const campaigns = [];
    campaignsSnapshot.forEach(doc => {
      const data = doc.data();
      campaigns.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
          ? data.createdAt.toDate() 
          : data.createdAt,
        endDate: data.endDate && typeof data.endDate.toDate === 'function' 
          ? data.endDate.toDate() 
          : data.endDate
      });
    });

    // Fetch users
    const usersSnapshot = await db.collection('users')
      .where('adminId', '==', adminId)
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // Fetch donation data from external API
    let donations = [];
    try {
      const externalApiUrl = process.env.EXTERNAL_API_URL || 'https://capraise-backend.onrender.com/api/v1/fetchData';
      const response = await axios.get(externalApiUrl, { timeout: 5000 });
      donations = response.data || [];
    } catch (error) {
      console.warn('Could not fetch donation data:', error.message);
    }

    // Calculate dashboard statistics
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(campaign => {
      const endDate = campaign.endDate;
      if (!endDate) return true;
      
      // Convert string dates to Date objects if needed
      const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
      return endDateObj > new Date();
    }).length;

    const totalFundraisers = users.length;
    
    // Calculate total raised from donations
    const totalRaised = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    const totalDonors = new Set(donations.map(d => d.payerPhoneNumber)).size;

    // Top performing campaigns
    const campaignPerformance = campaigns.map(campaign => {
      const campaignDonations = donations.filter(d => d.serviceCode === campaign.serviceCode);
      const raised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const donorCount = new Set(campaignDonations.map(d => d.payerPhoneNumber)).size;
      
      return {
        id: campaign.id,
        name: campaign.campaignName || campaign.title,
        serviceCode: campaign.serviceCode,
        raised,
        goal: campaign.fundraisingGoal || 0,
        progress: campaign.fundraisingGoal ? (raised / campaign.fundraisingGoal) * 100 : 0,
        donorCount,
        endDate: campaign.endDate
      };
    }).sort((a, b) => b.raised - a.raised).slice(0, 5);

    // Top performing fundraisers
    const fundraiserPerformance = users.map(user => {
      const userDonations = donations.filter(d => d.referalCode === user.referalCode);
      const raised = userDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const donorCount = new Set(userDonations.map(d => d.payerPhoneNumber)).size;
      
      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        referalCode: user.referalCode,
        raised,
        donorCount,
        campaignCount: new Set(userDonations.map(d => d.serviceCode)).size
      };
    }).sort((a, b) => b.raised - a.raised).slice(0, 10);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDonations = donations.filter(donation => {
      // Assuming donations have a timestamp field - adjust as needed
      return donation.createdAt && new Date(donation.createdAt) > thirtyDaysAgo;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    res.json({
      summary: {
        totalCampaigns,
        activeCampaigns,
        totalFundraisers,
        totalRaised,
        totalDonors,
        averageDonation: donations.length > 0 ? totalRaised / donations.length : 0
      },
      topCampaigns: campaignPerformance,
      topFundraisers: fundraiserPerformance,
      recentActivity: recentDonations,
      trends: {
        // Mock trend data - you could calculate actual trends from timestamps
        dailyDonations: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 5000) + 1000,
          count: Math.floor(Math.random() * 20) + 5
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard analytics',
      message: error.message
    });
  }
});

// GET /api/analytics/campaigns - Get campaign analytics
router.get('/campaigns', async (req, res) => {
  try {
    const adminId = req.user.adminId || req.user.uid;
    const { timeRange = '30d' } = req.query;

    // Fetch campaigns
    const campaignsSnapshot = await db.collection('campaigns')
      .where('adminId', '==', adminId)
      .get();

    const campaigns = [];
    campaignsSnapshot.forEach(doc => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });

    // Fetch donation data
    let donations = [];
    try {
      const externalApiUrl = process.env.EXTERNAL_API_URL || 'https://capraise-backend.onrender.com/api/v1/fetchData';
      const response = await axios.get(externalApiUrl, { timeout: 5000 });
      donations = response.data || [];
    } catch (error) {
      console.warn('Could not fetch donation data:', error.message);
    }

    // Calculate detailed campaign analytics
    const campaignAnalytics = campaigns.map(campaign => {
      const campaignDonations = donations.filter(d => d.serviceCode === campaign.serviceCode);
      const totalRaised = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const uniqueDonors = new Set(campaignDonations.map(d => d.payerPhoneNumber)).size;
      const uniqueFundraisers = new Set(campaignDonations.map(d => d.referalCode)).size;
      
      return {
        id: campaign.id,
        name: campaign.campaignName || campaign.title,
        serviceCode: campaign.serviceCode,
        description: campaign.description,
        goal: campaign.fundraisingGoal || 0,
        raised: totalRaised,
        progress: campaign.fundraisingGoal ? (totalRaised / campaign.fundraisingGoal) * 100 : 0,
        donorCount: uniqueDonors,
        fundraiserCount: uniqueFundraisers,
        averageDonation: campaignDonations.length > 0 ? totalRaised / campaignDonations.length : 0,
        endDate: campaign.endDate,
        createdAt: campaign.createdAt,
        status: campaign.endDate && campaign.endDate.toDate() < new Date() ? 'ended' : 'active'
      };
    });

    res.json({
      campaigns: campaignAnalytics.sort((a, b) => b.raised - a.raised),
      summary: {
        totalCampaigns: campaigns.length,
        totalRaised: campaignAnalytics.reduce((sum, c) => sum + c.raised, 0),
        averageProgress: campaignAnalytics.reduce((sum, c) => sum + c.progress, 0) / campaignAnalytics.length || 0,
        completedCampaigns: campaignAnalytics.filter(c => c.progress >= 100).length
      }
    });

  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign analytics',
      message: error.message
    });
  }
});

// GET /api/analytics/fundraisers - Get fundraiser analytics
router.get('/fundraisers', async (req, res) => {
  try {
    const adminId = req.user.adminId || req.user.uid;
    const { page = 1, limit = 20 } = req.query;

    // Fetch users
    const usersSnapshot = await db.collection('users')
      .where('adminId', '==', adminId)
      .get();

    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // Fetch donation data
    let donations = [];
    try {
      const externalApiUrl = process.env.EXTERNAL_API_URL || 'https://capraise-backend.onrender.com/api/v1/fetchData';
      const response = await axios.get(externalApiUrl, { timeout: 5000 });
      donations = response.data || [];
    } catch (error) {
      console.warn('Could not fetch donation data:', error.message);
    }

    // Calculate fundraiser performance
    const fundraiserAnalytics = users.map(user => {
      const userDonations = donations.filter(d => d.referalCode === user.referalCode);
      const totalRaised = userDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const uniqueDonors = new Set(userDonations.map(d => d.payerPhoneNumber)).size;
      const uniqueCampaigns = new Set(userDonations.map(d => d.serviceCode)).size;
      
      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        referalCode: user.referalCode,
        church: user.church,
        totalRaised,
        donorCount: uniqueDonors,
        campaignCount: uniqueCampaigns,
        averageDonation: userDonations.length > 0 ? totalRaised / userDonations.length : 0,
        lastActivity: userDonations.length > 0 ? 
          Math.max(...userDonations.map(d => new Date(d.createdAt || Date.now()).getTime())) : null
      };
    }).sort((a, b) => b.totalRaised - a.totalRaised);

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedFundraisers = fundraiserAnalytics.slice(startIndex, endIndex);

    res.json({
      fundraisers: paginatedFundraisers,
      summary: {
        totalFundraisers: users.length,
        activeFundraisers: fundraiserAnalytics.filter(f => f.totalRaised > 0).length,
        totalRaised: fundraiserAnalytics.reduce((sum, f) => sum + f.totalRaised, 0),
        averagePerFundraiser: fundraiserAnalytics.reduce((sum, f) => sum + f.totalRaised, 0) / users.length || 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: fundraiserAnalytics.length,
        pages: Math.ceil(fundraiserAnalytics.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching fundraiser analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch fundraiser analytics',
      message: error.message
    });
  }
});

module.exports = router; 