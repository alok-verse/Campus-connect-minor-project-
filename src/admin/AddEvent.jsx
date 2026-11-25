import { useState } from "react";
import { CATEGORIES, MODES, UNIVERSITY, YEARS } from "../config";
import { useUI } from "../context/useUI";
import { todayISO } from "../utils/dates";
import { fileToResizedDataURL } from "../utils/image";

const initialForm = {
  organizer: "",
  phone: "",
  email: "",
  college: UNIVERSITY,
  title: "",
  icon: "🎓",
  category: "Workshop",
  mode: "Offline",
  date: "",
  registrationStartDate: "",
  registrationDeadline: "",
  time: "",
  venue: "",
  audience: "All Students",
  specificYear: "",
  description: "",
  highlights: "",
  instructions: "",
  feeType: "Free",
  amount: "",
  dressCode: "",
  payment: "Both",
  terms: false,
};

const emptyImage = { name: "", data: "" };

function AddEvent({ onAddEvent }) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useUI();
  const [form, setForm] = useState(initialForm);
  const [banner, setBanner] = useState(emptyImage);
  const [qr, setQr] = useState(emptyImage);

  const today = todayISO();

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const pickImage = async (event, setImage, { maxBytes, label, resize }) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast(`${label} must be a PNG or JPG image.`, "error");
      return;
    }
    if (file.size > maxBytes) {
      toast(`${label} is too large (max ${Math.round(maxBytes / 1024 / 1024)}MB).`, "error");
      return;
    }

    try {
      const data = await fileToResizedDataURL(file, resize);
      setImage({ name: file.name, data });
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (
      form.registrationStartDate > form.registrationDeadline ||
      form.registrationDeadline > form.date
    ) {
      toast(
        "Invalid dates! Registration must start before its deadline, and the deadline cannot be after the event date.",
        "error"
      );
      return;
    }

    if (form.audience === "Specific Batch" && !form.specificYear) {
      toast("Please select the college year for this batch.", "error");
      return;
    }

    if (form.feeType === "Amount" && Number(form.amount) <= 0) {
      toast("Please enter a valid registration amount.", "error");
      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      toast("Please enter a valid phone number.", "error");
      return;
    }

    const batchOnly = form.audience === "Specific Batch";

    const newEvent = {
      ...form,
      title: form.title.trim(),
      organizer: form.organizer.trim(),
      venue: form.venue.trim(),
      description: form.description.trim(),
      highlights: form.highlights.trim(),
      instructions: form.instructions.trim(),
      icon: form.icon.trim() || "🎓",
      amount: form.feeType === "Amount" ? form.amount : "",
      year: batchOnly ? "Other" : "All",
      specificYear: batchOnly ? form.specificYear : "",
      id: Date.now(),
      bannerName: banner.name,
      bannerData: banner.data,
      qrName: qr.name,
      qrData: qr.data,
      createdAt: new Date().toLocaleDateString(),
      createdAtISO: new Date().toISOString(),
      archived: false,
    };

    setSubmitting(true);
    try {
      const saved = await onAddEvent(newEvent);
      if (!saved) throw new Error("Could not save event.");
      toast("Your event has been added successfully!");
      setForm(initialForm);
      setBanner(emptyImage);
      setQr(emptyImage);
    } catch (error) {
      toast(error.message || "Could not save event.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-event-container">
      <div className="form-heading">
        <div className="form-heading-icon">📢</div>
        <div>
          <h2>Add New Event</h2>
          <p>Create and share an amazing event on Campus Connect!</p>
        </div>
      </div>

      <form onSubmit={submitEvent}>
        {/* ORGANIZER DETAILS */}

        <div className="form-section-title">♟ Organizer Details</div>

        <div className="form-grid four-columns">
          <div className="form-group">
            <label htmlFor="ev-organizer">Your Name / Club *</label>
            <input
              id="ev-organizer"
              name="organizer"
              value={form.organizer}
              onChange={update}
              placeholder="Enter your name or club"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-phone">Phone Number *</label>
            <input
              id="ev-phone"
              name="phone"
              value={form.phone}
              onChange={update}
              placeholder="Enter phone number"
              type="tel"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-email">Email Address *</label>
            <input
              id="ev-email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="Enter email address"
              type="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-college">College / University *</label>
            <input
              id="ev-college"
              name="college"
              value={form.college}
              onChange={update}
              placeholder="Enter college name"
              required
            />
          </div>
        </div>

        {/* EVENT DETAILS */}

        <div className="form-section-title">▣ Event Details</div>

        <div className="form-grid three-columns">
          <div className="form-group">
            <label htmlFor="ev-title">Event Title *</label>
            <input
              id="ev-title"
              name="title"
              value={form.title}
              onChange={update}
              placeholder="Enter event title"
              maxLength={80}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-date">Event Date *</label>
            <input
              id="ev-date"
              name="date"
              value={form.date}
              onChange={update}
              type="date"
              min={form.registrationDeadline || form.registrationStartDate || today}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-time">Event Time *</label>
            <input
              id="ev-time"
              name="time"
              value={form.time}
              onChange={update}
              type="time"
              required
            />
          </div>
        </div>

        <div className="form-grid three-columns">
          <div className="form-group">
            <label htmlFor="ev-category">Category *</label>
            <select id="ev-category" name="category" value={form.category} onChange={update}>
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ev-mode">Mode *</label>
            <select id="ev-mode" name="mode" value={form.mode} onChange={update}>
              {MODES.map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ev-venue">Venue / Location *</label>
            <input
              id="ev-venue"
              name="venue"
              value={form.venue}
              onChange={update}
              placeholder="Enter venue or location"
              required
            />
          </div>
        </div>

        {/* CUSTOM EVENT EMOJI */}

        <div className="form-grid two-columns">
          <div className="form-group">
            <label htmlFor="ev-icon">Event Emoji *</label>
            <input
              id="ev-icon"
              name="icon"
              value={form.icon}
              onChange={update}
              placeholder="Enter an emoji, e.g. 🎵"
              maxLength={12}
              required
            />
            <small>Choose an emoji that represents your event.</small>
          </div>

          <div className="form-group">
            <label>Emoji Preview</label>
            <div className="banner-preview">
              <span style={{ fontSize: "38px" }}>{form.icon || "🎓"}</span>
            </div>
          </div>
        </div>

        {/* REGISTRATION SCHEDULE */}

        <div className="form-section-title">📅 Registration Schedule</div>

        <p className="form-helper-text">
          Set the period during which students are allowed to register. Students cannot register
          outside this period.
        </p>

        <div className="form-grid two-columns">
          <div className="form-group">
            <label htmlFor="ev-reg-start">Registration Start Date *</label>
            <input
              id="ev-reg-start"
              type="date"
              name="registrationStartDate"
              value={form.registrationStartDate}
              onChange={update}
              min={today}
              max={form.registrationDeadline || form.date || undefined}
              required
            />
            <small>Students can register starting from this date.</small>
          </div>

          <div className="form-group">
            <label htmlFor="ev-reg-end">Registration Deadline *</label>
            <input
              id="ev-reg-end"
              type="date"
              name="registrationDeadline"
              value={form.registrationDeadline}
              onChange={update}
              min={form.registrationStartDate || today}
              max={form.date || undefined}
              required
            />
            <small>Last date for student registration.</small>
          </div>
        </div>

        {/* AUDIENCE */}

        <div className="form-section-title">♟ Who Can Join?</div>

        <div className="audience-options">
          {[
            ["All Students", "Open for all college students"],
            ["Specific Batch", "Only for a selected college year"],
          ].map(([value, text]) => (
            <label
              key={value}
              className={form.audience === value ? "audience-card chosen" : "audience-card"}
            >
              <input
                type="radio"
                name="audience"
                value={value}
                checked={form.audience === value}
                onChange={update}
              />
              <div>
                <strong>{value}</strong>
                <p>{text}</p>
              </div>
            </label>
          ))}
        </div>

        {form.audience === "Specific Batch" && (
          <div className="form-grid two-columns batch-row">
            <div className="form-group">
              <label htmlFor="ev-year">College Year *</label>
              <select
                id="ev-year"
                name="specificYear"
                value={form.specificYear}
                onChange={update}
                required
              >
                <option value="">Select Year</option>
                {YEARS.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
              <small>Only students of this year will be able to register.</small>
            </div>
          </div>
        )}

        {/* DESCRIPTION */}

        <div className="form-section-title">▤ Event Description</div>

        <div className="form-group">
          <label htmlFor="ev-description">About the Event *</label>
          <textarea
            id="ev-description"
            name="description"
            value={form.description}
            onChange={update}
            placeholder="Tell us about your event, activities, theme, rules, etc."
            maxLength={1000}
            required
          />
          <small className="character-count">{form.description.length}/1000</small>
        </div>

        <div className="form-grid two-columns">
          <div className="form-group">
            <label htmlFor="ev-highlights">Highlights (optional)</label>
            <textarea
              id="ev-highlights"
              name="highlights"
              value={form.highlights}
              onChange={update}
              placeholder={"One point per line, e.g.\nBasics of HTML and CSS\nBuild a simple webpage"}
              maxLength={600}
            />
            <small>Shown as a bullet list. Put each point on its own line.</small>
          </div>

          <div className="form-group">
            <label htmlFor="ev-instructions">Instructions (optional)</label>
            <textarea
              id="ev-instructions"
              name="instructions"
              value={form.instructions}
              onChange={update}
              placeholder="Anything participants should know or bring."
              maxLength={500}
            />
          </div>
        </div>

        {/* ADDITIONAL DETAILS */}

        <div className="form-section-title">✦ Additional Details</div>

        <div className="form-grid two-columns">
          <div className="form-group">
            <label>Registration Fees *</label>

            <div className="inline-options">
              {["Free", "Amount"].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="feeType"
                    value={type}
                    checked={form.feeType === type}
                    onChange={update}
                  />
                  {type}
                </label>
              ))}

              {form.feeType === "Amount" && (
                <input
                  name="amount"
                  value={form.amount}
                  onChange={update}
                  type="number"
                  min="1"
                  placeholder="Amount (₹)"
                  aria-label="Registration amount in rupees"
                  required
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ev-dress">Dress Code</label>
            <input
              id="ev-dress"
              name="dressCode"
              value={form.dressCode}
              onChange={update}
              placeholder="Enter dress code (optional)"
            />
          </div>
        </div>

        {form.feeType === "Amount" && (
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>Mode of Payment</label>

              <div className="inline-options">
                {["Online", "Offline", "Both"].map((mode) => (
                  <label key={mode}>
                    <input
                      type="radio"
                      name="payment"
                      value={mode}
                      checked={form.payment === mode}
                      onChange={update}
                    />
                    {mode}
                  </label>
                ))}
              </div>
            </div>

            {form.payment !== "Offline" && (
              <div className="form-group">
                <label>QR Code for Online Payment</label>

                <label className="upload-box small-upload">
                  {qr.data ? (
                    <img className="upload-thumb qr-thumb" src={qr.data} alt="QR code preview" />
                  ) : (
                    <span>☁</span>
                  )}
                  <strong>{qr.name || "Upload QR Code"}</strong>
                  <small>PNG, JPG (Max 2MB)</small>

                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) =>
                      pickImage(e, setQr, {
                        maxBytes: 2 * 1024 * 1024,
                        label: "The QR code",
                        resize: { maxWidth: 420, maxHeight: 420, quality: 0.92 },
                      })
                    }
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* EVENT BANNER */}

        <div className="form-section-title">▧ Event Banner</div>

        <div className="form-grid two-columns">
          <div className="form-group">
            <label>Upload Event Image</label>

            <label className="upload-box">
              <span>▧</span>
              <strong>{banner.name || "Upload Event Image"}</strong>
              <small>PNG, JPG, JPEG (Max 5MB)</small>

              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) =>
                  pickImage(e, setBanner, {
                    maxBytes: 5 * 1024 * 1024,
                    label: "The banner",
                    resize: { maxWidth: 900, maxHeight: 900, quality: 0.76 },
                  })
                }
              />
            </label>

            {banner.data && (
              <button
                type="button"
                className="link-button"
                onClick={() => setBanner(emptyImage)}
              >
                Remove image
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Preview</label>

            <div className="banner-preview">
              {banner.data ? (
                <img className="banner-preview-img" src={banner.data} alt="Event banner preview" />
              ) : (
                "Your event banner preview will appear here"
              )}
            </div>
          </div>
        </div>

        {/* TERMS AND SUBMIT */}

        <label className="terms-label">
          <input type="checkbox" name="terms" checked={form.terms} onChange={update} required />
          I agree to the terms and conditions of Campus Connect.
        </label>

        <button className="submit-event-button" type="submit" disabled={submitting}>
          ➤ &nbsp; Submit Event
        </button>
      </form>

      <div className="form-footer">© {new Date().getFullYear()} Campus Connect | Empowering Student Life</div>
    </div>
  );
}

export default AddEvent;
