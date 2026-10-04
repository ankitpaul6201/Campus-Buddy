import React from 'react';
import { LegalPortal } from './LegalPortal';

interface TermsPageProps {
  onBackToHome: () => void;
  onNavigateDoc: (doc: 'terms' | 'privacy' | 'guidelines') => void;
  onDownloadClick?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = (props) => {
  return <LegalPortal {...props} initialDoc="terms" />;
};
