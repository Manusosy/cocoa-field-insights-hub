
import React from 'react';

interface AvatarInitialsProps {
  name: string;
  className?: string;
}

export const AvatarInitials = ({ name, className = "" }: AvatarInitialsProps) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <span className={`text-sm font-medium ${className}`}>
      {getInitials(name)}
    </span>
  );
};
