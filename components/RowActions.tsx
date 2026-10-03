'use client';

import { ArrowDown, ArrowUp, MoreHorizontal, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RowActionsProps {
  label: string;
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export function RowActions({
  label,
  index,
  count,
  onMove,
  onRemove,
}: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="-mr-2 flex h-10 w-9 items-center justify-center rounded-md text-muted-foreground transition-[opacity,color] hover:text-foreground data-[state=open]:text-foreground [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:data-[state=open]:opacity-100"
          aria-label={`${label} options`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem] rounded-lg">
        <DropdownMenuItem onClick={() => onMove(-1)} disabled={index === 0}>
          <ArrowUp className="mr-2 h-4 w-4 text-muted-foreground" />
          Move up
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onMove(1)}
          disabled={index === count - 1}
        >
          <ArrowDown className="mr-2 h-4 w-4 text-muted-foreground" />
          Move down
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRemove}
          disabled={count <= 1}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
