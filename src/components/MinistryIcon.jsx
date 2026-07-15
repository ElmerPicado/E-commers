import React from 'react';
import { Flame, Heart, Shield, Sun, Sparkles } from 'lucide-react';

const MinistryIcon = ({ name, color }) => {
  const style = { color: color };
  switch (name) {
    case 'Flame': return <Flame size={28} style={style} />;
    case 'Heart': return <Heart size={28} style={style} />;
    case 'Shield': return <Shield size={28} style={style} />;
    case 'Sun': return <Sun size={28} style={style} />;
    default: return <Sparkles size={28} style={style} />;
  }
};

export default MinistryIcon;
