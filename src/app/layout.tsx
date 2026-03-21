import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'EDUALLIANCE FINANCIAL MANAGEMENT SYSTEM',
    description: 'Comprehensive financial ecosystem for loan management, payroll, and expenses.',
    icons: {
        icon: '/favicon.svg'
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body>
                <main>{children}</main>
            </body>
        </html>
    )
}
