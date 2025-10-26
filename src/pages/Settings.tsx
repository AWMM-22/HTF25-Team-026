import Navbar from '@/components/Navbar';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">Settings</h1>
      </main>
    </div>
  );
}
