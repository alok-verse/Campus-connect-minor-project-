
const TIME_ZONE = "Asia/Kolkata";

// Convert MongoDB date to YYYY-MM-DD
function formatDateISO(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const get = (type) =>
        parts.find((part) => part.type === type)?.value;

    return `${get("year")}-${get("month")}-${get("day")}`;
}

// Extract event time in Indian Standard Time
function formatTimeISO(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).format(date);
}

// Convert frontend form data to backend format
export function toBackendEvent(event) {

    const eventDate = new Date(
        `${event.date}T${event.time || "00:00"}:00+05:30`
    );

    const registrationStart = event.registrationStartDate
        ? new Date(
            `${event.registrationStartDate}T00:00:00+05:30`
        )
        : null;

    let registrationEnd = event.registrationDeadline
        ? new Date(
            `${event.registrationDeadline}T23:59:59+05:30`
        )
        : null;

    // Registration must close before the event begins
    if (
        registrationEnd &&
        registrationEnd > eventDate
    ) {
        registrationEnd = eventDate;
    }

    return {
        organizer: event.organizer,
        phone: event.phone,
        email: event.email,
        college: event.college,

        title: event.title,
        description: event.description,
        category: event.category,
        mode: event.mode,
        venue: event.venue,
        icon: event.icon || "🎓",

        date: eventDate.toISOString(),

        registrationStartDate:
            registrationStart?.toISOString() || null,

        registrationDeadline:
            registrationEnd?.toISOString() || null,

        audience: event.audience || "All Students",
        specificYear: event.specificYear || "",

        highlights: event.highlights || "",
        instructions: event.instructions || "",
        dressCode: event.dressCode || "",

        fee:
            event.feeType === "Amount"
                ? Number(event.amount)
                : 0,

        capacity: Number(event.capacity || 100),

        payment: event.payment || "Both",

        bannerName: event.bannerName || "",
        image: event.bannerData || "",

        qrName: event.qrName || "",
        qrData: event.qrData || "",

        terms: Boolean(event.terms),

        status: "upcoming"
    };
}

// Convert MongoDB event to existing frontend format
export function toFrontendEvent(event) {

    const fee = Number(event.fee || 0);

    return {
        ...event,

        id: String(event._id),

        date: formatDateISO(event.date),
        time: formatTimeISO(event.date),

        registrationStartDate:
            formatDateISO(event.registrationStartDate),

        registrationDeadline:
            formatDateISO(event.registrationDeadline),

        feeType: fee > 0 ? "Amount" : "Free",

        amount: fee > 0 ? String(fee) : "",

        bannerData: event.image || "",
        bannerName: event.bannerName || "",

        qrData: event.qrData || "",
        qrName: event.qrName || "",

        year:
            event.audience === "Specific Batch"
                ? "Other"
                : "All",

        specificYear: event.specificYear || "",

        archived: event.status === "archived",

        archivedAt: event.archivedAt
            ? new Date(event.archivedAt)
                .toLocaleDateString("en-IN", {
                    timeZone: TIME_ZONE
                })
            : "",

        createdAt: event.createdAt
            ? new Date(event.createdAt)
                .toLocaleDateString("en-IN", {
                    timeZone: TIME_ZONE
                })
            : "",

        createdAtISO: event.createdAt || ""
    };
}
