import { Skill } from '../skills/skillsData';
import { Character } from '../types/characterTypes';
import { Enemy } from '../../combat/enemies';
import { calculateMaxHp } from '../GameEngine/stats';

interface UseSkillParams {
  skill: Skill;
  player: Character;
  enemy: Enemy;
  playerHp: number;
  enemyHp: number;
  appendLog: (text: string) => void;
  setPlayerHp: (hp: number) => void;
  setEnemyHp: (hp: number) => void;
  setTurn: (turn: 'player' | 'enemy') => void;
  onVictory: (xp: number, finalHp: number) => void;
}

export const useSkill = ({
  skill,
  player,
  enemy,
  playerHp,
  enemyHp,
  appendLog,
  setPlayerHp,
  setEnemyHp,
  setTurn,
  onVictory,
}: UseSkillParams) => {
  if (player.currentMp < skill.manaCost) {
    appendLog(`${player.name} doesn't have enough MP to use ${skill.name}!`);
    return;
  }

  player.currentMp -= skill.manaCost;

  let effectLog = `${player.name} uses ${skill.name}`;

  if (skill.damageMultiplier && skill.scalingStat && skill.target === 'enemy') {
    const statValue = player[skill.scalingStat];
    const damage = Math.floor(statValue * skill.damageMultiplier + Math.random() * 5);
    const newEnemyHp = Math.max(0, enemyHp - damage);

    effectLog += ` and hits ${enemy.name} for ${damage} damage!`;
    setEnemyHp(newEnemyHp);

    if (newEnemyHp <= 0) {
      appendLog(`${effectLog}\n${enemy.name} was defeated!`);
      setTimeout(() => onVictory(enemy.xp, playerHp), 1000);
      return;
    }

    setTurn('enemy');
  } else if (skill.healingAmount && skill.scalingStat && skill.target === 'self') {
    const statValue = player[skill.scalingStat];
    const healing = Math.floor(skill.healingAmount + statValue * 0.5);
    const newHp = Math.min(playerHp + healing, calculateMaxHp(player));

    effectLog += ` and heals for ${healing} HP!`;
    setPlayerHp(newHp);
    setTurn('enemy');
  }

  appendLog(effectLog);
};
