'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export const TypeformWidget = () => {
  useEffect(() => {
    // Ensure the div is only added once
    if (!document.querySelector('[data-tf-live]')) {
      const div = document.createElement('div');
      div.setAttribute('data-tf-live', '01JM576HQDDQZAK11XGZWCJ3BD');
      document.body.appendChild(div);
    }
  }, []);

  return (
    <Script
      src="//embed.typeform.com/next/embed.js"
      strategy="lazyOnload"
    />
  );
}; 