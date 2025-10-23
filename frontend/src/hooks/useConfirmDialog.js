import { useState, useCallback } from 'react';

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'default'
  });

  const openConfirmDialog = useCallback(({ title, description, onConfirm, variant = 'default' }) => {
    setConfig({ title, description, onConfirm, variant });
    setIsOpen(true);
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    await config.onConfirm();
    closeConfirmDialog();
  }, [config, closeConfirmDialog]);

  return {
    isOpen,
    config,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm
  };
}
