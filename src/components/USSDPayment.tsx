import { useState } from "react";
import { X, Phone } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useToastStore } from "../stores/useToastStore";

interface Props {
  amount: number;
  orderId: string;
  onClose: () => void;
}

export default function USSDPayment({ amount, orderId, onClose }: Props) {
  const { userProfile } = useAuth();
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const pushToast = useToastStore((s) => s.push);
  const [running, setRunning] = useState(false);

  const formatAmount = Math.round(amount).toString();

  const ussdFor = (amt: string) => `*182*8*1*1472691*${amt}#`;

  const initiate = async () => {
    if (!phone) {
      pushToast({
        id: `ussd-no-phone-${orderId}`,
        message: "Enter a phone number.",
        duration: 3000,
      });
      return;
    }

    setRunning(true);
    const ussd = ussdFor(formatAmount);

    try {
      // Try to open phone dialer with USSD (mobile browsers may prompt)
      const telUri = `tel:${encodeURIComponent(ussd)}`;
      window.location.href = telUri;

      // also copy code to clipboard as a fallback for desktop/browsers that block tel: with USSD
      try {
        await navigator.clipboard.writeText(ussd);
        pushToast({
          id: `ussd-copied-${orderId}`,
          message: `USSD code copied: ${ussd}`,
          duration: 5000,
        });
      } catch (err) {
        // ignore clipboard errors
      }
    } catch (err) {
      pushToast({
        id: `ussd-fail-${orderId}`,
        message: `Unable to start USSD. Code: ${ussd}`,
        duration: 6000,
      });
    } finally {
      setRunning(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Phone size={18} /> Complete Payment
          </h3>
          <button
            onClick={onClose}
            aria-label="close"
            className="text-slate-600 dark:text-slate-300"
          >
            <X />
          </button>
        </div>

        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          We'll prepare the USSD string for you. On mobile this will open your
          dialer to run the USSD code. If that doesn't work the code will be
          copied to your clipboard so you can manually dial it.
        </p>

        <label className="mb-2 block text-sm text-slate-700 dark:text-slate-300">
          Phone number for payment
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 250786531080"
          className="mb-4 w-full rounded border px-3 py-2 text-slate-900 dark:bg-gray-700 dark:text-white"
        />

        <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
          Amount: <span className="font-semibold">RWF {formatAmount}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={initiate}
            disabled={running}
            className="flex-1 btn disabled:opacity-50"
          >
            {running ? "Starting..." : "Run USSD & Copy Code"}
          </button>
          <button onClick={onClose} className="rounded border px-4 py-2">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
