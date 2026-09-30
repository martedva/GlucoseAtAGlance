import { memo, useRef, useState, useEffect } from 'react';
import './Dropdown.css';

export interface DropdownOption {
  label: string;
  value: string;
  onClick?: () => void;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  align?: 'left' | 'right';
}

/**
 * Atomic Dropdown component
 * Clickable trigger that shows a dropdown menu
 */
const Dropdown = memo(function Dropdown({
  trigger,
  options,
  align = 'right',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>
      {isOpen && (
        <div className={`dropdown__menu dropdown__menu--${align}`} role="menu">
          {options.map((option, index) => (
            <button
              key={index}
              className={`dropdown__item${option.danger ? ' dropdown__item--danger' : ''}`}
              onClick={() => {
                option.onClick?.();
                setIsOpen(false);
              }}
              role="menuitem"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default Dropdown;