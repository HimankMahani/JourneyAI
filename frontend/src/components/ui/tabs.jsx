import React, { createContext, useState, useContext, useEffect } from "react";
import { cn } from "../../lib/utils"; 

const TabsContext = createContext({
  value: "",
  onValueChange: () => {},
});

const Tabs = ({ value, onValueChange, defaultValue, className, children, ...props }) => {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue || "");
  
  useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value);
    }
  }, [value]);
  
  const handleValueChange = (newValue) => {
    setSelectedTab(newValue);
    onValueChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ value: selectedTab, onValueChange: handleValueChange }}>
      <div className={cn("data-[orientation=vertical]:flex", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, ...props }) => (
  <div
    className={cn(
      "inline-flex items-center justify-center p-1 rounded-md",
      className
    )}
    role="tablist"
    {...props}
  />
);

const TabsTrigger = ({ value, className, children, ...props }) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isActive = selectedValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children, ...props }) => {
  const { value: selectedValue } = useContext(TabsContext);
  const isSelected = selectedValue === value;
  
  if (!isSelected) return null;
  
  return (
    <div
      role="tabpanel"
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "mt-2 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
