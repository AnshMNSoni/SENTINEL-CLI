import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useKeyboardLayer } from '../keyboard-layer';
import { useTheme } from '../theme';
import { SentinelBorderChars } from '../../components/border';
import type { DialogConfig } from './types';

type DialogContextValue = {
  open: (config: DialogConfig) => void;
  close: () => void;
  isOpen: boolean;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const { push, pop, isTopLayer } = useKeyboardLayer();
  const { colors } = useTheme();

  const close = useCallback(() => {
    setDialog(null);
    pop('dialog');
  }, [pop]);

  const open = useCallback(
    (config: DialogConfig) => {
      setDialog(config);
      push('dialog', (key: string) => {
        if (key === 'escape') {
          close();
          return true;
        }
        return false;
      });
    },
    [push, close]
  );

  return (
    <DialogContext.Provider value={{ open, close, isOpen: !!dialog }}>
      {children}
      {dialog ? (
        <box position="absolute" top={0} left={0} width="100%" height="100%">
          <box
            backgroundColor="rgba(0,0,0,150)"
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
          >
            <box
              flexDirection="column"
              backgroundColor={colors.dialogSurface}
              border={SentinelBorderChars as any}
              borderColor={colors.dimSeparator}
              width={dialog.width ?? 60}
              height={dialog.height ?? 30}
              padding={1}
            >
              <box paddingBottom={1}>
                <text attributes={1}>{dialog.title}</text>
              </box>
              {/* Render dialog children safely: wrap plain strings/numbers in <text> */}
              {(() => {
                const c: any = dialog.children;
                if (c == null) return null;
                if (typeof c === 'string' || typeof c === 'number') return <text>{c}</text>;
                if (Array.isArray(c))
                  return c.map((item, i) =>
                    typeof item === 'string' || typeof item === 'number' ? (
                      <text key={i}>{item}</text>
                    ) : (
                      item
                    )
                  );
                return c;
              })()}
            </box>
          </box>
        </box>
      ) : null}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}
