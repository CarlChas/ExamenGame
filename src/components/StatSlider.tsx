import React from 'react';

interface StatSliderProps {
  label: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  total: number;
  maxPoints: number;
}

const StatSlider: React.FC<StatSliderProps> = ({ label, value, setValue, total, maxPoints }) => {
  return (
    <div>
      <label>{label}: {value}</label>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onInput={(e) => {
          const newValue = +e.currentTarget.value;
          const diff = newValue - value;
          if (diff <= 0 || total + diff <= maxPoints) setValue(newValue);
        }}
      />
    </div>
  );
};

export default StatSlider;
