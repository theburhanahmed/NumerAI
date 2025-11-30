'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            </div>
            
            <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
              <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                <p>
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal information such as name, email address, and birth date</li>
                  <li>Account information and preferences</li>
                  <li>Payment information for subscription services</li>
                  <li>Usage data and interactions with our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends and usage</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information
                  only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With service providers who assist us in operating our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information.
                  However, no method of transmission over the internet or electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Request data portability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information.
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Third-Party Services</h2>
                <p>
                  Our service may contain links to third-party websites or services. We are not responsible for
                  the privacy practices of these third parties. We encourage you to read their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
                <p>
                  Our service is not intended for children under the age of 13. We do not knowingly collect
                  personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                  the new Privacy Policy on this page and updating the {'"Last updated"'} date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through our support channels.
                </p>
              </section>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

