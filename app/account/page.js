import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { format, isPast } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/app/_lips/auth";
import { getBookings, getGuest } from "@/app/_lips/data-service";

export default async function Page() {
  const session = await auth();
  const guest = await getGuest(session.user.email);
  const bookings = (await getBookings(session.user.id)) ?? [];
  const upcomingBooking = bookings.find(
    (booking) => !isPast(new Date(booking.startDate)),
  );
  const firstName = guest?.fullName?.split(" ")[0] || "Guest";
  const profileComplete = Boolean(
    guest?.nationality && guest?.nationalID && guest?.countryFlag,
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 border-b border-primary-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-accent-400">
            Guest area
          </p>
          <h1 className="text-3xl font-semibold text-primary-50 sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-primary-300">
            Your quiet corner of The Wild Oasis. Everything for your next stay
            is gathered here.
          </p>
        </div>
        <Link
          href="/cabins"
          className="group inline-flex w-fit items-center gap-2 bg-accent-500 px-5 py-3 font-semibold text-primary-950 transition-colors hover:bg-accent-400"
        >
          Find a cabin
          <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Stay overview">
        <OverviewItem
          label="Total reservations"
          value={bookings.length}
          icon={<CalendarDaysIcon className="h-6 w-6" />}
        />
        <OverviewItem
          label="Upcoming stays"
          value={
            bookings.filter((booking) => !isPast(new Date(booking.startDate)))
              .length
          }
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />
        <OverviewItem
          label="Profile status"
          value={profileComplete ? "Ready" : "Finish it"}
          icon={<UserCircleIcon className="h-6 w-6" />}
        />
      </section>

      {upcomingBooking ? (
        <section className="overflow-hidden border border-primary-800 bg-primary-900">
          <div className="flex flex-col lg:flex-row">
            <div className="relative min-h-64 lg:min-h-0 lg:w-2/5">
              <Image
                src={upcomingBooking.cabins.image}
                alt={`Cabin ${upcomingBooking.cabins.name}`}
                fill
                className="object-cover"
              />
              <span className="absolute left-5 top-5 bg-accent-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-950">
                Next stay
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-6 p-6 sm:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-400">
                  {format(new Date(upcomingBooking.startDate), "EEEE, MMM d")}
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-primary-50">
                  Cabin {upcomingBooking.cabins.name}
                </h2>
                <p className="mt-2 text-lg text-primary-300">
                  {upcomingBooking.numNights} nights for{" "}
                  {upcomingBooking.numGuests} guest
                  {upcomingBooking.numGuests === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-primary-700 pt-5">
                <p className="text-primary-300">
                  {format(new Date(upcomingBooking.startDate), "MMM d")} -{" "}
                  {format(new Date(upcomingBooking.endDate), "MMM d, yyyy")}
                </p>
                <Link
                  href={`/account/reservations/edit/${upcomingBooking.id}`}
                  className="group inline-flex items-center gap-2 font-semibold text-accent-400 hover:text-accent-300"
                >
                  Manage reservation
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="border border-primary-800 bg-primary-900 p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-400">
            Make yourself at home
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-primary-50">
            Your next stay is waiting to be planned.
          </h2>
          <p className="mt-2 max-w-xl text-lg text-primary-300">
            Explore the cabins, choose your dates, and let the forest take it
            from there.
          </p>
          <Link
            href="/cabins"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-400 hover:text-accent-300"
          >
            Browse available cabins <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </section>
      )}

      {!profileComplete && (
        <section className="flex flex-col gap-5 border border-accent-700 bg-accent-950/40 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-400">
              One small detail
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary-50">
              Complete your guest profile
            </h2>
            <p className="mt-2 text-primary-300">
              Add your nationality and ID to make check-in quicker.
            </p>
          </div>
          <Link
            href="/account/profile"
            className="inline-flex w-fit items-center gap-2 border border-accent-500 px-5 py-3 font-semibold text-accent-300 transition-colors hover:bg-accent-500 hover:text-primary-950"
          >
            Update profile <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </section>
      )}

      <section className="flex flex-col gap-4 border-t border-primary-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary-50">
            Need a closer look?
          </h2>
          <p className="mt-1 text-primary-300">
            Review all your bookings and their details.
          </p>
        </div>
        <Link
          href="/account/reservations"
          className="inline-flex items-center gap-2 font-semibold text-accent-400 hover:text-accent-300"
        >
          View reservations <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}

function OverviewItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 border border-primary-800 px-5 py-5">
      <span className="text-accent-400">{icon}</span>
      <div>
        <p className="text-2xl font-semibold text-primary-50">{value}</p>
        <p className="text-sm uppercase tracking-wider text-primary-400">
          {label}
        </p>
      </div>
    </div>
  );
}
