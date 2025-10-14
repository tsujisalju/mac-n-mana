import { Client, create } from "@storacha/client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const StorachaContext = createContext<Client | null>(null);

export function StorachaProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const init = async () => {
      const client = await create();
      const account = await client.login("purrnama@proton.me");
      client.setCurrentSpace(
        "did:key:z6MkthzSovR8bGvcDwMsdUEHLwYL52ZYyDRirnczRzWaMV6J",
      );
      setClient(client);
    };
    init();
  }, []);

  return (
    <StorachaContext.Provider value={client}>
      {children}
    </StorachaContext.Provider>
  );
}

export function useStoracha() {
  return useContext(StorachaContext);
}
