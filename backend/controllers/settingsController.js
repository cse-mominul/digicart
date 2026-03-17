const Setting = require('../models/Setting');

const ensureDefaultSettings = async () => {
  let settings = await Setting.findOne({});

  if (!settings) {
    settings = await Setting.create({
      insideDhakaCharge: 80,
      outsideDhakaCharge: 120,
    });
  }

  return settings;
};

// @desc  Get app settings
// @route GET /api/settings
const getSettings = async (req, res) => {
  try {
    const settings = await ensureDefaultSettings();
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Update app settings (admin only)
// @route PATCH /api/settings
const updateSettings = async (req, res) => {
  const { insideDhakaCharge, outsideDhakaCharge } = req.body;

  const insideCharge = Number(insideDhakaCharge);
  const outsideCharge = Number(outsideDhakaCharge);

  if (!Number.isFinite(insideCharge) || insideCharge < 0) {
    return res.status(400).json({ message: 'Inside Dhaka charge must be a valid non-negative number' });
  }

  if (!Number.isFinite(outsideCharge) || outsideCharge < 0) {
    return res.status(400).json({ message: 'Outside Dhaka charge must be a valid non-negative number' });
  }

  try {
    await ensureDefaultSettings();

    const updatedSettings = await Setting.findOneAndUpdate(
      {},
      {
        insideDhakaCharge: insideCharge,
        outsideDhakaCharge: outsideCharge,
      },
      {
        new: true,
      }
    );

    return res.json(updatedSettings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};