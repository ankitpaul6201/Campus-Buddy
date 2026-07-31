import React from 'react';
import { Building2, MapPin, CheckCircle2 } from 'lucide-react';

export default function SearchResultTile({ university, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(university)}
      className={`w-full p-4 text-left flex items-start justify-between transition-colors ${
        isSelected 
          ? 'bg-blue-50/80 border-l-4 border-[#1944F1]' 
          : 'hover:bg-gray-50 border-b border-gray-100 last:border-b-0'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-50 text-[#1944F1] shrink-0 mt-0.5">
          <Building2 className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 leading-tight">
            {university.name}
          </h4>
          <p className="text-xs text-slate-500 font-normal mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{university.city}, {university.country}</span>
          </p>
        </div>
      </div>

      {isSelected && (
        <CheckCircle2 className="w-5 h-5 text-[#1944F1] shrink-0 mt-1" />
      )}
    </button>
  );
}
