import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calculator, Moon, Sun, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
              CanFin Calculator
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <NavLink
              to="/net-worth"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-emerald-100 dark:hover:bg-emerald-700'
                }`
              }
            >
              Net Worth
            </NavLink>
            
            <NavLink
              to="/budget"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-emerald-100 dark:hover:bg-emerald-700'
                }`
              }
            >
              Budget
            </NavLink>
            
            <NavLink
              to="/loan"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-emerald-100 dark:hover:bg-emerald-700'
                }`
              }
            >
              Loan Calculator
            </NavLink>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-200" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;