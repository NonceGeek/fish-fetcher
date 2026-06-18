import Header from "@/components/Header";
import FishingGame from "@/components/FishingGame";

export default function HomePage() {
  return (
    <div>
      <Header />
      <main className="mx-auto max-w-lg px-6 py-8 pb-16">
        <FishingGame />
      </main>
    </div>
  );
}
