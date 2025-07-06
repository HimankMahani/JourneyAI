import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Backpack } from 'lucide-react';

const PackingTab = ({ packingList, checkedItems, togglePackingItem }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(packingList).map(([category, items]) => {
          const checkedCount = items.filter((_, i) => checkedItems[`${category}-${i}`]).length;
          const progress = (checkedCount / items.length) * 100;
          
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
                    const isChecked = checkedItems[`${category}-${itemIndex}`];
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
                          {item}
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

export default PackingTab;
