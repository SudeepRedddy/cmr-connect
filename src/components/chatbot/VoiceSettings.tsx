import { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VoiceSettingsProps {
  onSpeedChange: (speed: number) => void;
}

const VoiceSettings = ({ onSpeedChange }: VoiceSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [speed, setSpeed] = useState(() => {
    const saved = localStorage.getItem('chatbot-voice-speed');
    return saved ? parseFloat(saved) : 1.0;
  });

  useEffect(() => {
    localStorage.setItem('chatbot-voice-speed', speed.toString());
    onSpeedChange(speed);
  }, [speed, onSpeedChange]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center"
        title="Voice Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-56 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Voice Settings</span>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Speech Speed</span>
              <span>{speed.toFixed(1)}x</span>
            </div>
            <Slider
              value={[speed]}
              onValueChange={(values) => setSpeed(values[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.5x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSettings;
