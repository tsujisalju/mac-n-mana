import { ReplyParams } from "@/lib/blockscout";
import { getReplyDataByCID } from "@/lib/storage";
import { truncateString } from "@/lib/truncate";
import { useEffect, useState } from "react";

export default function ReplyCard({ params }: { params: ReplyParams }) {
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getReply = async () => {
      setIsLoading(true);
      try {
        const reply = await getReplyDataByCID(params.ipfsHash);
        setText(reply.text);
      } catch (err) {
        console.error(
          `Failed to get reply data on IPFS for cid ${params.ipfsHash}`,
          err,
        );
        setText("");
      } finally {
        setIsLoading(false);
      }
    };
    getReply();
  }, [params]);

  return (
    <div className="flex flex-col grow space-y-2">
      <p className="font-bold">{truncateString(params.author)}</p>
      {!isLoading ? (
        <p>{text}</p>
      ) : (
        <span className="loading loading-spinner"></span>
      )}
    </div>
  );
}
