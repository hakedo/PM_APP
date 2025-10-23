import { useState } from 'react';

export function useFormDialog(initialState = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openDialog = (data = initialState) => {
    setFormData(data);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setFormData(initialState);
    setIsSubmitting(false);
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (submitFunction) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await submitFunction(formData);
      closeDialog();
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    isOpen,
    formData,
    isSubmitting,
    openDialog,
    closeDialog,
    updateFormData,
    setFormData,
    handleSubmit
  };
}
