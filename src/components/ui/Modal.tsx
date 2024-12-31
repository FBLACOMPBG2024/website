import React from "react";
import { motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence } from "framer-motion";

// This is a reusable modal component
// It displays content in a modal dialog
// It's used to display additional information or actions
// It's a simple modal with a close button and a backdrop

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default function Modal({
  open,
  onClose,
  children,
}: React.PropsWithChildren<ModalProps>) {
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
            <button className="absolute top-2 right-2" onClick={onClose}>
              <IconX />
            </button>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
