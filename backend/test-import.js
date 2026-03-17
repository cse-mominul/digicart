try {
  const Campaign = require('./models/Campaign');
  console.log('Campaign model loaded:', typeof Campaign);
  
  const campaignController = require('./controllers/campaignController');
  console.log('Campaign controller loaded:', Object.keys(campaignController));
  
  const campaignRoutes = require('./routes/campaignRoutes');
  console.log('Campaign routes loaded:', typeof campaignRoutes);
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
