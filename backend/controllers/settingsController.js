const Setting = require('../models/Setting');

const DEFAULT_COUPON_CODE = 'MOMIN';
const DEFAULT_COUPON_DISCOUNT_PERCENT = 12;

const normalizeCouponDefaults = async (settings) => {
  const nextCouponCode = String(settings.couponCode || '').trim().toUpperCase() || DEFAULT_COUPON_CODE;
  const parsedCouponDiscountPercent = Number(settings.couponDiscountPercent);
  const nextCouponDiscountPercent = Number.isFinite(parsedCouponDiscountPercent) && parsedCouponDiscountPercent > 0
    ? parsedCouponDiscountPercent
    : DEFAULT_COUPON_DISCOUNT_PERCENT;

  if (
    nextCouponCode !== settings.couponCode ||
    nextCouponDiscountPercent !== settings.couponDiscountPercent
  ) {
    settings.couponCode = nextCouponCode;
    settings.couponDiscountPercent = nextCouponDiscountPercent;
    await settings.save();
  }

  return settings;
};

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
      siteWebsiteUrl: 'www.digicart.com',
      facebookPixelId: '',
      facebookPixelEnabled: false,
      whatsappChatEnabled: true,
      whatsappNumber: '+8801700123456',
      whatsappDefaultMessage: 'Hello, I need help with my order.',
      facebookUrl: '',
      instagramUrl: '',
      couponCode: DEFAULT_COUPON_CODE,
      couponDiscountPercent: DEFAULT_COUPON_DISCOUNT_PERCENT,
      couponActive: true,
    });
  } else {
    settings = await normalizeCouponDefaults(settings);
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
  let existingSettings;
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
    siteWebsiteUrl,
    facebookPixelId,
    facebookPixelEnabled,
    whatsappChatEnabled,
    whatsappNumber,
    whatsappDefaultMessage,
    facebookUrl,
    instagramUrl,
    couponCode,
    couponDiscountPercent,
    couponActive,
  } = req.body;

  try {
    existingSettings = await ensureDefaultSettings();

    const hasInsideDhakaCharge = insideDhakaCharge !== undefined && insideDhakaCharge !== null && String(insideDhakaCharge).trim() !== '';
    const hasOutsideDhakaCharge = outsideDhakaCharge !== undefined && outsideDhakaCharge !== null && String(outsideDhakaCharge).trim() !== '';

    const insideCharge = hasInsideDhakaCharge ? Number(insideDhakaCharge) : Number(existingSettings.insideDhakaCharge);
    const outsideCharge = hasOutsideDhakaCharge ? Number(outsideDhakaCharge) : Number(existingSettings.outsideDhakaCharge);

    if (!Number.isFinite(insideCharge) || insideCharge < 0) {
      return res.status(400).json({ message: 'Inside Dhaka charge must be a valid non-negative number' });
    }

    if (!Number.isFinite(outsideCharge) || outsideCharge < 0) {
      return res.status(400).json({ message: 'Outside Dhaka charge must be a valid non-negative number' });
    }

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
    const resolvedSiteWebsiteUrl =
      typeof siteWebsiteUrl === 'string' && siteWebsiteUrl.trim()
        ? siteWebsiteUrl.trim()
        : existingSettings.siteWebsiteUrl || 'www.digicart.com';
    const resolvedFacebookPixelId =
      typeof facebookPixelId === 'string'
        ? facebookPixelId.trim()
        : String(existingSettings.facebookPixelId || '').trim();
    const resolvedFacebookPixelEnabled = typeof facebookPixelEnabled === 'boolean'
      ? facebookPixelEnabled
      : Boolean(existingSettings.facebookPixelEnabled);
    const resolvedWhatsappChatEnabled = typeof whatsappChatEnabled === 'boolean'
      ? whatsappChatEnabled
      : typeof existingSettings.whatsappChatEnabled === 'boolean'
        ? existingSettings.whatsappChatEnabled
        : true;
    const resolvedWhatsappNumber = typeof whatsappNumber === 'string' && whatsappNumber.trim()
      ? whatsappNumber.trim()
      : String(existingSettings.whatsappNumber || '').trim() || '+8801700123456';
    const resolvedWhatsappDefaultMessage = typeof whatsappDefaultMessage === 'string' && whatsappDefaultMessage.trim()
      ? whatsappDefaultMessage.trim()
      : String(existingSettings.whatsappDefaultMessage || '').trim() || 'Hello, I need help with my order.';
    const resolvedFacebookUrl = typeof facebookUrl === 'string'
      ? facebookUrl.trim()
      : String(existingSettings.facebookUrl || '').trim();
    const resolvedInstagramUrl = typeof instagramUrl === 'string'
      ? instagramUrl.trim()
      : String(existingSettings.instagramUrl || '').trim();
    const resolvedCouponCode =
      typeof couponCode === 'string'
        ? couponCode.trim().toUpperCase()
        : String(existingSettings.couponCode || '').trim().toUpperCase();
    const resolvedCouponDiscountPercent = Number.isFinite(Number(couponDiscountPercent))
      ? Number(couponDiscountPercent)
      : Number(existingSettings.couponDiscountPercent) || 0;
    const resolvedCouponActive = typeof couponActive === 'boolean'
      ? couponActive
      : Boolean(existingSettings.couponActive);

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

    if (resolvedCouponDiscountPercent < 0 || resolvedCouponDiscountPercent > 100) {
      return res.status(400).json({ message: 'Coupon discount percent must be between 0 and 100' });
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
        siteWebsiteUrl: resolvedSiteWebsiteUrl,
        facebookPixelId: resolvedFacebookPixelId,
        facebookPixelEnabled: resolvedFacebookPixelEnabled,
        whatsappChatEnabled: resolvedWhatsappChatEnabled,
        whatsappNumber: resolvedWhatsappNumber,
        whatsappDefaultMessage: resolvedWhatsappDefaultMessage,
        facebookUrl: resolvedFacebookUrl,
        instagramUrl: resolvedInstagramUrl,
        couponCode: resolvedCouponCode,
        couponDiscountPercent: resolvedCouponDiscountPercent,
        couponActive: resolvedCouponActive,
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
  getPaymentSettings: async (req, res) => {
    try {
      const settings = await ensureDefaultSettings();
      return res.json({
        paymentMethods: settings.paymentMethods || {
          bkash: { enabled: true, number: '', note: '' },
          nogod: { enabled: true, number: '', note: '' },
          cod: { enabled: true },
          card: { enabled: false },
        },
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  updatePaymentSettings: async (req, res) => {
    try {
      const { paymentMethods } = req.body;

      if (!paymentMethods || typeof paymentMethods !== 'object') {
        return res.status(400).json({ message: 'Invalid payment methods data' });
      }

      // Validate that at least one payment method is enabled
      const hasEnabledMethod = Object.values(paymentMethods).some(m => m?.enabled);
      if (!hasEnabledMethod) {
        return res.status(400).json({ message: 'At least one payment method must be enabled' });
      }

      const settings = await ensureDefaultSettings();
      settings.paymentMethods = paymentMethods;
      await settings.save();

      return res.json({
        success: true,
        paymentMethods: settings.paymentMethods,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  getCouponStats: async (req, res) => {
    try {
      const Order = require('../models/Order');
      const settings = await ensureDefaultSettings();
      
      const couponCode = String(settings.couponCode || '').trim().toUpperCase();
      const couponUsageCount = await Order.countDocuments({
        'appliedCoupon': couponCode
      });

      return res.json({
        couponCode,
        couponDiscountPercent: settings.couponDiscountPercent,
        couponActive: settings.couponActive,
        couponUsageCount,
        totalOrders: await Order.countDocuments({})
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};