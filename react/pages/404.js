import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link href="/" className="back-home-link">
        Go Back to Home
      </Link>
    </div>
  );
}
