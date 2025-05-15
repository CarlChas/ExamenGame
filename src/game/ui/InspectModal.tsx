import { LootItem } from '../loot';

interface Props {
  item: LootItem;
  onClose: () => void;
}

const InspectModal = ({ item, onClose }: Props) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#222',
        color: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        minWidth: '320px',
        maxWidth: '90%',
      }}>
        <h2>{item.name}</h2>
        <p>Type: {item.type}</p>
        <p>Rarity: {item.rarity}</p>
        <p>Material: {item.material}</p>
        <p>Value: {item.value}g</p>
        {item.rank && <p>Rank: {item.rank}</p>}

        {item.bonusStats && item.bonusStats.length > 0 && (
          <div>
            <h4>Bonus Stats:</h4>
            <ul>
              {item.bonusStats.map((stat, idx) => (
                <li key={idx}>
                  {stat.stat}: {stat.flat ?? 0}
                  {stat.percent ? ` (+${stat.percent}%)` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default InspectModal;
