import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { Shield, Users, BookOpen, Globe, MapPin, Archive, Award, Heart } from 'lucide-react';

const About = () => {
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
              About HeritageGuard
            </motion.h1>
            <motion.p
              className="text-xl text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Preserving Rwanda's cultural legacy through technology and community collaboration
            </motion.p>
          </div>
        </motion.section>

        {/* Main Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mission Section */}
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-8"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Shield className="h-10 w-10 text-blue-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                To preserve, document, and share Rwanda's rich cultural heritage through innovative digital platforms
                that engage communities and educate future generations. We believe that cultural heritage is not just
                about the past, but about building a stronger, more connected future.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-20"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Shield,
                  title: 'Heritage Preservation',
                  description: 'Documenting and protecting Rwanda\'s cultural sites and artifacts for future generations through advanced digital technologies.'
                },
                {
                  icon: Users,
                  title: 'Community Engagement',
                  description: 'Connecting communities with their heritage through collaborative preservation efforts and participatory documentation.'
                },
                {
                  icon: BookOpen,
                  title: 'Educational Resources',
                  description: 'Providing comprehensive learning materials and cultural insights to promote heritage awareness and understanding.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center bg-white dark:bg-gray-900 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Values Section */}
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">Our Values</h2>
              <motion.div
                className="grid md:grid-cols-2 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    icon: Heart,
                    title: 'Cultural Respect',
                    description: 'We honor and respect the diverse cultural traditions and practices of Rwanda\'s communities, ensuring authentic representation.'
                  },
                  {
                    icon: Globe,
                    title: 'Innovation',
                    description: 'We leverage modern technology to preserve and share cultural heritage in accessible and engaging ways.'
                  },
                  {
                    icon: Users,
                    title: 'Collaboration',
                    description: 'We work together with communities, experts, and institutions to achieve our preservation goals effectively.'
                  },
                  {
                    icon: Award,
                    title: 'Sustainability',
                    description: 'We ensure that our preservation efforts are sustainable and benefit future generations for years to come.'
                  }
                ].map((value, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start"
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4 flex-shrink-0">
                      <value.icon className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{value.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Team Section */}
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Team</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                HeritageGuard is powered by a diverse team of cultural experts, technologists, and community advocates
                who are passionate about preserving Rwanda's heritage for future generations.
              </p>
              <motion.div
                className="grid md:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { role: 'Cultural Experts', count: '15+' },
                  { role: 'Technology Specialists', count: '12+' },
                  { role: 'Community Partners', count: '50+' }
                ].map((team, index) => (
                  <motion.div
                    key={index}
                    className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md"
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{team.count}</div>
                    <div className="text-gray-600 dark:text-gray-400">{team.role}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="text-center bg-blue-600 rounded-lg p-8 text-white dark:bg-blue-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
              <p className="text-blue-100 dark:text-blue-200 mb-6 max-w-2xl mx-auto">
                Be part of the movement to preserve and celebrate Rwanda's cultural legacy.
                Together, we can ensure that future generations understand and appreciate our rich heritage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors dark:bg-gray-100 dark:text-blue-900 dark:hover:bg-gray-200">
                    Join Our Community
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors dark:border-gray-200">
                    Get in Touch
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;