import React, { useState } from 'react';
// import { QRCode } from 'qrcode.react';

const QrGenerator: React.FC = () => {
  const [text, setText] = useState('');

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <h1 className="text-2xl font-bold">QR Code Generator</h1>
      
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text or URL"
        className="border px-4 py-2 rounded-md w-64"
      />
      
      {text && (
        <div className="p-4 border rounded-md">
          <QRCode value={text} size={200} />
        </div>
      )}
    </div>
  );
};

export default QrGenerator;
