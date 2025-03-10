import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import brain from 'brain';

export interface Props {
  className?: string;
}

export const CodeReview = ({ className = '' }: Props) => {
  const [code, setCode] = useState('');
  const [context, setContext] = useState('');
  const [review, setReview] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review');
      return;
    }

    setIsLoading(true);
    try {
      const response = await brain.review_code({
        code,
        context: context || undefined,
      });
      const data = await response.json();
      setReview(data.review);
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error reviewing code:', error);
      toast.error('Failed to review code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <h2 className="text-2xl font-light tracking-wide">Code Review</h2>
        <p className="text-gray-600">
          Enter your code below and get instant feedback from our AI code reviewer.
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-64 font-mono"
        />
        <Textarea
          placeholder="Add context about the code (optional)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="h-24"
        />
        <Button
          onClick={handleReview}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Reviewing...' : 'Review Code'}
        </Button>
      </div>

      {review && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Review</h3>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm">{review}</pre>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Suggestions</h3>
              <ul className="list-disc list-inside space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-gray-700">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
