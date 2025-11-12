"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

function SubmissionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requestId, setRequestId] = useState("");
  const [copied, setCopied] = useState(false);

  const isClient = typeof window !== 'undefined';

  useEffect(() => {
    if (isClient) {
      const id = searchParams.get('requestId');
      if (id) {
        setRequestId(id);
      } else {
        router.push('/');
      }
    }
  }, [searchParams, router, isClient]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(requestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = requestId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div key={requestId} className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 flex items-center justify-center p-4">
      {!requestId ? (
        <div className="text-white text-lg">Loading success details...</div>
      ) : (
        <Card className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 text-center animate-fade-in">
          <CardHeader>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 drop-shadow-lg" />
            <CardTitle className="text-3xl font-extrabold text-gray-900 mb-2">Request Submitted!</CardTitle>
            <CardDescription className="text-gray-600 text-lg">Your translation request has been successfully received.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 text-md">
              Your unique Request ID is:
            </p>
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6 break-all flex items-center justify-between gap-3">
              <p className="text-xl font-mono font-bold text-blue-700 select-all tracking-wide flex-1">
                {requestId}
              </p>
              <Button
                onClick={handleCopyId}
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 transition-colors ${
                  copied 
                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              Please keep this ID safe for future reference. We will contact you shortly with further updates.
            </p>
            <Button onClick={handleGoHome} className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SubmissionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading success details...</div>
        </div>
      </div>
    }>
      <SubmissionSuccessContent />
    </Suspense>
  );
}
