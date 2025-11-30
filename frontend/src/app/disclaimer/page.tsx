'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';

export default function DisclaimerPage() {
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
              <AlertTriangle className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Disclaimer</h1>
            </div>
            
            <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
              <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">General Information</h2>
                <p>
                  The information provided by NumerAI ({'"we,"'} {'"us,"'} or {'"our"'}) on our website and service is for general
                  informational and entertainment purposes only. All information on the service is provided in good faith,
                  however we make no representation or warranty of any kind, express or implied, regarding the accuracy,
                  adequacy, validity, reliability, availability, or completeness of any information on the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Not Professional Advice</h2>
                <p>
                  The numerology readings, interpretations, and guidance provided by NumerAI are for entertainment and
                  personal reflection purposes only. They should not be considered as:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Professional psychological, psychiatric, or therapeutic advice</li>
                  <li>Financial, legal, or investment advice</li>
                  <li>Medical or health advice</li>
                  <li>Substitute for professional consultation in any field</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">No Guarantees</h2>
                <p>
                  We do not guarantee, represent, or warrant that your use of our service will be uninterrupted,
                  timely, secure, or error-free. We do not warrant that the results that may be obtained from the use
                  of the service will be accurate or reliable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Personal Responsibility</h2>
                <p>
                  You acknowledge that you are using the service at your own risk. Any decisions you make based on
                  information provided by NumerAI are your sole responsibility. We are not liable for any consequences
                  resulting from your use of or reliance on the information provided.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">External Links</h2>
                <p>
                  Our service may contain links to external websites that are not provided or maintained by or in any
                  way affiliated with NumerAI. We do not guarantee the accuracy, relevance, timeliness, or completeness
                  of any information on these external websites.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Errors and Omissions</h2>
                <p>
                  While we strive to ensure the accuracy of information provided, there may be technical inaccuracies
                  or typographical errors in the content. We reserve the right to make corrections at any time without
                  prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
                <p>
                  Under no circumstance shall NumerAI, its owners, employees, partners, or affiliates be held liable
                  for any loss or damage, including without limitation, indirect or consequential loss or damage, or
                  any loss or damage whatsoever arising from loss of data or profits, arising out of, or in connection
                  with, the use of this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Changes to Disclaimer</h2>
                <p>
                  We reserve the right to make additions, deletions, or modifications to the contents of this disclaimer
                  at any time without prior notice. It is your responsibility to review this disclaimer periodically
                  for changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
                <p>
                  If you have any questions about this Disclaimer, please contact us through our support channels.
                </p>
              </section>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

