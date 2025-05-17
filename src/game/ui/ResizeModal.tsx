import { useState, useRef } from 'react';

interface ResizableModalProps {
    title?: string;
    children: React.ReactNode;
    onClose: () => void;
    initialWidth?: number;
    initialHeight?: number;
    storageKey?: string;
    onMinimize?: () => void;
    onRestore?: () => void;
}

const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;


const ResizableModal = ({
    title = '',
    children,
    onClose,
    initialWidth = 400,
    initialHeight = 300,
    onMinimize,
    onRestore,
}: ResizableModalProps) => {
    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState(initialHeight);
    const [position, setPosition] = useState({ top: 80, left: 80 });
    const [isMinimized, setIsMinimized] = useState(false);

    const modalRef = useRef<HTMLDivElement | null>(null);

    const handleDragStart = (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startY = e.clientY;
        const { top, left } = position;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const newLeft = left + (moveEvent.clientX - startX);
            const newTop = top + (moveEvent.clientY - startY);
            setPosition({ top: newTop, left: newLeft });
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = width;
        const startHeight = height;

        const onMouseMove = (moveEvent: MouseEvent) => {
            setWidth(startWidth + (moveEvent.clientX - startX));
            setHeight(startHeight + (moveEvent.clientY - startY));
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div
            ref={modalRef}
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                width,
                height: isMinimized ? 'auto' : height,
                backgroundColor: '#111',
                color: 'white',
                border: '2px solid #444',
                borderRadius: '6px',
                zIndex: 2000,
                overflow: 'hidden',
                boxShadow: '0 0 10px rgba(0,0,0,0.7)',
            }}
        >
            {/* Title Bar */}
            <div
                onMouseDown={handleDragStart}
                style={{
                    cursor: 'move',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#222',
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid #333',
                    userSelect: 'none',
                }}
            >
                <h2 style={{ margin: 0 }}>{title}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMinimized(prev => {
                                const newState = !prev;
                                if (newState) {
                                    onMinimize?.(); // optional callback
                                } else {
                                    onRestore?.();
                                }
                                return newState;
                            });
                        }}

                        style={{
                            backgroundColor: '#555',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                        }}
                    >
                        {isMinimized ? '🔼' : '🔽'}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: '#b00',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Modal Content */}
            {!isMinimized && (
                <div style={{ padding: '1rem', height: 'calc(100% - 3rem)', overflowY: 'auto' }}>
                    {children}
                </div>
            )}

            {/* Resize Handle */}
            {!isMinimized && !isMobile && (
                <div
                    onMouseDown={handleResizeStart}
                    style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        width: '16px',
                        height: '16px',
                        cursor: 'nwse-resize',
                        backgroundColor: '#333',
                    }}
                />
            )}
        </div>
    );
};

export default ResizableModal;
