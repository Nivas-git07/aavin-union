import { Panel } from "@/components/ui/Panel";
import { demoRepository } from "@/services/demoRepository";
import type { OwnerCowDetails } from "@/types/models";
import type { LinkBuilder } from "@/types/navigation";
import { formatDate, indiaDate } from "@/utils/date";
import { Milk, Search } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

function cowAge(birthDate: string, today: string) {
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const [year, month, day] = today.split("-").map(Number);
  const months = Math.max(
    0,
    (year - birthYear) * 12 + month - birthMonth - (day < birthDay ? 1 : 0),
  );
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return `${years} ${years === 1 ? "year" : "years"}, ${remaining} ${remaining === 1 ? "month" : "months"}`;
}

export function CowDetailsPage({
  linkTo,
  now,
}: {
  linkTo: LinkBuilder;
  now: Date;
}) {
  const [aadhaar, setAadhaar] = useState("");
  const [result, setResult] = useState<OwnerCowDetails | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sample = demoRepository.farmers[0].demoAadhaar.replace(
    /(.{4})(?=.)/g,
    "$1 ",
  );

  function resetResult() {
    setResult(null);
    setSearched(false);
    setError("");
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetResult();
    const normalized = aadhaar.replace(/[\s-]/g, "");
    if (!/^\d{12}$/.test(normalized)) {
      setError(
        "Enter a 12-digit Aadhaar number. Spaces and hyphens are allowed.",
      );
      inputRef.current?.focus();
      return;
    }
    setResult(demoRepository.findOwnerByAadhaar(normalized));
    setSearched(true);
  }

  return (
    <div className="cow-details-page">
      <Panel
        title="Search by owner Aadhaar"
        subtitle="Search across all societies in the union."
      >
        <form className="cow-search-form" onSubmit={search} noValidate>
          <label htmlFor="owner-aadhaar">Owner Aadhaar number</label>
          <div className="cow-search-controls">
            <input
              ref={inputRef}
              id="owner-aadhaar"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              placeholder="Enter 12-digit Aadhaar number"
              value={aadhaar}
              aria-invalid={!!error}
              aria-describedby={
                error ? "cow-search-help cow-search-error" : "cow-search-help"
              }
              onChange={(event) => {
                setAadhaar(event.target.value);
                resetResult();
              }}
            />
            <button type="submit" className="button primary-button">
              <Search size={16} />
              Search
            </button>
            <button
              type="button"
              className="button"
              onClick={() => {
                setAadhaar("");
                resetResult();
                inputRef.current?.focus();
              }}
            >
              Clear
            </button>
          </div>
          <p id="cow-search-help" className="cow-search-help">
            Fictional demo Aadhaar: <strong>{sample}</strong>. Owner and
            medicine records are demonstration data.
          </p>
          {error && (
            <p id="cow-search-error" className="cow-search-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </Panel>

      <div role="status" className="cow-search-status">
        {searched &&
          (result
            ? `${result.cows.length} registered cows found for ${result.owner.name}.`
            : "No owner found. Check the Aadhaar number and try again.")}
      </div>
      {!searched && !error && (
        <div className="empty cow-search-empty">
          <Milk size={32} />
          <h2>Find an owner's cows</h2>
          <p>
            Enter an owner’s Aadhaar number to see their details, registered
            cows and medicine history.
          </p>
        </div>
      )}
      {result && (
        <>
          <Panel
            title="Owner details"
            subtitle="Registered owner and society information"
          >
            <dl className="cow-facts">
              <div>
                <dt>Owner name</dt>
                <dd>
                  <Link
                    to={linkTo(`/farmers/${result.owner.id}`, {
                      bmc: result.bmc.id,
                      society: result.society.id,
                    })}
                  >
                    {result.owner.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Farmer ID</dt>
                <dd>{result.owner.id}</dd>
              </div>
              <div>
                <dt>Demo contact</dt>
                <dd>{result.owner.contact}</dd>
              </div>
              <div>
                <dt>Society</dt>
                <dd>
                  <Link
                    to={linkTo(`/societies/${result.society.id}`, {
                      bmc: result.bmc.id,
                      society: result.society.id,
                    })}
                  >
                    {result.society.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>BMC</dt>
                <dd>{result.bmc.name}</dd>
              </div>
              <div>
                <dt>Village / place</dt>
                <dd>{result.owner.village}, Madurai</dd>
              </div>
              <div>
                <dt>Registered cows</dt>
                <dd>{result.cows.length}</dd>
              </div>
            </dl>
          </Panel>
          <div className="cow-section-heading">
            <Milk size={21} />
            <h2>Registered cows</h2>
            <span>{result.cows.length}</span>
          </div>
          {result.cows.length === 0 && (
            <p className="empty">No registered cows</p>
          )}
          {result.cows.map((cow) => (
            <Panel
              key={cow.id}
              title={cow.id}
              subtitle={cow.tagId}
              className="cow-record"
            >
              <dl className="cow-facts">
                <div>
                  <dt>Breed</dt>
                  <dd>{cow.breed}</dd>
                </div>
                <div>
                  <dt>Birth date</dt>
                  <dd>{formatDate(cow.birthDate)}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{cowAge(cow.birthDate, indiaDate(now))}</dd>
                </div>
                <div>
                  <dt>Lactation status</dt>
                  <dd>{cow.lactationStatus}</dd>
                </div>
              </dl>
              <h3 className="cow-medicine-heading">Medicine history</h3>
              {cow.medicines.length === 0 ? (
                <p className="cow-no-medicines">No medicine records</p>
              ) : (
                <div
                  className="table-scroll"
                  role="region"
                  aria-label={`Medicine history for ${cow.id}`}
                  tabIndex={0}
                >
                  <table
                    className="cow-medicine-table"
                    aria-label={`Medicine history for ${cow.id}`}
                  >
                    <thead>
                      <tr>
                        {[
                          "Treatment date",
                          "Medicine",
                          "Reason",
                          "Recorded dose",
                          "Duration",
                          "Veterinarian",
                          "Notes",
                        ].map((label) => (
                          <th scope="col" key={label}>
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cow.medicines.map((record) => (
                        <tr key={record.id}>
                          <td>{formatDate(record.treatmentDate)}</td>
                          <td>{record.medicine}</td>
                          <td>{record.reason}</td>
                          <td>{record.recordedDose}</td>
                          <td>{record.duration}</td>
                          <td>{record.veterinarian}</td>
                          <td>{record.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          ))}
        </>
      )}
    </div>
  );
}
