'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QRCode({ url = 'https://0nmcp.com/app' }: { url?: string }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 12,
        display: 'inline-block',
      }}
    >
      <QRCodeSVG
        value={url}
        size={144}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
        imageSettings={{
          src: '',
          height: 0,
          width: 0,
          excavate: false,
        }}
      />
    </div>
  )
}
