// src/components/ProgressBar.tsx
interface ProgressBarProps {
    current: number;
    max: number;
    color: string;
    label: string;
}

const ProgressBar = ({ current, max, color, label }: ProgressBarProps) => {
    const percent = (current / max) * 100;

    return (
        <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.25rem' }}><strong>{label}</strong></p>
            <div style={{
                backgroundColor: '#555',
                width: '100%',
                height: '24px',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    backgroundColor: color,
                    transition: 'width 0.3s ease',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }} />
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                }}>
                    {current} / {max}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
