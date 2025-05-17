import { useEffect, useState, useRef } from 'react';
import { getArea, Area, getMapData, setMapData } from '../map/map';
import Inventory from '../inventory/Inventory';
import { LootItem } from '../loot/index';
import { generateRandomLoot } from '../loot';
import StatPanel from '../ui/StatPanel';
import CharacterStats from '../ui/CharacterStats';
import { Character } from '../types/characterTypes';
import CombatScreen from '../ui/CombatScreen';
import InventoryModal from '../ui/InventoryModal';
import {
  calculateMaxHp,
  calculateMaxMp,
  calculateNextLevelXp,
  normalizeCharacter,
} from './stats';
import MiniMap from '../map/MiniMap';
import CanvasArea from './CanvasArea';
import InspectModal from '../ui/InspectModal';
import { applyBonuses } from '../../utils/statBonuses';
import MerchantModal from '../ui/Merchant';
import ResizableModal from '../ui/ResizeModal';

interface Props {
  character: Character;
  onSwitchCharacter: () => void;
}

type DirectionKey = 'north' | 'south' | 'east' | 'west';

type ArmorSlot = 'helmet' | 'chest' | 'back' | 'legs' | 'boots';

const GameEngine = ({ character, onSwitchCharacter }: Props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [showStats, setShowStats] = useState(false);

  const [area, setArea] = useState<Area>(getArea(0, 0));
  const [dialog, setDialog] = useState<string | null>(null);
  const [inventory, setInventory] = useState<LootItem[]>([]);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const currentPosRef = useRef(currentPos);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [inCombat, setInCombat] = useState(false);
  const [enemyInCombat, setEnemyInCombat] = useState<any | null>(null);
  const [inspectedItem, setInspectedItem] = useState<LootItem | null>(null);
  const [player, setPlayer] = useState<Character | null>(null);
  const [showInventoryPanel, setShowInventoryPanel] = useState(false);
  const [showMerchant, setShowMerchant] = useState(false);
  const [merchantItems, setMerchantItems] = useState<LootItem[]>([]);
  const [inventoryMinimized, setInventoryMinimized] = useState(false);


  const openMerchant = () => {
    const items = Array.from({ length: 5 }, () => generateRandomLoot(player?.level || 1));
    setMerchantItems(items);
    setShowMerchant(true);
  };

  const hasLoadedOnce = useRef(false);
  const hasSyncedPlayerData = useRef(false);
  const skipNextXpEffect = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTwoHandedWeapon = (item: LootItem): boolean => {
    const name = item.name.toLowerCase();
    return ['greatsword', 'greataxe', 'bow'].some(type => name.includes(type));
  };

  useEffect(() => {
    const updateOrientation = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);


  useEffect(() => {
    currentPosRef.current = currentPos;
  }, [currentPos]);

  const moveWithRef = (dir: DirectionKey) => {
    const { x, y } = currentPosRef.current;

    const directions = {
      north: { x, y: y - 1, exit: 'north', entry: 'south' },
      south: { x, y: y + 1, exit: 'south', entry: 'north' },
      east: { x: x + 1, y, exit: 'east', entry: 'west' },
      west: { x: x - 1, y, exit: 'west', entry: 'east' },
    };

    const { x: newX, y: newY, exit, entry } = directions[dir];
    const current = getArea(x, y);
    const destination = getArea(newX, newY);

    const isBlocked =
      current.blocked?.[exit as DirectionKey] ||
      destination?.blocked?.[entry as DirectionKey];

    if (!isBlocked) {
      setCurrentPos({ x: newX, y: newY });
      setArea(destination);
      setDialog(null);
    } else {
      setDialog("You can't go that way.");
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      const modalIsBlocking = showMerchant || (showInventoryPanel && !inventoryMinimized);

      if (modalIsBlocking) {
        if (e.key === 'Escape') {
          setShowMerchant(false);
          setShowInventoryPanel(false);
          setInventoryMinimized(false);
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'i':
          setShowInventoryPanel(prev => !prev);
          setInventoryMinimized(false); // reset minimization
          break;
        case 'm':
          setShowMiniMap(prev => !prev);
          break;
        case 'w':
          moveWithRef('north');
          break;
        case 's':
          moveWithRef('south');
          break;
        case 'a':
          moveWithRef('west');
          break;
        case 'd':
          moveWithRef('east');
          break;
        case 'escape':
          setShowInventoryPanel(false);
          setShowMerchant(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showMerchant, showInventoryPanel, inventoryMinimized]);


  useEffect(() => {
    if (!hasLoadedOnce.current) {
      handleLoad();
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    if (player && !hasSyncedPlayerData.current) {
      setArea(getArea(player.pos?.x ?? 0, player.pos?.y ?? 0));
      if (player.map) setMapData(player.map);
      setInventory(player.inventory ?? []);
      setCurrentPos(player.pos ?? { x: 0, y: 0 });
      hasSyncedPlayerData.current = true;
    }
  }, [player]);

  useEffect(() => {
    if (!player || skipNextXpEffect.current) {
      skipNextXpEffect.current = false;
      return;
    }

    setPlayer((prev) => {
      if (!prev) return null;

      let updated = { ...prev };

      let leveledUp = false;

      while (updated.xp >= calculateNextLevelXp(updated.level)) {
        updated.xp -= calculateNextLevelXp(updated.level);
        updated.level += 1;
        leveledUp = true;

        updated.strength += 1;
        updated.dexterity += 1;
        updated.intelligence += 1;
        updated.endurance += 1;
        updated.luck += 1;
      }

      if (leveledUp) {
        // TEMP: set to raw max (pre-bonus)
        updated.currentHp = calculateMaxHp(updated);
        updated.currentMp = calculateMaxMp(updated);

        // Apply bonuses and then clamp
        const final = applyBonuses(updated);
        const finalMaxHp = calculateMaxHp(final);
        const finalMaxMp = calculateMaxMp(final);

        updated.currentHp = Math.min(updated.currentHp, finalMaxHp);
        updated.currentMp = Math.min(updated.currentMp, finalMaxMp);
      }

      return applyBonuses(updated);
    });
  }, [player?.xp]);

  const buffedPlayer = player ? applyBonuses(player) : null;
  const maxHp = buffedPlayer ? calculateMaxHp(buffedPlayer) : 0;
  const maxMp = buffedPlayer ? calculateMaxMp(buffedPlayer) : 0;
  const nextLevelXp = player ? calculateNextLevelXp(player.level) : 0;

  const move = (dir: DirectionKey) => {
    const { x, y } = currentPos;
    const directions = {
      north: { x, y: y - 1, exit: 'north', entry: 'south' },
      south: { x, y: y + 1, exit: 'south', entry: 'north' },
      east: { x: x + 1, y, exit: 'east', entry: 'west' },
      west: { x: x - 1, y, exit: 'west', entry: 'east' },
    };

    const current = getArea(x, y);
    const { x: newX, y: newY, exit, entry } = directions[dir];
    const destination = getArea(newX, newY);

    const isBlockedFromCurrent = current.blocked?.[exit as DirectionKey];
    const isBlockedFromDestination = destination.blocked?.[entry as DirectionKey];

    if (!isBlockedFromCurrent && !isBlockedFromDestination) {
      setCurrentPos({ x: newX, y: newY });
      setArea(destination);
      setDialog(null);
    } else {
      setDialog("You can't go that way.");
    }
  };

  const handleSave = async () => {
    const username = localStorage.getItem('currentUser');
    if (!username || !player) return;

    const saveData = {
      ...player,
      pos: currentPos,
      map: getMapData(),
      inventory,
      ...player.baseStats,
    };

    console.log("SAVE DATA:", saveData);

    await fetch('http://localhost:3001/api/users/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        characterId: player.id,
        progress: saveData,
      }),
    });

    alert('Game saved!');
  };

  const handleLoad = async () => {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    try {
      const res = await fetch(`http://localhost:3001/api/users/load/${username}`);
      const characters = await res.json();
      const updatedChar = characters.find((c: any) => c.id === character.id);
      console.log("LOADED CHARACTER DATA:", updatedChar);
      console.log("Loaded equipment:", updatedChar?.equipment);

      hasSyncedPlayerData.current = false;

      if (!updatedChar.baseStats) {
        updatedChar.baseStats = {
          strength: updatedChar.strength,
          dexterity: updatedChar.dexterity,
          intelligence: updatedChar.intelligence,
          wisdom: updatedChar.wisdom,
          endurance: updatedChar.endurance,
          charisma: updatedChar.charisma,
          luck: updatedChar.luck,
          divinity: updatedChar.divinity,
        };
      }

      if (updatedChar) {
        let playerData = applyBonuses(normalizeCharacter(updatedChar));
        setPlayer(applyBonuses(playerData));

        while (playerData.xp >= calculateNextLevelXp(playerData.level)) {
          playerData.xp -= calculateNextLevelXp(playerData.level);
          playerData.level += 1;

          playerData.strength += 1;
          playerData.dexterity += 1;
          playerData.intelligence += 1;
          playerData.endurance += 1;
          playerData.luck += 1;
        }

        setPlayer(playerData);
        setDialog('Progress loaded!');
        if (!playerData.baseStats) {
          playerData.baseStats = {
            strength: playerData.strength,
            dexterity: playerData.dexterity,
            intelligence: playerData.intelligence,
            wisdom: playerData.wisdom,
            endurance: playerData.endurance,
            charisma: playerData.charisma,
            luck: playerData.luck,
            divinity: playerData.divinity,
          };
        }
      } else {
        setPlayer(normalizeCharacter(character));
        setDialog('No previous save. Starting fresh!');
      }

    } catch (err) {
      console.error('Failed to load character data:', err);
      alert('Error loading character data');
    }
  };

  const handleHealPlayer = (npcName: string) => {
    if (!player) return;

    const needsHealing = player.currentHp < maxHp || player.currentMp < maxMp;
    if (needsHealing) {
      setPlayer((prev) =>
        prev && { ...prev, currentHp: maxHp, currentMp: maxMp }
      );
      setDialog(`${npcName} heals you completely!`);
    } else {
      setDialog(`${npcName} says you look healthy already.`);
    }
  };

  const handleCombatVictory = (xpGained: number, finalPlayerHp: number) => {
    if (!player) return;

    setInCombat(false);
    setEnemyInCombat(null);
    setArea((prev) => ({
      ...prev,
      enemies: prev.enemies?.filter((e) => e !== enemyInCombat),
    }));

    const dropChance = 0.3;
    const loot = Math.random() < dropChance && player
      ? generateRandomLoot(player.level)
      : null;

    if (loot) {
      setInventory(prev => [...prev, loot]);
      setDialog(`${enemyInCombat.name} defeated! You gained ${xpGained} XP. You found a ${loot.name}!`);
    } else {
      setDialog(`${enemyInCombat.name} defeated! You gained ${xpGained} XP.`);
    }

    setPlayer((prev) =>
      prev && { ...prev, xp: prev.xp + xpGained, currentHp: finalPlayerHp }
    );
  };

  const handleBuy = (item: LootItem) => {
    if (!player) return;
    const cost = item.value ?? 0;

    if ((player.gold ?? 0) < cost) {
      setDialog("You can't afford that.");
      return;
    }

    setPlayer(prev =>
      prev ? { ...prev, gold: (prev.gold ?? 0) - cost } : null
    );

    setInventory(prev => [...prev, item]);
    setMerchantItems(prev => prev.filter(i => i.id !== item.id));
    setDialog(`You bought ${item.name} for ${cost} gold.`);
  };


  const renderMoveButton = (dir: DirectionKey, label: string) => {
    const directionOffsets = {
      north: { x: 0, y: -1, exit: 'north', entry: 'south' },
      south: { x: 0, y: 1, exit: 'south', entry: 'north' },
      east: { x: 1, y: 0, exit: 'east', entry: 'west' },
      west: { x: -1, y: 0, exit: 'west', entry: 'east' },
    } as const;

    const { x, y } = currentPos;
    const { x: dx, y: dy, exit, entry } = directionOffsets[dir];
    const current = getArea(x, y);
    const destination = getArea(x + dx, y + dy);

    const isBlocked =
      current.blocked?.[exit] === true || destination?.blocked?.[entry] === true;

    return (
      <button
        onClick={() => move(dir)}
        disabled={isBlocked}
        style={{ opacity: isBlocked ? 0.3 : 1, cursor: isBlocked ? 'not-allowed' : 'pointer' }}
      >
        {label}
      </button>
    );
  };

  if (!player) {
    return <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading character...</p>;
  }

  if (inCombat && enemyInCombat) {
    return (
      <CombatScreen
        player={player}
        enemy={enemyInCombat}
        onVictory={handleCombatVictory}
        onDefeat={async () => {
          setInCombat(false);
          setEnemyInCombat(null);
          setDialog('You were defeated, child of time... The gears of time turns in reverse...');
          await handleLoad();
        }}
        onFlee={(finalPlayerHp, finalPlayerMp) => {
          setInCombat(false);
          setEnemyInCombat(null);
          setDialog(`${player.name} fled from battle!`);

          setPlayer((prev) =>
            prev ? {
              ...prev,
              currentHp: finalPlayerHp,
              currentMp: finalPlayerMp,
            } : null
          );
        }}

      />
    );
  }

  const equipItem = (item: LootItem) => {
    if (!player) return;

    setPlayer(prev => {
      if (!prev) return null;

      const updated = { ...prev };
      const inv = [...(updated.inventory ?? [])];

      const removeFromInventory = () => {
        const index = inv.findIndex(i => i.id === item.id);
        if (index !== -1) inv.splice(index, 1);
      };

      const pushOldToInventory = (oldItem?: LootItem) => {
        if (oldItem) inv.push(oldItem);
      };

      removeFromInventory();

      if (item.type === 'weapon') {
        const isShield = item.name.toLowerCase().includes('shield');
        const isTwoHanded = isTwoHandedWeapon(item); // ✅ USE IT HERE

        if (isShield) {
          const mainWeapon = updated.equipment.weapon1;
          if (mainWeapon && isTwoHandedWeapon(mainWeapon)) {
            pushOldToInventory(mainWeapon);
            updated.equipment.weapon1 = undefined;
            setDialog("Your two-handed weapon was unequipped to make room for the shield.");
          }

          pushOldToInventory(updated.equipment.weapon2);
          updated.equipment.weapon2 = item;
        } else {
          const offhand = updated.equipment.weapon2;
          if (offhand && offhand.name.toLowerCase().includes('shield') && isTwoHanded) {
            pushOldToInventory(offhand);
            updated.equipment.weapon2 = undefined;
            setDialog("Your shield was unequipped to wield the two-handed weapon.");
          }

          pushOldToInventory(updated.equipment.weapon1);
          updated.equipment.weapon1 = item;
        }

      } else if (item.type === 'armor') {
        const slot: ArmorSlot | null =
          item.name.toLowerCase().includes('helmet') ? 'helmet' :
            item.name.toLowerCase().includes('chest') ? 'chest' :
              item.name.toLowerCase().includes('back') ? 'back' :
                item.name.toLowerCase().includes('legs') ? 'legs' :
                  item.name.toLowerCase().includes('boots') ? 'boots' : null;

        if (slot && slot in updated.equipment.armor) {
          if (slot) {
            pushOldToInventory(updated.equipment.armor[slot]);
            updated.equipment.armor[slot] = item;
          }
        }
      }

      updated.inventory = inv;
      return applyBonuses(updated);
    });
  };

  const unequipItem = (item: LootItem) => {
    if (!player) return;

    setPlayer(prev => {
      if (!prev) return null;

      const updated = { ...prev };
      const inv = [...(updated.inventory ?? [])];
      inv.push(item); // Add unequipped item back to inventory

      if (item.type === 'weapon') {
        if (updated.equipment.weapon1?.id === item.id) {
          updated.equipment.weapon1 = undefined;
        } else if (updated.equipment.weapon2?.id === item.id) {
          updated.equipment.weapon2 = undefined;
        }
      }
      else if (item.type === 'armor') {
        const slot: ArmorSlot | null = item.name.toLowerCase().includes('helmet') ? 'helmet' :
          item.name.toLowerCase().includes('chest') ? 'chest' :
            item.name.toLowerCase().includes('back') ? 'back' :
              item.name.toLowerCase().includes('legs') ? 'legs' :
                item.name.toLowerCase().includes('boots') ? 'boots' : null;

        if (slot && updated.equipment.armor[slot]?.id === item.id) {
          updated.equipment.armor[slot] = undefined;
        }
      }

      updated.inventory = inv;
      return applyBonuses(updated);
    });
  };

  const isEquipped = (item: LootItem): boolean => {
    if (!player || !player.equipment) return false;
    if (item.type === 'weapon') {
      return (
        player.equipment.weapon1?.id === item.id ||
        player.equipment.weapon2?.id === item.id
      );
    }

    if (
      item.type === 'armor' &&
      player.equipment &&
      player.equipment.armor &&
      Object.values(player.equipment.armor).some(slot => slot?.id === item.id)
    ) {
      return true;
    }

    return false;
  };

  const handleUseItem = (item: LootItem) => {
    if (!player || !item.effect) return;

    let updated = { ...player };
    const maxHp = calculateMaxHp(applyBonuses(updated));
    const maxMp = calculateMaxMp(applyBonuses(updated));

    let restoredAmount = 0;

    if (item.effect.type === 'heal') {
      restoredAmount = item.effect.amount ?? Math.floor((item.effect.percent ?? 0) * maxHp / 100);
      updated.currentHp = Math.min(updated.currentHp + restoredAmount, maxHp);
      setDialog(`${item.name} restores ${restoredAmount} HP!`);
    } else if (item.effect.type === 'mana') {
      restoredAmount = item.effect.amount ?? Math.floor((item.effect.percent ?? 0) * maxMp / 100);
      updated.currentMp = Math.min(updated.currentMp + restoredAmount, maxMp);
      setDialog(`${item.name} restores ${restoredAmount} MP!`);
    }

    setInventory((prev) => prev.filter((i) => i.id !== item.id));
    setPlayer(applyBonuses(updated));
  };

  const handleSell = (item: LootItem) => {

    if (isEquipped(item)) {
      setDialog("You must unequip the item before selling it.");
      return;
    }

    const value = item.value ?? 0;

    setInventory((prev) => prev.filter((i) => i.id !== item.id));
    setPlayer((prev) =>
      prev ? { ...prev, gold: (prev.gold ?? 0) + value } : null
    );

    setDialog(`${item.name} sold for ${value} gold.`);
  };


  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '1rem',
        justifyContent: 'center',
        padding: '1rem',
        flexWrap: 'wrap',
        position: 'relative'
      }}
    >
      {/* Always show MiniMap on desktop in a corner */}
      {!isMobile && (
        <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 10 }}>
          <MiniMap currentX={currentPos.x} currentY={currentPos.y} />
        </div>
      )}

      {/* Show minimap as draggable modal on mobile */}
      {isMobile && showMiniMap && (
        <ResizableModal
          title="🗺 MiniMap"
          onClose={() => setShowMiniMap(false)}
          initialWidth={300}
          initialHeight={300}
        >
          <MiniMap currentX={currentPos.x} currentY={currentPos.y} />
        </ResizableModal>
      )}

      {!isMobile || isLandscape || showStats ? (
        <CharacterStats character={player} />
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => setShowStats(prev => !prev)}
            style={{
              backgroundColor: '#333',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #555',
              cursor: 'pointer',
            }}
          >
            {showStats ? '🙈 Hide Stats' : '🧠 Show Stats'}
          </button>
        </div>
      )}

      <div
        style={{
          flex: 1,
          minWidth: 300,
          maxWidth: isMobile ? '100%' : '960px',
          aspectRatio: '16 / 9',
          margin: '0 auto',
          overflow: 'visible',
          backgroundColor: '#223',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: 'white', textAlign: 'center' }}>{area.name}</h3>

        <CanvasArea
          area={area}
          player={player}
          setDialog={setDialog}
          setInCombat={setInCombat}
          setEnemyInCombat={setEnemyInCombat}
          onHealPlayer={handleHealPlayer}
          openMerchant={openMerchant}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem', touchAction: 'manipulation' }}>
          <div />
          {renderMoveButton('north', '⬆️ North')}
          <div />
          {renderMoveButton('west', '⬅️ West')}
          <div />
          {renderMoveButton('east', '➡️ East')}
          <div />
          {renderMoveButton('south', '⬇️ South')}
          <div />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={handleSave}>💾 Save</button>
          <button onClick={handleLoad}>📂 Load Game</button>
          <button onClick={onSwitchCharacter}>🔁 Switch Character</button>
          <button onClick={() => setShowMiniMap((prev) => !prev)}>
            {showMiniMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
          </button>
          <button onClick={() => setShowInventoryPanel(true)}>🎒 Open Inventory</button>

        </div>

        {dialog && (
          <div
            style={{
              marginTop: '1rem',
              backgroundColor: '#111',
              color: '#fff',
              padding: '1rem',
              border: '2px solid #555',
              borderRadius: '8px',
              textAlign: 'center',
              maxWidth: '100%',
            }}
          >
            <p>{dialog}</p>
            <button onClick={() => setDialog(null)}>Close</button>
          </div>
        )}
      </div>

      {showInventoryPanel && (
        <InventoryModal
          items={inventory}
          isEquipped={isEquipped}
          onRemove={(id) => setInventory((prev) => prev.filter((i) => i.id !== id))}
          onInspect={setInspectedItem}
          onEquip={equipItem}
          onUnequip={unequipItem}
          onUse={handleUseItem}
          onSell={handleSell}
          canSell={showMerchant}
          onClose={() => setShowInventoryPanel(false)}
          onMinimize={() => setInventoryMinimized(true)}
          onRestore={() => setInventoryMinimized(false)}
          equipmentSummary={
            <div
              style={{
                display: 'grid',
                gridTemplateAreas: `
            ". helmet ."
            "weapon chest weapon2"
            ". leggings ."
            ". boots ."
          `,
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                justifyItems: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div style={{ gridArea: 'helmet' }}>
                {player?.equipment.armor.helmet?.name || '🪖 Helmet'}
              </div>
              <div style={{ gridArea: 'weapon' }}>
                {player?.equipment.weapon1?.name || '🗡 Weapon'}
              </div>
              <div style={{ gridArea: 'chest' }}>
                {player?.equipment.armor.chest?.name || '🧥 Chestplate'}
              </div>
              <div style={{ gridArea: 'weapon2' }}>
                {player?.equipment.weapon2?.name || '🛡 Off-Hand'}
              </div>
              <div style={{ gridArea: 'leggings' }}>
                {player?.equipment.armor.legs?.name || '👖 Leggings'}
              </div>
              <div style={{ gridArea: 'boots' }}>
                {player?.equipment.armor.boots?.name || '🥾 Boots'}
              </div>
            </div>
          }
        />
      )}


      {inspectedItem && (
        <InspectModal item={inspectedItem} onClose={() => setInspectedItem(null)} />
      )}
      {showMerchant && (
        <MerchantModal
          onClose={() => setShowMerchant(false)}
          inventory={inventory}
          merchantItems={merchantItems}
          onSell={handleSell}
          onBuy={handleBuy}
          gold={player?.gold ?? 0}
        />
      )
      }

      <div style={{ minWidth: '240px', color: 'white', backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>{player.name}</h3>
        <div style={{ width: '100%', height: '120px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '1rem' }}>
          <p style={{ textAlign: 'center', paddingTop: '40px', color: '#bbb' }}>Portrait</p>
        </div>
        <StatPanel
          currentHp={player.currentHp}
          maxHp={maxHp}
          currentMp={player.currentMp}
          maxMp={maxMp}
          level={player.level}
          xp={player.xp}
          nextLevelXp={nextLevelXp}
          gold={player.gold}
        />
        <Inventory
          items={inventory}
          onRemove={(id) => setInventory((prev) => prev.filter((i) => i.id !== id))}
          onInspect={setInspectedItem}
          onEquip={equipItem}
          onUnequip={unequipItem}
          isEquipped={isEquipped}
          onUse={handleUseItem}
          onSell={handleSell}
        />
      </div>
    </div >
  );
};

export default GameEngine;
