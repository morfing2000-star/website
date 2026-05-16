'use client';

import { useState } from 'react';

type FeatureButtonProps = {
  label: string;
  available?: boolean;
  message?: string;
  onAvailableClick?: () => void;
};

export function FeatureButton({
  label,
  available = false,
  message = 'Αυτή η λειτουργία δεν είναι ακόμη διαθέσιμη στο demo. Θα προστεθεί σε επόμενο phase.',
  onAvailableClick
}: FeatureButtonProps) {
  const [notice, setNotice] = useState('');

  return (
    <div className="feature-action">
      <button
        className={available ? 'button compact-button' : 'auth-tab compact-button'}
        type="button"
        aria-disabled={!available}
        onClick={() => {
          onAvailableClick?.();
          setNotice(message);
        }}
      >
        {label}
      </button>
      {notice && (
        <p className="inline-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </div>
  );
}
