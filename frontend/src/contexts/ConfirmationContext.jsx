import React, { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ConfirmationContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context;
};

export const ConfirmationProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'destructive',
    resolve: null,
  });

  const confirm = useCallback(({ 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    variant = 'destructive'
  }) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        variant,
        resolve,
      });
    });
  }, []);

  const handleClose = (value) => {
    setDialogState((prev) => {
      if (prev.resolve) prev.resolve(value);
      return { ...prev, isOpen: false };
    });
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <Dialog open={dialogState.isOpen} onOpenChange={(open) => !open && handleClose(false)}>
        <DialogContent className="bg-[#F7F5F0] border-[#004643]/10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogState.title}</DialogTitle>
            <DialogDescription className="pt-2 text-gray-600">
              {dialogState.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleClose(false)} className="border-[#004643]/20 text-[#004643] hover:bg-[#004643]/10 hover:text-[#004643]">
              {dialogState.cancelText}
            </Button>
            <Button onClick={() => handleClose(true)} className={dialogState.variant === 'destructive' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#004643] hover:bg-[#004643]/90 text-white"}>
              {dialogState.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmationContext.Provider>
  );
};