'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';

export default function TermsOfServicePage() {
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
              <FileText className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            </div>
            
            <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
              <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
              
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using NumerAI, you accept and agree to be bound by the terms and provision of this agreement.
                  If you do not agree to these Terms of Service, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
                <p>
                  Permission is granted to temporarily access NumerAI for personal, non-commercial transitory viewing only.
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on NumerAI</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
                <p>
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times.
                  You are responsible for safeguarding the password and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Numerology Readings</h2>
                <p>
                  NumerAI provides numerology readings and interpretations based on the information you provide.
                  These readings are for entertainment and personal guidance purposes only and should not be used as a substitute
                  for professional advice in legal, financial, medical, or other matters.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Payment Terms</h2>
                <p>
                  Some features of NumerAI may require payment. By making a purchase, you agree to pay all charges
                  at the prices then in effect for your purchases. All payments are non-refundable unless otherwise stated.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
                <p>
                  The service and its original content, features, and functionality are and will remain the exclusive property
                  of NumerAI and its licensors. The service is protected by copyright, trademark, and other laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Disclaimer</h2>
                <p>
                  The information on this service is provided on an {'"as is"'} basis. To the fullest extent permitted by law,
                  NumerAI excludes all representations, warranties, conditions, and terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
                <p>
                  In no event shall NumerAI, nor its directors, employees, partners, agents, suppliers, or affiliates,
                  be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use
                  of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                  If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us through our support channels.
                </p>
              </section>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

