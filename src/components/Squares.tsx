import { useRef, useEffect, useState } from 'react';

interface SquaresProps {
    direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
    speed?: number;
    borderColor?: string;
    squareSize?: number;
    hoverFillColor?: string;
}

const Squares: React.FC<SquaresProps> = ({
    direction = 'right',
    speed = 1,
    borderColor = '#999',
    squareSize = 40,
    hoverFillColor = '#222',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(undefined);
    const numSquaresX = useRef<number>(0);
    const numSquaresY = useRef<number>(0);
    const gridOffset = useRef({ x: 0, y: 0 });
    const [hoveredSquare, setHoveredSquare] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
            numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const drawGrid = () => {
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);


            const offsetX = gridOffset.current.x % squareSize;
            const offsetY = gridOffset.current.y % squareSize;

            for (let x = 0; x < (numSquaresX.current || 0); x++) {
                for (let y = 0; y < (numSquaresY.current || 0); y++) {
                    const squareX = x * squareSize - offsetX;
                    const squareY = y * squareSize - offsetY;

                    if (
                        hoveredSquare &&
                        Math.floor((x * squareSize - offsetX) / squareSize) === hoveredSquare.x &&
                        Math.floor((y * squareSize - offsetY) / squareSize) === hoveredSquare.y
                    ) {
                        ctx.fillStyle = hoverFillColor;
                        ctx.fillRect(squareX, squareY, squareSize, squareSize);
                    }

                    ctx.strokeStyle = borderColor;
                    ctx.strokeRect(squareX, squareY, squareSize, squareSize);
                }
            }

            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) / 2
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, '#060606');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const updateAnimation = () => {
            const effectiveSpeed = Math.max(speed, 0.1);
            switch (direction) {
                case 'right':
                    gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'left':
                    gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'up':
                    gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'down':
                    gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'diagonal':
                    gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
                    gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
                    break;
                default:
                    break;
            }

            drawGrid();
            requestRef.current = requestAnimationFrame(updateAnimation);
        };

        // Track mouse hover
        const handleMouseMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const startX = Math.floor(gridOffset.current.x / squareSize);
            const startY = Math.floor(gridOffset.current.y / squareSize);
            const offsetX = gridOffset.current.x % squareSize;
            const offsetY = gridOffset.current.y % squareSize;

            const hoveredSquareX = Math.floor((mouseX + offsetX - startX * squareSize) / squareSize);
            const hoveredSquareY = Math.floor((mouseY + offsetY - startY * squareSize) / squareSize);

            setHoveredSquare({ x: hoveredSquareX, y: hoveredSquareY });
        };

        const handleMouseLeave = () => {
            setHoveredSquare(null);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        requestRef.current = requestAnimationFrame(updateAnimation);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [direction, speed, borderColor, hoverFillColor, hoveredSquare, squareSize]);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />;
};

export default Squares;
