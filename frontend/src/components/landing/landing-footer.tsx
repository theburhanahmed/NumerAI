'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  TwitterIcon,
  FacebookIcon,
  InstagramIcon,
} from 'lucide-react'

export function LandingFooter() {
  const router = useRouter()

  const scrollToSection = (id: string) => {
    router.push('/')
    setTimeout(() => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }, 100)
  }

  const footerLinks = {
    product: [
      {
        label: 'Features',
        onClick: () => scrollToSection('features'),
      },
      {
        label: 'Pricing',
        onClick: () => router.push('/subscription'),
      },
      {
        label: 'About Us',
        onClick: () => router.push('/about'),
      },
      {
        label: 'Blog',
        onClick: () => router.push('/blog'),
      },
    ],
    company: [
      {
        label: 'About',
        onClick: () => router.push('/about'),
      },
      {
        label: 'Careers',
        onClick: () => router.push('/careers'),
      },
      {
        label: 'Contact',
        onClick: () => router.push('/contact'),
      },
    ],
    legal: [
      {
        label: 'Terms of Service',
        onClick: () => router.push('/terms-of-service'),
      },
      {
        label: 'Privacy Policy',
        onClick: () => router.push('/privacy-policy'),
      },
      {
        label: 'Cookie Policy',
        onClick: () => router.push('/cookie-policy'),
      },
      {
        label: 'Disclaimer',
        onClick: () => router.push('/disclaimer'),
      },
    ],
  }

  return (
    <footer className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold font-['Playfair_Display'] text-white">
                NumerAI
              </span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Discover your personalized numerology insights with AI-powered
              cosmic wisdom
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-lg">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-white/70 hover:text-cyan-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-lg">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-white/70 hover:text-cyan-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-lg">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-white/70 hover:text-cyan-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cyan-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm text-center sm:text-left">
            © 2024 NumerAI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <motion.a
              href="#"
              className="text-white/60 hover:text-cyan-400 transition-colors"
              whileHover={{
                scale: 1.1,
                y: -2,
              }}
            >
              <TwitterIcon className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#"
              className="text-white/60 hover:text-cyan-400 transition-colors"
              whileHover={{
                scale: 1.1,
                y: -2,
              }}
            >
              <FacebookIcon className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#"
              className="text-white/60 hover:text-cyan-400 transition-colors"
              whileHover={{
                scale: 1.1,
                y: -2,
              }}
            >
              <InstagramIcon className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  )
}
