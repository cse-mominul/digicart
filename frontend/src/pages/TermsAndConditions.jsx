import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-sm rounded-2xl p-8 sm:p-12 border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 border-b pb-4 border-gray-100 dark:border-gray-800 text-center sm:text-left">
          Terms & Conditions
        </h1>
        
        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to E-KINUN. By accessing our website, you agree to these terms and conditions. Please read them carefully before using our services. Our services include our website, mobile application, and any other related services provided by E-KINUN.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Use of the Site</h2>
            <p>
              You must be at least 18 years old to use this site or under the supervision of a parent or legal guardian. We grant you a non-transferable and revocable license to use the site, under the terms and conditions described, for the purpose of shopping for personal items sold on the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. User Account</h2>
            <p>
              To access certain services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Privacy Policy</h2>
            <p>
              Your use of the site is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Orders and Pricing</h2>
            <p>
              All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Pricing errors may occur; in such cases, we will contact you to confirm the order at the correct price or cancel it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Intellectual Property</h2>
            <p>
              All content on this site, including text, graphics, logos, images, and software, is the property of E-KINUN and protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of Bangladesh. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of Bangladesh.
            </p>
          </section>

          <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: April 25, 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
