'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MailIcon, MessageSquareIcon, MapPinIcon, PhoneIcon, SendIcon } from 'lucide-react';
import { AccessibleSpaceBackground } from '@/components/space/accessible-space-background';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { toast } from 'sonner';
export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    toast.success('Message sent successfully!', {
      description: "We'll get back to you within 24 hours",
    });
  };

  const contactInfo = [
    {
      icon: <MailIcon className="w-6 h-6" />,
      title: 'Email Us',
      content: 'support@numerai.com',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      icon: <MessageSquareIcon className="w-6 h-6" />,
      title: 'Live Chat',
      content: 'Available 24/7',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: <MapPinIcon className="w-6 h-6" />,
      title: 'Location',
      content: 'San Francisco, CA',
      color: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <AccessibleSpaceBackground />
      <LandingNav />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pt-28">
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1 + index * 0.1,
              }}
              whileHover={{
                y: -4,
              }}
            >
              <SpaceCard variant="default" className="p-6 text-center h-full">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}
                >
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {info.title}
                </h3>
                <p className="text-white/70">{info.content}</p>
              </SpaceCard>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
          }}
          className="max-w-3xl mx-auto"
        >
          <SpaceCard variant="premium" className="p-8 md:p-10">
            <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-6">
              Send us a Message
            </h2>

            {submitted ? (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <SendIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Message Sent!
                </h3>
                <p className="text-white/70 mb-6">
                  Thank you for reaching out. We'll get back to you within 24
                  hours.
                </p>
                <TouchOptimizedButton
                  variant="secondary"
                  onClick={() => setSubmitted(false)}
                  ariaLabel="Send another message"
                >
                  Send Another Message
                </TouchOptimizedButton>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subject: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message: e.target.value,
                      })
                    }
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <TouchOptimizedButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  icon={<SendIcon className="w-5 h-5" />}
                  ariaLabel="Send message"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </TouchOptimizedButton>
              </form>
            )}
          </SpaceCard>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}