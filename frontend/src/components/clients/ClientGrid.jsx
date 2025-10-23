import { motion, AnimatePresence } from 'framer-motion';
import { ClientCard } from './ClientCard';

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

export function ClientGrid({ 
  clients, 
  onClientClick, 
  onEditClient, 
  onDeleteClient,
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
        {clients.map(client => (
          <motion.div key={client._id} variants={itemVariants}>
            <ClientCard
              client={client}
              onClick={() => onClientClick(client._id)}
              onEdit={onEditClient}
              onDelete={onDeleteClient}
              showActions={showActions}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
