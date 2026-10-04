import React from 'react';
import { LegalPortal } from './LegalPortal';

interface PrivacyPageProps {
  onBackToHome: () => void;
  onNavigateDoc: (doc: 'terms' | 'privacy' | 'guidelines') => void;
  onDownloadClick?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = (props) => {
  return <LegalPortal {...props} initialDoc="privacy" />;
};
