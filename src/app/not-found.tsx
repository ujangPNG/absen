import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <div className="font-mono">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404</h1>
        <p style={{ marginBottom: '1rem' }}>Halaman tidak ditemukan</p>
        <Link href="/">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
