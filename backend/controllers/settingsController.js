const Setting = require('../models/Setting');

const ensureDefaultSettings = async () => {
  let settings = await Setting.findOne({});

  if (!settings) {
    settings = await Setting.create({
      insideDhakaCharge: 80,
      outsideDhakaCharge: 120,
      contactAddress: '125 Market Street, Gulshan Avenue, Dhaka 1212',
      contactPhone: '+880 1700-123456',
      supportEmail: 'support@digicart.com',
      salesEmail: 'sales@digicart.com',
      siteTitle: 'DigiCart',
      siteLogoUrl: '',
      faviconUrl: '',
      siteSlogan: 'Rebranded Sellzy',
      footerCopyrightText: '© 2026 DigiCart. All rights reserved.',
      siteDescription: 'DigiCart helps modern shoppers discover top-rated products at honest prices, fast delivery, and smooth checkout experiences.',
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
  const {
    insideDhakaCharge,
    outsideDhakaCharge,
    contactAddress,
    contactPhone,
    supportEmail,
    salesEmail,
    siteTitle,
    siteLogoUrl,
    faviconUrl,
    siteSlogan,
    footerCopyrightText,
    siteDescription,
  } = req.body;

  const insideCharge = Number(insideDhakaCharge);
  const outsideCharge = Number(outsideDhakaCharge);

  if (!Number.isFinite(insideCharge) || insideCharge < 0) {
    return res.status(400).json({ message: 'Inside Dhaka charge must be a valid non-negative number' });
  }

  if (!Number.isFinite(outsideCharge) || outsideCharge < 0) {
    return res.status(400).json({ message: 'Outside Dhaka charge must be a valid non-negative number' });
  }

  try {
    const existingSettings = await ensureDefaultSettings();

    const resolvedContactAddress =
      typeof contactAddress === 'string' && contactAddress.trim()
        ? contactAddress.trim()
        : existingSettings.contactAddress;
    const resolvedContactPhone =
      typeof contactPhone === 'string' && contactPhone.trim()
        ? contactPhone.trim()
        : existingSettings.contactPhone;
    const resolvedSupportEmail =
      typeof supportEmail === 'string' && supportEmail.trim()
        ? supportEmail.trim()
        : existingSettings.supportEmail;
    const resolvedSalesEmail =
      typeof salesEmail === 'string' && salesEmail.trim()
        ? salesEmail.trim()
        : existingSettings.salesEmail;
    const resolvedSiteTitle =
      typeof siteTitle === 'string' && siteTitle.trim()
        ? siteTitle.trim()
        : existingSettings.siteTitle || 'DigiCart';
    const resolvedSiteLogoUrl =
      typeof siteLogoUrl === 'string'
        ? siteLogoUrl.trim()
        : existingSettings.siteLogoUrl || '';
    const resolvedFaviconUrl =
      typeof faviconUrl === 'string'
        ? faviconUrl.trim()
        : existingSettings.faviconUrl || '';
    const resolvedSiteSlogan =
      typeof siteSlogan === 'string' && siteSlogan.trim()
        ? siteSlogan.trim()
        : existingSettings.siteSlogan || 'Rebranded Sellzy';
    const resolvedFooterCopyrightText =
      typeof footerCopyrightText === 'string' && footerCopyrightText.trim()
        ? footerCopyrightText.trim()
        : existingSettings.footerCopyrightText || '© 2026 DigiCart. All rights reserved.';
    const resolvedSiteDescription =
      typeof siteDescription === 'string' && siteDescription.trim()
        ? siteDescription.trim()
        : existingSettings.siteDescription || 'DigiCart helps modern shoppers discover top-rated products at honest prices, fast delivery, and smooth checkout experiences.';

    if (!resolvedContactAddress) {
      return res.status(400).json({ message: 'Contact address is required' });
    }

    if (!resolvedContactPhone) {
      return res.status(400).json({ message: 'Contact phone is required' });
    }

    if (!resolvedSupportEmail) {
      return res.status(400).json({ message: 'Support email is required' });
    }

    if (!resolvedSalesEmail) {
      return res.status(400).json({ message: 'Sales email is required' });
    }

    if (!resolvedSiteTitle) {
      return res.status(400).json({ message: 'Site title is required' });
    }

    const updatedSettings = await Setting.findOneAndUpdate(
      {},
      {
        insideDhakaCharge: insideCharge,
        outsideDhakaCharge: outsideCharge,
        contactAddress: resolvedContactAddress,
        contactPhone: resolvedContactPhone,
        supportEmail: resolvedSupportEmail,
        salesEmail: resolvedSalesEmail,
        siteTitle: resolvedSiteTitle,
        siteLogoUrl: resolvedSiteLogoUrl,
        faviconUrl: resolvedFaviconUrl,
        siteSlogan: resolvedSiteSlogan,
        footerCopyrightText: resolvedFooterCopyrightText,
        siteDescription: resolvedSiteDescription,
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