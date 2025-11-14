import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Ctx = {
  open: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
};

const NotificationsPanelContext = createContext<Ctx | undefined>(undefined);

export const NotificationsPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const openPanel = useCallback(() => setOpen(true), []);
  const closePanel = useCallback(() => setOpen(false), []);
  const togglePanel = useCallback(() => setOpen((v) => !v), []);

  const value = useMemo(() => ({ open, openPanel, closePanel, togglePanel }), [open, openPanel, closePanel, togglePanel]);

  return (
    <NotificationsPanelContext.Provider value={value}>
      {children}
    </NotificationsPanelContext.Provider>
  );
};

export const useNotificationsPanel = (): Ctx => {
  const ctx = useContext(NotificationsPanelContext);
  if (!ctx) throw new Error("useNotificationsPanel must be used within NotificationsPanelProvider");
  return ctx;
};
