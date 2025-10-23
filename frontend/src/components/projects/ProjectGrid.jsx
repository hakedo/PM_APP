import { motion, AnimatePresence } from 'framer-motion';
import { ProjectCard } from './ProjectCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function ProjectGrid({ 
  projects, 
  onProjectClick, 
  onDeleteProject,
  teamMembers = [],
  showActions = true 
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {projects.map(project => (
          <motion.div key={project._id} variants={itemVariants}>
            <ProjectCard
              project={project}
              onClick={() => onProjectClick(project._id)}
              onDelete={onDeleteProject}
              teamMembers={teamMembers}
              showActions={showActions}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
