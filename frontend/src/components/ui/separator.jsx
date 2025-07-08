import React from 'react';

const Separator = ({ className = '', ...props }) => {
  return (
    <hr 
      className={`border-0 border-t border-gray-200 my-2 ${className}`}
      {...props}
    />
  );
};

export { Separator };
