
import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QrCodeScannerProps {
  onScan: (data: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QrCodeScanner = ({ onScan, isOpen, onClose }: QrCodeScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  // Reset scanned state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setScanned(false);
      setError(null);
    }
  }, [isOpen]);

  const handleScan = (result: any) => {
    if (result && !scanned) {
      // Extract the data from the QR code and prevent multiple scans
      const scannedData = result?.text;
      if (scannedData) {
        setScanned(true);
        // For user QR codes, extract the username from the format planit://user/username
        const username = scannedData.includes('planit://user/') 
          ? scannedData.split('/').pop() 
          : scannedData;
          
        onScan(username || '');
        onClose();
      }
    }
  };

  const handleError = (err: Error) => {
    setError(err.message);
    console.error("QR Scanner Error:", err);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Point your camera at the QR code to assign this task to a user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="w-full h-64 relative overflow-hidden rounded-md">
          {isOpen && !scanned && (
            <QrReader
              constraints={{ facingMode: 'environment' }}
              scanDelay={500}
              onResult={handleScan}
              onError={handleError}
              videoStyle={{ width: '100%', height: '100%' }}
              videoContainerStyle={{ width: '100%', height: '100%', position: 'relative' }}
            />
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white p-4 text-center">
              <p>Error accessing camera: {error}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeScanner;
