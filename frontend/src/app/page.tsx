import ConnectWallet from "./ConnectWallet";
import CreateCampaign from "./CreateCampaign";
import CampaignsList from "./CampaignsList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold text-white">Fund-Chain</h1>
        <ConnectWallet />
      </header>
      
      <section className="mb-16">
        <CreateCampaign />
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-2">
          Live Campaigns
        </h2>
        <CampaignsList />
      </section>
    </main>
  );
}