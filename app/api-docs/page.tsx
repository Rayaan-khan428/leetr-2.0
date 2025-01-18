'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import dynamic from 'next/dynamic';
import { openApiSpec } from './openapi-spec';

const SwaggerUIComponent = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  return (
    <div className="container mx-auto py-6">
      <SwaggerUIComponent spec={openApiSpec} />
    </div>
  );
} 