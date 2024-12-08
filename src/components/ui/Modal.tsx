import React from "react";
import { motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence } from "framer-motion";

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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-background p-4 rounded-md"
          >
            <button className="absolute top-2 right-2" onClick={onClose}>
              <IconX />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
