import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-800">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
            <p className="mb-6 text-gray-600">
                Sorry, we couldn’t find the page you’re looking for.
            </p>
            <Link href="/" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
                Go Home
            </Link>
        </main>
    );
}