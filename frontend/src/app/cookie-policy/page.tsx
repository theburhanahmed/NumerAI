'use client';

import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <Cookie className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Cookie Policy</h1>
            </div>
            
            <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
              <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. What Are Cookies</h2>
                <p>
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                  They are widely used to make websites work more efficiently and provide information to website owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Cookies</h2>
                <p>NumerAI uses cookies for several purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To enable certain functions of the service</li>
                  <li>To provide analytics and track usage patterns</li>
                  <li>To store your preferences and settings</li>
                  <li>To improve security and prevent fraud</li>
                  <li>To personalize your experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Types of Cookies We Use</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Essential Cookies</h3>
                    <p>
                      These cookies are necessary for the website to function properly. They enable core functionality
                      such as security, network management, and accessibility.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Analytics Cookies</h3>
                    <p>
                      These cookies help us understand how visitors interact with our website by collecting and reporting
                      information anonymously. This helps us improve the way our website works.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Functionality Cookies</h3>
                    <p>
                      These cookies allow the website to remember choices you make (such as your username, language,
                      or region) and provide enhanced, personalized features.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Marketing Cookies</h3>
                    <p>
                      These cookies may be set through our site by our advertising partners to build a profile of your
                      interests and show you relevant content on other sites.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Cookies</h2>
                <p>
                  In addition to our own cookies, we may also use various third-party cookies to report usage statistics
                  of the service, deliver advertisements, and so on. These third-party cookies are governed by the respective
                  privacy policies of those third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Managing Cookies</h2>
                <p>
                  You can control and/or delete cookies as you wish. You can delete all cookies that are already on your
                  computer and you can set most browsers to prevent them from being placed.
                </p>
                <p className="mt-2">
                  However, if you do this, you may have to manually adjust some preferences every time you visit a site
                  and some services and functionalities may not work.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Browser Settings</h2>
                <p>Most web browsers allow some control of most cookies through the browser settings. To find out more:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Chrome: Settings → Privacy and security → Cookies</li>
                  <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
                  <li>Safari: Preferences → Privacy → Cookies</li>
                  <li>Edge: Settings → Privacy, search, and services → Cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to Cookie Policy</h2>
                <p>
                  We may update our Cookie Policy from time to time. We will notify you of any changes by posting
                  the new Cookie Policy on this page and updating the {'"Last updated"'} date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Us</h2>
                <p>
                  If you have any questions about our use of cookies, please contact us through our support channels.
                </p>
              </section>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

