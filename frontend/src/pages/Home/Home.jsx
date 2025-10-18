import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const features = [
  {
    icon: FolderKanban,
    title: 'Project Organization',
    description: 'Keep all your projects organized in one beautiful workspace',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built for speed with modern technologies and optimized performance',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Work together seamlessly with your team in real-time',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor project status and milestones with ease',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto px-6 py-20"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-20">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600 mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Modern Project Management</span>
          </motion.div>

          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Manage Projects
            <br />
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              The Modern Way
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            A beautiful, minimalist project management app built with modern technologies.
            Stay organized, track progress, and collaborate with your team.
          </p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Button
              size="lg"
              onClick={() => navigate('/projects')}
              className="text-base h-12 px-8 gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-100 group cursor-pointer">
                  <CardHeader>
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center mb-4 group-hover:bg-gray-800 transition-colors"
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div variants={itemVariants} className="text-center">
          <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription className="text-base">
                Create your first project and experience modern project management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/projects')}
                  className="gap-2"
                >
                  View Projects
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;