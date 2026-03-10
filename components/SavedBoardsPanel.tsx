'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookmarkPlus, Save, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useCurrencyContext } from '@/lib/CurrencyContext';

type SavedBoard = {
  id: string;
  name: string;
  baseValue: number;
  baseCurrency: string;
  currenciesList: string[];
  updatedAt: number;
};

const DEFAULT_PRESETS = [10, 50, 100, 500, 1000];
const CUSTOM_PRESETS_KEY = 'currencyCustomPresets';
const SAVED_BOARDS_KEY = 'currencySavedBoards';

const parseNumberList = (raw: string | null): number[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
};

const parseBoards = (raw: string | null): SavedBoard[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (board): board is SavedBoard =>
        typeof board?.id === 'string' &&
        typeof board?.name === 'string' &&
        typeof board?.baseValue === 'number' &&
        typeof board?.baseCurrency === 'string' &&
        Array.isArray(board?.currenciesList) &&
        typeof board?.updatedAt === 'number'
    );
  } catch {
    return [];
  }
};

export function SavedBoardsPanel() {
  const {
    baseValue,
    setBaseValue,
    baseCurrency,
    setBaseCurrency,
    currenciesList,
    setCurrenciesList,
  } = useCurrencyContext();

  const [customPresets, setCustomPresets] = useState<number[]>([]);
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([]);
  const [boardName, setBoardName] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCustomPresets(parseNumberList(window.localStorage.getItem(CUSTOM_PRESETS_KEY)));
    setSavedBoards(parseBoards(window.localStorage.getItem(SAVED_BOARDS_KEY)));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return;
    window.localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
  }, [customPresets, loaded]);

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return;
    window.localStorage.setItem(SAVED_BOARDS_KEY, JSON.stringify(savedBoards));
  }, [savedBoards, loaded]);

  const allPresets = useMemo(
    () => Array.from(new Set([...DEFAULT_PRESETS, ...customPresets])).sort((a, b) => a - b),
    [customPresets]
  );

  const saveCurrentPreset = () => {
    if (!Number.isFinite(baseValue) || baseValue <= 0) return;
    setCustomPresets((current) => Array.from(new Set([...current, baseValue])).sort((a, b) => a - b));
  };

  const saveCurrentBoard = () => {
    const trimmedName = boardName.trim() || `${baseCurrency} board`;
    const newBoard: SavedBoard = {
      id: `${Date.now()}`,
      name: trimmedName,
      baseValue,
      baseCurrency,
      currenciesList,
      updatedAt: Date.now(),
    };

    setSavedBoards((current) => {
      const withoutDuplicateName = current.filter(
        (board) => board.name.toLowerCase() !== trimmedName.toLowerCase()
      );
      return [newBoard, ...withoutDuplicateName].slice(0, 8);
    });
    setBoardName('');
  };

  const applyBoard = (board: SavedBoard) => {
    setBaseValue(board.baseValue);
    setBaseCurrency(board.baseCurrency);
    setCurrenciesList(board.currenciesList);
  };

  const removePreset = (preset: number) => {
    setCustomPresets((current) => current.filter((value) => value !== preset));
  };

  const removeBoard = (boardId: string) => {
    setSavedBoards((current) => current.filter((board) => board.id !== boardId));
  };

  return (
    <section className="rounded-xl border border-border/60 bg-card/60 p-3 space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Saved boards</h2>
          <p className="text-xs text-muted-foreground">
            Keep favorite conversion setups and reusable amount presets.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveCurrentPreset}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <BookmarkPlus className="h-4 w-4" />
            Save amount
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {allPresets.map((amount) => {
            const isCustom = customPresets.includes(amount);
            return (
              <div key={amount} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                <button
                  type="button"
                  onClick={() => setBaseValue(amount)}
                  className="text-xs font-medium hover:text-primary"
                >
                  {amount.toLocaleString()}
                </button>
                {isCustom ? (
                  <button
                    type="button"
                    onClick={() => removePreset(amount)}
                    className="rounded-sm p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                    aria-label={`Remove saved preset ${amount}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          value={boardName}
          onChange={(event) => setBoardName(event.target.value)}
          placeholder="Name this board (e.g. Vietnam trip)"
          maxLength={40}
        />
        <button
          type="button"
          onClick={saveCurrentBoard}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:w-auto"
        >
          <Save className="h-4 w-4" />
          Save current board
        </button>
      </div>

      {savedBoards.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-2">
          {savedBoards.map((board) => (
            <div
              key={board.id}
              className="rounded-lg border border-border/60 bg-background/80 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{board.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {board.baseValue.toLocaleString()} {board.baseCurrency}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeBoard(board.id)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Delete ${board.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground">
                {board.currenciesList.join(' • ')}
              </div>
              <button
                type="button"
                onClick={() => applyBoard(board)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Apply board
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No saved boards yet. Save the current setup to pin a favorite conversion layout.
        </p>
      )}
    </section>
  );
}
