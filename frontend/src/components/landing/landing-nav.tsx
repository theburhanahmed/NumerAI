'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon, MenuIcon, XIcon } from 'lucide-react'

export function LandingNav() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    {
      label: 'Features',
      href: '#features',
    },
    {
      label: 'Pricing',
      href: '/subscription',
    },
    {
      label: 'About',
      href: '/about',
    },
  ]

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
        })
      }
    } else {
      router.push(href)
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{
          y: -100,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1a2942]/60 backdrop-blur-2xl rounded-3xl border border-cyan-500/20 shadow-xl shadow-cyan-500/10 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 group"
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold font-['Playfair_Display'] text-white hidden sm:inline">
                  NumerAI
                </span>
              </motion.button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <motion.button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className="text-white/80 hover:text-cyan-400 font-medium transition-colors"
                    whileHover={{
                      y: -2,
                    }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                  >
                    Get Started
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20"
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <XIcon className="w-6 h-6 text-white" />
                  ) : (
                    <MenuIcon className="w-6 h-6 text-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
            >
              <div className="bg-[#1a2942]/95 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl overflow-hidden">
                <div className="p-4 space-y-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.href)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-cyan-500/10 rounded-xl transition-colors font-medium"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t border-cyan-500/20 pt-2 space-y-2">
                    <button
                      onClick={() => {
                        router.push('/login')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-cyan-500/10 rounded-xl transition-colors font-medium"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        router.push('/register')
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg text-center"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
