import React from "react";
import { motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence } from "framer-motion";

// Reusable modal component
// Displays content in a modal dialog with a backdrop and a close button.

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({
  open,
  onClose,
  children,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center min-h-[91vh]"
        >
          <div className="relative bg-background p-4 rounded-md">
            <button
              className="absolute top-2 right-2"
              onClick={onClose}
              aria-label="Close modal"
            >
              <IconX />
            </button>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
