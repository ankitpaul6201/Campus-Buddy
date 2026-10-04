import React from 'react';
import { LegalPortal } from './LegalPortal';

interface GuidelinesPageProps {
  onBackToHome: () => void;
  onNavigateDoc: (doc: 'terms' | 'privacy' | 'guidelines') => void;
  onDownloadClick?: () => void;
}

export const GuidelinesPage: React.FC<GuidelinesPageProps> = (props) => {
  return <LegalPortal {...props} initialDoc="guidelines" />;
};
