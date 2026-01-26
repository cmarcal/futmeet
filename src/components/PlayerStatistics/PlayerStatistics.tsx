import { Users, Star } from 'lucide-react';
import type { Player } from '../../types';
import styles from './PlayerStatistics.module.css';

export interface PlayerStatisticsProps {
  players: Player[];
}

export const PlayerStatistics = ({ players }: PlayerStatisticsProps) => {
  const totalPlayers = players.length;
  const priorityPlayers = players.filter((p) => p.priority).length;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Users size={24} className={styles.icon} aria-hidden="true" />
        </div>
        <div className={styles.content}>
          <span className={styles.number}>{totalPlayers}</span>
          <span className={styles.label}>Total</span>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Star size={24} className={styles.priorityIcon} aria-hidden="true" />
        </div>
        <div className={styles.content}>
          <span className={styles.number}>{priorityPlayers}</span>
          <span className={styles.label}>Priority</span>
        </div>
      </div>
    </div>
  );
};
