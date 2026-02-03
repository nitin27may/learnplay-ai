'use client';

import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import { ChessGameWithAgent } from '@/components/chess/ChessGameWithAgent';
import Link from 'next/link';

export default function ChessPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit?agent=chess_agent">
      <div className="relative">
        <Link
          href="/"
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700 hover:text-gray-900 font-medium"
        >
          ← Home
        </Link>
        <ChessGameWithAgent />
      </div>
    </CopilotKit>
  );
}
