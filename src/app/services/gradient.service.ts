import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GradientService {


  generateRandomPastelGradient(): string {
    // Random hues
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 40) % 360; // 40 degree offset for complementary color
    
    // Pastel colors have high lightness (80-90%) and medium saturation (25-35%)
    const saturation = 30;
    const lightness = 85;
    
    return `linear-gradient(135deg, 
      hsl(${hue1}, ${saturation}%, ${lightness}%) 0%, 
      hsl(${hue2}, ${saturation}%, ${lightness}%) 100%)`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  generateGradient(input: string): string {
    const hash = this.hashCode(input);
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;
    
    const saturation = 30;
    const lightness = 85;
    
    return `linear-gradient(135deg, 
      hsl(${hue1}, ${saturation}%, ${lightness}%) 0%, 
      hsl(${hue2}, ${saturation}%, ${lightness}%) 100%)`;
  }
}
