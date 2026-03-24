import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>MemoSA — One-page deep dives into Indian equities</title>
        <meta name="description" content="Opinionated investment memos on NSE/BSE micro, small & midcap stocks." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Public Sans', system-ui, -apple-system, sans-serif;
          background: #F7F7F8;
          color: #191C1F;
          -webkit-font-smoothing: antialiased;
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        @keyframes up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
        @keyframes sr { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
