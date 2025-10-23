import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Zap, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '../../components/ui';

const features = [
  {
    icon: FolderKanban,
    title: 'Project Organization',
    description: 'Keep all your projects organized in one beautiful workspace',
    badge: 'Core',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built for speed with modern technologies and optimized performance',
    badge: 'Performance',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Work together seamlessly with your team in real-time',
    badge: 'Team',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor project status and milestones with ease',
    badge: 'Analytics',
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
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Modern Project Management
            </Badge>
          </motion.div>

          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Manage Projects
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
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
              className="text-base h-12 px-8 gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-6 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200 group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
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