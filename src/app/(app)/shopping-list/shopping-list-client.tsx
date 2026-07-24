"use client";

import { useState, useTransition } from "react";
import { addItem, toggleItem, deleteItem, clearChecked } from "./actions";

export type ShoppingItem = { id: string; name: string; checked: boolean };

export function ShoppingListClient({ items }: { items: ShoppingItem[] }) {
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  function handleAdd() {
    const value = input.trim();
    if (!value) return;
    setInput("");
    startTransition(() => addItem(value));
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add an item..."
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          Add
        </button>
      </form>

      <ul className="flex flex-col gap-1">
        {unchecked.length === 0 && checked.length === 0 ? (
          <li className="text-sm text-neutral-500">List&apos;s empty — add something above.</li>
        ) : null}
        {unchecked.map((item) => (
          <ShoppingRow key={item.id} item={item} />
        ))}
      </ul>

      {checked.length > 0 ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Checked off
            </span>
            <button
              type="button"
              onClick={() => startTransition(() => clearChecked())}
              className="text-xs text-neutral-500 underline"
            >
              Clear checked
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {checked.map((item) => (
              <ShoppingRow key={item.id} item={item} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ShoppingRow({ item }: { item: ShoppingItem }) {
  const [, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={(e) => startTransition(() => toggleItem(item.id, e.target.checked))}
        className="h-4 w-4"
      />
      <span className={item.checked ? "flex-1 text-neutral-400 line-through" : "flex-1"}>
        {item.name}
      </span>
      <button
        type="button"
        onClick={() => startTransition(() => deleteItem(item.id))}
        aria-label={`Remove ${item.name}`}
        className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
      >
        &times;
      </button>
    </li>
  );
}
