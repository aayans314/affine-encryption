import { useRef } from "react";
import type { ReactNode, FC, MouseEvent } from "react";
import { motion } from "framer-motion";
import './SpotlightCard.css';

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    spotlightColor?: string;
    layout?: boolean;
    initial?: any;
    animate?: any;
    transition?: any;
    exit?: any;
}

const SpotlightCard: FC<SpotlightCardProps> = ({
    children,
    className = "",
    spotlightColor = "rgba(255, 255, 255, 0.05)",
    layout = false,
    initial,
    animate,
    transition,
    exit
}) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        divRef.current.style.setProperty('--mouse-x', `${x}px`);
        divRef.current.style.setProperty('--mouse-y', `${y}px`);
        divRef.current.style.setProperty('--spotlight-color', spotlightColor);
    };

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={`card-spotlight ${className}`}
            layout={layout}
            initial={initial}
            animate={animate}
            transition={transition}
            exit={exit}
        >
            {children}
        </motion.div>
    );
};

export default SpotlightCard;
