import { ChessGame } from '@/components/chess/ChessGame';

export default function ChessPage() {
  return (
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
  );
}
