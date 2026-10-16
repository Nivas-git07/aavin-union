import { Check, CircleHelp, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function HelpDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} className="help-dialog">
      <button
        className="icon-button dialog-close"
        aria-label="Close workspace guide"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <span className="guide-icon">
        <CircleHelp size={28} />
      </span>
      <h2>Your union, in one place.</h2>
      <p>
        This is a read-only demonstration for Aavin Madurai Union. All people
        and collection records are fictional.
      </p>
      <dl>
        <dt>Start with the overview</dt>
        <dd>
          Choose a period and shift. Every chart, table and export follows those
          filters.
        </dd>
        <dt>Follow the collection</dt>
        <dd>
          Open a BMC, then a society, then a farmer to trace totals to daily
          milk entries.
        </dd>
        <dt>Understand a gap</dt>
        <dd>
          Confirmed zero means no milk was supplied in a closed shift. Missing
          record means supply is unconfirmed. Pending shifts are not counted as
          missed.
        </dd>
        <dt>Collection windows</dt>
        <dd>
          Morning closes at 10:00 IST; evening at 20:00 IST. The current day
          remains provisional until closing.
        </dd>
        <dt>Registered counts</dt>
        <dd>
          Counts include registered inactive farmers and their cows.
          Contributions use only actual recorded supply.
        </dd>
        <dt>Export and share</dt>
        <dd>
          CSV exports include all matching rows, beyond the current table page.
          Reports also have complete print layouts.
        </dd>
      </dl>
      <button className="button primary-button" onClick={onClose}>
        Got it <Check size={16} />
      </button>
    </dialog>
  );
}
