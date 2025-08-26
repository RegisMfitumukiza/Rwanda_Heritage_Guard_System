import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace with actual API call
      // await axios.post('/api/contact', formData);

      setSubmitted(true);
      setFormData({ fullName: '', email: '', subject: '', message: '' });
      toast.success('Message sent successfully! We\'ll get back to you soon.');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'info@heritageguard.rw',
      description: 'Send us an email anytime'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+250 788 123 456',
      description: 'Mon-Fri from 8am to 6pm'
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Kigali, Rwanda',
      description: 'Visit our main office'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: '8:00 AM - 6:00 PM',
      description: 'Monday to Friday'
    }
  ];

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="pt-20 pb-16">
            <motion.div
              className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <CheckCircle className="h-10 w-10 text-blue-600" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
              <p className="text-lg text-gray-600 mb-8">
                Your message has been sent successfully. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Send Another Message
              </button>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <motion.section
          className="bg-blue-600 text-white py-20 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              className="text-xl text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Have questions about our heritage preservation efforts? We'd love to hear from you.
            </motion.p>
          </div>
        </motion.section>

        {/* Main Content */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:bg-blue-500 dark:hover:bg-blue-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </div>
                    )}
                  </motion.button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Contact Information</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We're here to help and answer any questions you might have. We look forward to hearing from you.
                  </p>
                </div>

                <motion.div
                  className="space-y-6"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start"
                      variants={fadeInUp}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4 flex-shrink-0">
                        <info.icon className="text-blue-600 dark:text-blue-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{info.title}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">{info.value}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{info.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Additional Info */}
                <motion.div
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Response Time</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>• General inquiries: Within 24 hours</p>
                    <p>• Technical support: Within 4 hours</p>
                    <p>• Partnership requests: Within 48 hours</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Contact;