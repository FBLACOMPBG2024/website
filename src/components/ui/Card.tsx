import React, { ReactNode } from "react";
import clsx from "clsx";

// Reusable Card component for displaying data in a visually appealing way
// Provides a container with shadow, rounded corners, and customizable styles.

interface CardProps {
  children?: ReactNode;
  className?: string;
}

const baseCardStyles =
  "transition-colors duration-500 bg-backgroundGray p-4 rounded-lg shadow-md text-2xl";

const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={clsx(baseCardStyles, className)}>{children}</div>
);

export default Card;
