import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Backpack, Plus, X } from 'lucide-react';

// Basic defaults only
const DEFAULT_ITEMS = [
  'Passport / ID',
  'Tickets / Boarding pass',
  'Wallet & Cash',
  'Phone & Charger',
  'Medications',
  'Toothbrush & Toiletries'
];

// Normalize any incoming packing list into a flat array of { name, packed }
const normalizeToFlatList = (packingList) => {
  if (!packingList) return [];

  // If already flat array
  if (Array.isArray(packingList)) {
    return packingList.map((item) =>
      typeof item === 'string' ? { name: item, packed: false } : { name: item?.name || item?.item || String(item), packed: !!item?.packed }
    );
  }

  // If object of categories, prefer essentials, else flatten first category
  if (typeof packingList === 'object') {
    const categories = Object.keys(packingList);
    if (categories.length === 0) return [];

    const preferred =
      packingList.essentials && Array.isArray(packingList.essentials)
        ? packingList.essentials
        : packingList[categories[0]];

    if (!Array.isArray(preferred)) return [];

    return preferred.map((item) =>
      typeof item === 'string' ? { name: item, packed: false } : { name: item?.name || item?.item || String(item), packed: !!item?.packed }
    );
  }

  return [];
};

const PackingTab = ({ packingList, onUpdate }) => {
  const initialItems = useMemo(() => {
    // If packingList is explicitly provided (even empty array), use it
    if (Array.isArray(packingList)) {
      return normalizeToFlatList(packingList);
    }
    // If packingList is null/undefined, use defaults
    if (!packingList) {
      return DEFAULT_ITEMS.map((n) => ({ name: n, packed: false }));
    }
    // If object, normalize it
    const normalized = normalizeToFlatList(packingList);
    return normalized.length > 0 ? normalized : DEFAULT_ITEMS.map((n) => ({ name: n, packed: false }));
  }, [packingList]);

  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');

  // Ensure we refresh when packingList changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const notifyUpdate = (newItems) => {
    if (onUpdate) {
      onUpdate(newItems);
    }
  };

  const packedCount = items.filter((i) => i.packed).length;
  const progress = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  const toggleItem = (index) => {
    const newItems = items.map((it, i) => (i === index ? { ...it, packed: !it.packed } : it));
    setItems(newItems);
    notifyUpdate(newItems);
  };

  const addItem = () => {
    const name = newItem.trim();
    if (!name) return;
    const newItems = [...items, { name, packed: false }];
    setItems(newItems);
    setNewItem('');
    notifyUpdate(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    notifyUpdate(newItems);
  };

  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Backpack className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">Packing List</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{packedCount}/{items.length}</div>
            <div className="w-28 bg-white/20 rounded-full h-3 mt-2">
              <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* Add item row */}
        <div className="flex items-center gap-2 mb-6">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add a custom item (e.g., Power bank)"
            className="flex-1 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all"
          />
          <button
            onClick={addItem}
            className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl px-4 py-3 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Add
          </button>
        </div>

        {/* Items list */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all ${
                item.packed
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-md'
                  : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
              }`}
            >
              <button onClick={() => toggleItem(idx)} className="p-1" aria-label="toggle packed">
                {item.packed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <span className={`flex-1 font-medium ${item.packed ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                {item.name}
              </span>
              <button onClick={() => removeItem(idx)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="remove item">
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PackingTab;
