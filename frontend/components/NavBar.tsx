import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function NavBar() {
  return (
    <div className="max-w-lg mx-auto py-4 flex flex-row justify-between items-center">
      <h1 className="font-bold font-sans">Mac n&apos; Mana 🍔</h1>
      <div>
        <ConnectButton accountStatus={"avatar"} />
      </div>
    </div>
  );
}
