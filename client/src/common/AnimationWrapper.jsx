import { AnimatePresence, motion } from 'framer-motion';

const AnimationWrapper = ({
  children,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 1 },
  className,
  keyVal,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key={keyVal}
        initial={initial}
        animate={animate}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;
