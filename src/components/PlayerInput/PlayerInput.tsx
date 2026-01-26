import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Input } from '../Input';
import { Button } from '../Button';
import { addPlayerSchema, type AddPlayerInput } from '../../schemas/playerSchemas';
import styles from './PlayerInput.module.css';

export interface PlayerInputProps {
  onSubmit: (name: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const PlayerInput = ({ onSubmit, disabled = false, placeholder = 'Enter player name' }: PlayerInputProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddPlayerInput>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleFormSubmit = (data: AddPlayerInput) => {
    onSubmit(data.name);
    reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form} noValidate>
      <div className={styles.inputWrapper}>
        <Input
          {...register('name')}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          error={!!errors.name}
          errorMessage={errors.name?.message}
          onKeyDown={handleKeyDown}
          aria-label="Player name"
          autoComplete="off"
          className={styles.input}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="medium"
        disabled={disabled || isSubmitting}
        className={styles.submitButton}
        aria-label="Add player"
      >
        <Plus size={20} aria-hidden="true" />
      </Button>
    </form>
  );
};
