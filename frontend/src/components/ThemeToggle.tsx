import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { NeonButton } from './ui';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <NeonButton 
            variant={theme === 'dark' ? 'blue' : 'gray'} 
            onClick={toggleTheme}
            className="p-2"
        >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </NeonButton>
    );
}
