import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Backpack } from 'lucide-react';

const PackingTab = ({ packingList = {}, checkedItems = {}, togglePackingItem = () => {} }) => {
  const renderPackingList = () => {
    // Ensure packingList is an object
    const safePackingList = packingList || {};
    
    if (Object.keys(safePackingList).length === 0) {
      return (
        <div className="text-center py-12">
          <Backpack className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No packing list available</h3>
          <p className="mt-1 text-sm text-gray-500">Your packing list will appear here once generated.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(safePackingList).map(([category, items]) => {
            if (!Array.isArray(items) || !items.length) {
              return null; // Skip if items is not an array or is empty
            }

            const checkedCount = items.filter((item, i) => {
              if (typeof item === 'object' && item !== null) {
                return item.packed;
              }
              return checkedItems[`${category}-${i}`];
            }).length;
            
            const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;
            
            return (
              <Card key={category} className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 capitalize">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <Backpack className="h-6 w-6" />
                      </div>
                      <span className="text-2xl font-bold">{category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{checkedCount}/{items.length}</div>
                      <div className="w-20 bg-white/20 rounded-full h-3 mt-2">
                        <div 
                          className="bg-white h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {items.map((item, itemIndex) => {
                      const itemName = (typeof item === 'object' && item !== null) ? item.name || item.item : String(item || '');
                      const isChecked = typeof item === 'object' ? item.packed : checkedItems[`${category}-${itemIndex}`];
                      
                      return (
                        <div 
                          key={itemIndex} 
                          className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-md' 
                              : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                          }`}
                          onClick={() => togglePackingItem(category, itemIndex)}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-400" />
                          )}
                          <span className={`flex-1 font-medium ${isChecked ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                            {itemName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return renderPackingList();
};

export default PackingTab;
