import { Users } from 'lucide-react';
import { PlayerCard } from '../PlayerCard';
import type { Team } from '../../types';
import styles from './TeamCard.module.css';

export interface TeamCardProps {
  team: Team;
  showPlayerActions?: boolean;
  teamColor?: string;
}

const teamColors = [
  'var(--color-primary)',
  'var(--color-accent)',
  'var(--color-success)',
  'var(--color-priority)',
  '#9C27B0',
  '#00BCD4',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#E91E63',
];

export const TeamCard = ({ team, showPlayerActions = false, teamColor }: TeamCardProps) => {
  const colorIndex = parseInt(team.id.replace(/\D/g, '')) || 0;
  const cardColor = teamColor || teamColors[colorIndex % teamColors.length];

  return (
    <div className={styles.card} style={{ '--team-color': cardColor } as React.CSSProperties}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.iconWrapper}>
            <Users size={24} aria-hidden="true" />
          </div>
          <div className={styles.titleInfo}>
            <h3 className={styles.title}>{team.name}</h3>
            <span className={styles.count}>{team.players.length} player{team.players.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      <div className={styles.players}>
        {team.players.length === 0 ? (
          <p className={styles.emptyMessage}>No players assigned</p>
        ) : (
          team.players.map((player, index) => (
            <PlayerCard key={player.id} player={player} index={index} showActions={showPlayerActions} />
          ))
        )}
      </div>
    </div>
  );
};
