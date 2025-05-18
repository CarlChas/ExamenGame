import ResizableModal from './ResizeModal';
import Inventory from '../inventory/Inventory';
import { LootItem } from '../loot';

interface Props {
    items: LootItem[];
    isEquipped: (item: LootItem) => boolean;
    onRemove: (id: string) => void;
    onInspect: (item: LootItem) => void;
    onEquip: (item: LootItem) => void;
    onUnequip: (item: LootItem) => void;
    onUse: (item: LootItem) => void;
    onSell: (item: LootItem) => void;
    onClose: () => void;
    canSell?: boolean;
    equipmentSummary?: React.ReactNode;
    onMinimize: () => void;
    onRestore: () => void;
    playerLevel: number;
}

const InventoryModal = ({
    items,
    isEquipped,
    onRemove,
    onInspect,
    onEquip,
    onUnequip,
    onUse,
    onSell,
    onClose,
    canSell = false,
    equipmentSummary,
    onMinimize,
    onRestore,
    playerLevel,
}: Props) => {
    return (
        <ResizableModal title="🎒 Inventory" onClose={onClose} onMinimize={onMinimize} onRestore={onRestore} initialWidth={750} initialHeight={500}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1.5rem',
                    height: '100%',
                    overflow: 'hidden', // Prevent outer overflow
                }}
            >
                {equipmentSummary && (
                    <div
                        style={{
                            flex: 1,
                            minWidth: '240px',
                            overflowY: 'auto',
                            maxHeight: '100%',
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>🧍 Equipped</h3>
                        {equipmentSummary}
                    </div>
                )}
                <div
                    style={{
                        flex: 2,
                        minWidth: '300px',
                        overflowY: 'auto',
                        maxHeight: '100%',
                    }}
                >
                    <Inventory
                        items={items}
                        isEquipped={isEquipped}
                        onRemove={onRemove}
                        onInspect={onInspect}
                        onEquip={onEquip}
                        onUnequip={onUnequip}
                        onUse={onUse}
                        onSell={onSell}
                        canSell={canSell}
                        playerLevel={playerLevel}
                    />
                </div>
            </div>
        </ResizableModal>
    );
};

export default InventoryModal;
