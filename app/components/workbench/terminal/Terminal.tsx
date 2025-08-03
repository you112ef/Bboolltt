import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { SerializeAddon } from '@xterm/addon-serialize';
import { Terminal as XTerm } from '@xterm/xterm';
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Theme } from '~/lib/stores/theme';
import { createScopedLogger } from '~/utils/logger';
import { getTerminalTheme } from './theme';
import { classNames } from '~/utils/classNames';

const logger = createScopedLogger('Terminal');

export interface TerminalRef {
  reloadStyles: () => void;
  getTerminal: () => XTerm | undefined;
  search: (text: string) => void;
  clearSearch: () => void;
  copySelection: () => string;
  selectAll: () => void;
  clear: () => void;
  focus: () => void;
  resize: () => void;
}

export interface TerminalProps {
  className?: string;
  theme: Theme;
  readonly?: boolean;
  id: string;
  onTerminalReady?: (terminal: XTerm) => void;
  onTerminalResize?: (cols: number, rows: number) => void;
  onData?: (data: string) => void;
  enableSearch?: boolean;
  enableCopy?: boolean;
  fontSize?: number;
  fontFamily?: string;
  cursorStyle?: 'block' | 'underline' | 'bar';
  cursorBlink?: boolean;
  scrollback?: number;
}

export const Terminal = memo(
  forwardRef<TerminalRef, TerminalProps>(
    (
      {
        className,
        theme,
        readonly,
        id,
        onTerminalReady,
        onTerminalResize,
        onData,
        enableSearch = true,
        enableCopy = true,
        fontSize = 12,
        fontFamily = 'Menlo, Monaco, "Courier New", monospace',
        cursorStyle = 'block',
        cursorBlink = true,
        scrollback = 1000,
      },
      ref,
    ) => {
      const terminalElementRef = useRef<HTMLDivElement>(null);
      const terminalRef = useRef<XTerm>();
      const searchAddonRef = useRef<SearchAddon>();
      const serializeAddonRef = useRef<SerializeAddon>();
      const [isSearchVisible, setIsSearchVisible] = useState(false);

      useEffect(() => {
        const element = terminalElementRef.current!;

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        const searchAddon = new SearchAddon();
        const serializeAddon = new SerializeAddon();

        searchAddonRef.current = searchAddon;
        serializeAddonRef.current = serializeAddon;

        const terminal = new XTerm({
          cursorBlink,
          cursorStyle,
          convertEol: true,
          disableStdin: readonly,
          theme: getTerminalTheme(readonly ? { cursor: '#00000000' } : {}),
          fontSize,
          fontFamily,
          scrollback,
          allowProposedApi: true,
        });

        terminalRef.current = terminal;

        // Load addons
        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webLinksAddon);

        if (enableSearch) {
          terminal.loadAddon(searchAddon);
        }

        terminal.loadAddon(serializeAddon);

        terminal.open(element);

        // Handle data events
        if (onData) {
          terminal.onData(onData);
        }

        // Handle key events for enhanced functionality
        terminal.attachCustomKeyEventHandler((event) => {
          // Ctrl+F for search
          if (event.ctrlKey && event.key === 'f' && enableSearch) {
            event.preventDefault();
            setIsSearchVisible(true);

            return false;
          }

          // Ctrl+C for copy (when text is selected)
          if (event.ctrlKey && event.key === 'c' && enableCopy && terminal.hasSelection()) {
            event.preventDefault();
            navigator.clipboard.writeText(terminal.getSelection());

            return false;
          }

          // Ctrl+A for select all
          if (event.ctrlKey && event.key === 'a') {
            event.preventDefault();
            terminal.selectAll();

            return false;
          }

          return true;
        });

        const resizeObserver = new ResizeObserver(() => {
          fitAddon.fit();
          onTerminalResize?.(terminal.cols, terminal.rows);
        });

        resizeObserver.observe(element);

        logger.debug(`Enhanced Terminal attached [${id}]`);

        onTerminalReady?.(terminal);

        return () => {
          resizeObserver.disconnect();
          terminal.dispose();
        };
      }, []);

      useEffect(() => {
        const terminal = terminalRef.current!;

        // Update terminal theme and settings
        terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
        terminal.options.disableStdin = readonly;
        terminal.options.fontSize = fontSize;
        terminal.options.fontFamily = fontFamily;
        terminal.options.cursorStyle = cursorStyle;
        terminal.options.cursorBlink = cursorBlink;
        terminal.options.scrollback = scrollback;
      }, [theme, readonly, fontSize, fontFamily, cursorStyle, cursorBlink, scrollback]);

      useImperativeHandle(ref, () => {
        return {
          reloadStyles: () => {
            const terminal = terminalRef.current!;
            terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
          },
          getTerminal: () => {
            return terminalRef.current;
          },
          search: (text: string) => {
            if (enableSearch && searchAddonRef.current) {
              searchAddonRef.current.findNext(text);
            }
          },
          clearSearch: () => {
            if (enableSearch && searchAddonRef.current) {
              searchAddonRef.current.clearDecorations();
            }
          },
          copySelection: () => {
            const terminal = terminalRef.current!;
            return terminal.getSelection();
          },
          selectAll: () => {
            const terminal = terminalRef.current!;
            terminal.selectAll();
          },
          clear: () => {
            const terminal = terminalRef.current!;
            terminal.clear();
          },
          focus: () => {
            const terminal = terminalRef.current!;
            terminal.focus();
          },
          resize: () => {
            // This will be handled by the resize observer
          },
        };
      }, [enableSearch, readonly]);

      return (
        <div className={classNames('relative', className)}>
          <div ref={terminalElementRef} className="h-full w-full" />
          {isSearchVisible && enableSearch && (
            <div className="absolute top-2 right-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md p-2 shadow-lg">
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-bolt-elements-textPrimary text-sm w-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchAddonRef.current) {
                    searchAddonRef.current.findNext(e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    setIsSearchVisible(false);
                    searchAddonRef.current?.clearDecorations();
                  }
                }}
                onBlur={() => setIsSearchVisible(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      );
    },
  ),
);
