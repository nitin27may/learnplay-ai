'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { ChessGame } from '@/components/chess/ChessGame';

export default function ChessPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: 'Chess Tutor',
          initial: 'Hi! I\'m your chess tutor. Ask me to:\n• "Learn chess basics"\n• "Suggest a move"\n• "Explain this position"\n• Play against AI',
        }}
      >
        <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
          <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
              Chess Academy
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Learn and master chess with AI guidance
            </p>
            
            <ChessGame />
          </div>
        </main>
      </CopilotSidebar>
    </CopilotKit>
  );
}
