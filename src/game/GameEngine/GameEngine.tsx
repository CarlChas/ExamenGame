import { useEffect, useState, useRef } from 'react';
import { getArea, Area, getMapData, setMapData } from '../map/map';
import Inventory from '../inventory/Inventory';
import { LootItem } from '../loot/index';
import { generateRandomLoot } from '../loot';
import StatPanel from '../ui/StatPanel';
import CharacterStats from '../ui/CharacterStats';
import { Character } from '../types/characterTypes';
import CombatScreen from '../ui/CombatScreen';
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

interface Props {
  character: Character;
  onSwitchCharacter: () => void;
}

type DirectionKey = 'north' | 'south' | 'east' | 'west';

type ArmorSlot = 'helmet' | 'chest' | 'back' | 'legs' | 'boots';

const GameEngine = ({ character, onSwitchCharacter }: Props) => {
  const [area, setArea] = useState<Area>(getArea(0, 0));
  const [dialog, setDialog] = useState<string | null>(null);
  const [inventory, setInventory] = useState<LootItem[]>([]);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [inCombat, setInCombat] = useState(false);
  const [enemyInCombat, setEnemyInCombat] = useState<any | null>(null);
  const [inspectedItem, setInspectedItem] = useState<LootItem | null>(null);
  const [player, setPlayer] = useState<Character | null>(null);
  const [showInventoryPanel, setShowInventoryPanel] = useState(false);

  const hasLoadedOnce = useRef(false);
  const hasSyncedPlayerData = useRef(false);
  const skipNextXpEffect = useRef(false);


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
        pushOldToInventory(updated.equipment.weapon1);
        updated.equipment.weapon1 = item;
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
        }
      } else if (item.type === 'armor') {
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
      return player.equipment.weapon1?.id === item.id;
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

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
      {showMiniMap && <MiniMap currentX={currentPos.x} currentY={currentPos.y} />}
      <CharacterStats character={player} />

      <div>
        <h3 style={{ color: 'white', textAlign: 'center' }}>{area.name}</h3>
        <CanvasArea
          area={area}
          player={player}
          setDialog={setDialog}
          setInCombat={setInCombat}
          setEnemyInCombat={setEnemyInCombat}
          onHealPlayer={handleHealPlayer}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
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

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={handleSave}>💾 Save</button>
          <button onClick={handleLoad}>📂 Load Game</button>
          <button onClick={onSwitchCharacter}>🔁 Switch Character</button>
          <button onClick={() => setShowMiniMap((prev) => !prev)}>
            {showMiniMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
          </button>
          <button onClick={() => setShowInventoryPanel(true)}>🎒 Open Inventory</button>

        </div>

        {dialog && (
          <div style={{ marginTop: '1rem', backgroundColor: '#111', color: '#fff', padding: '1rem', border: '2px solid #555', borderRadius: '8px', textAlign: 'center', maxWidth: '600px' }}>
            <p>{dialog}</p>
            <button onClick={() => setDialog(null)}>Close</button>
          </div>
        )}
      </div>

      {showInventoryPanel && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <button onClick={() => setShowInventoryPanel(false)} style={{ float: 'right' }}>❌ Close</button>
          <Inventory
            items={inventory}
            onEquip={equipItem}
            onUnequip={unequipItem}
            onRemove={(id) => setInventory(prev => prev.filter(i => i.id !== id))}
            onInspect={setInspectedItem}
            isEquipped={isEquipped}
            onUse={handleUseItem}
          />
        </div>
      )}

      {inspectedItem && (
        <InspectModal item={inspectedItem} onClose={() => setInspectedItem(null)} />
      )}

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
        />
        <Inventory
          items={inventory}
          onRemove={(id) => setInventory((prev) => prev.filter((i) => i.id !== id))}
          onInspect={setInspectedItem}
          onEquip={equipItem}
          onUnequip={unequipItem}
          isEquipped={isEquipped}
          onUse={handleUseItem}
        />
      </div>
    </div>
  );
};

export default GameEngine;
