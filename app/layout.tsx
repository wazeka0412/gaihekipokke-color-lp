import type { Metadata } from 'next';
import './globals.css';
import './logo.css';
import './warm.css';
import './mobile.css';
export const metadata: Metadata = { title:'外壁塗装の見積もり診断｜外壁ぽっけ',description:'外壁塗装の見積書を無料で確認。塗装面積・塗料・工程・保証・追加費用を分かりやすく診断します。' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ja"><body>{children}</body></html>}
