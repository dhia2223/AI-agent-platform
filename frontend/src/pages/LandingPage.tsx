// frontend/src/pages/LandingPage.tsx
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { 
  DocumentIcon,
  CircleStackIcon,
  CodeBracketIcon,
  UsersIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
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

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex items-center justify-between p-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center space-x-2">
          <Logo className="h-8 w-auto" />
          <span className="text-xl font-semibold text-gray-900">AI Agent Platform</span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link to="/docs" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Documentation
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Button to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            Get started
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <motion.main 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
            >
              <motion.div variants={slideUp} className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <motion.span 
                    className="block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Build AI Agents for
                  </motion.span>
                  <motion.span 
                    className="block text-indigo-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    Your Documents & Databases
                  </motion.span>
                </h1>
                <motion.p 
                  variants={slideUp}
                  className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                >
                  Create custom AI chatbots trained on your knowledge base. Connect documents and databases to build powerful assistants for your team and customers.
                </motion.p>
                <motion.div 
                  variants={slideUp}
                  className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                >
                  <div className="rounded-md shadow">
                    <Button
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all"
                    >
                      Get started for free
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button
                      to="/demo"
                      variant="outline"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all"
                    >
                      Live demo
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.main>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"
        >
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="AI Assistant Illustration"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-12 bg-gray-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={slideUp} className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to build AI agents
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Powerful features designed to help you create, customize and deploy AI assistants.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <motion.div 
                  key={feature.name}
                  variants={slideUp}
                  whileHover={{ y: -5 }}
                  className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-indigo-700"
      >
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to build your AI agent?</span>
            <span className="block">Start today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Create your first AI assistant in minutes. No credit card required.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8"
          >
            <Button
              to="/register"
              className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto transition-transform"
            >
              Sign up for free
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-white"
      >
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            {footerLinks.map((link) => (
              <motion.div 
                key={link.name}
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2"
              >
                <Link to={link.href} className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} AI Agent Platform. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

const features = [
  {
    name: 'Document-based Agents',
    description: 'Upload PDFs, Word docs, and text files to create AI agents that answer questions based on your content.',
    icon: DocumentIcon,
  },
  {
    name: 'Database Integration',
    description: 'Connect PostgreSQL databases to enhance your agents with real-time data from your systems.',
    icon: CircleStackIcon,
  },
  {
    name: 'Custom Instructions',
    description: 'Define exactly how your agent should behave with custom prompts and response guidelines.',
    icon: CodeBracketIcon,
  },
  {
    name: 'Multi-Agent Management',
    description: 'Create and manage multiple agents for different purposes or departments.',
    icon: UsersIcon,
  },
  {
    name: 'Analytics Dashboard',
    description: 'Track queries, popular questions, and document usage with detailed analytics.',
    icon: ChartBarIcon,
  },
  {
    name: 'Embeddable Chat Widget',
    description: 'Easily embed your AI agent into any website with a simple script or iframe.',
    icon: ChatBubbleBottomCenterTextIcon,
  },
];

const footerLinks = [
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Press', href: '/press' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
];