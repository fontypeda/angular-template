import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { primaryColors } from './config/colors';

const MyPreset = definePreset(Aura, {
    darkModeSelector: '.dark', // Match Tailwind's dark mode class
    semantic: {
        primary: primaryColors
    }
});

export default MyPreset;
