export default function Error500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
        <a href="/" className="text-primary underline">Back to Home</a>
      </div>
    </div>
  );
}
