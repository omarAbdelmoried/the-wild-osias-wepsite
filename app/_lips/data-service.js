import supabase from "./supabase";
import { notFound } from "next/navigation";
import { addDays, eachDayOfInterval, isWithinInterval } from "date-fns";

/////////////
// GET

export async function getCabin(id) {
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    notFound();
  }

  return data;
}

export async function getCabinPrice(id) {
  const { data, error } = await supabase
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
  }

  return data;
}

export const getCabins = async function () {
  const { data, error } = await supabase
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");
  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  //For testing
  // await new Promise((res) => setTimeout(res, 1000));
  return data ?? [];
};

export async function getBlogPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_post_images(*)")
    .eq("status", "published")
    .order("publishedAt", { ascending: false });
  if (error) {
    console.error(error);
    throw new Error("Blog posts could not be loaded");
  }
  return (data ?? []).map((post) => ({
    ...post,
    coverImages:
      post.blog_post_images
        ?.sort((a, b) => a.displayOrder - b.displayOrder)
        .map((image) => image.imageUrl) ||
      (post.coverImage ? [post.coverImage] : []),
  }));
}

export async function getBlogPost(slug) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_post_images(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error) notFound();
  return {
    ...data,
    coverImages:
      data.blog_post_images
        ?.sort((a, b) => a.displayOrder - b.displayOrder)
        .map((image) => image.imageUrl) ||
      (data.coverImage ? [data.coverImage] : []),
  };
}
// Guests are uniquely identified by their email address
export async function getGuest(email) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  // No error here! We handle the possibility of no guest in the sign in callback
  return data;
}

export async function getBooking(id) {
  const { data, error, count } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }

  return data;
}

export async function getBookings(guestId) {
  const { data, error, count } = await supabase
    .from("bookings")
    // We actually also need data on the cabins as well. But let's ONLY take the data that we actually need, in order to reduce downloaded data.
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, totalPrice, guestId, cabinId, cabins(name, image)",
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

export async function getBookedDatesByCabinId(cabinId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .in("status", ["unconfirmed", "checked-in"]);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: addDays(new Date(booking.endDate), -1),
      });
    })
    .flat();

  return bookedDates;
}

export async function getBookedDatesByGuestId(guestId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("guestId", guestId)
    .in("status", ["unconfirmed", "checked-in"]);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: addDays(new Date(booking.endDate), -1),
      });
    })
    .flat();

  return bookedDates;
}

// NEW: Get booking objects with guest counts for a cabin (for capacity calculation)
export async function getCabinBookingsWithGuestCount(cabinId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, startDate, endDate, numGuests, guestId, status")
    .eq("cabinId", cabinId)
    .in("status", ["unconfirmed", "checked-in"]);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }

  return data || [];
}

// NEW: Calculate remaining capacity for a specific date in a cabin
export function calculateRemainingCapacity(
  cabinMaxCapacity,
  bookings,
  selectedDate,
) {
  if (!selectedDate) return cabinMaxCapacity;

  const selectedDateObj = new Date(selectedDate);

  const bookedGuestsForDate = bookings.reduce((total, booking) => {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);

    // Check if selectedDate falls within or overlaps the booking date range
    // Note: endDate is exclusive in bookings (checkout date), so we subtract 1 day
    const bookingEndExclusive = addDays(bookingEnd, -1);

    if (
      isWithinInterval(selectedDateObj, {
        start: bookingStart,
        end: bookingEndExclusive,
      })
    ) {
      return total + booking.numGuests;
    }
    return total;
  }, 0);

  return Math.max(0, cabinMaxCapacity - bookedGuestsForDate);
}

// NEW: Calculate remaining capacity for a date range
export function calculateRemainingCapacityForRange(
  cabinMaxCapacity,
  bookings,
  startDate,
  endDate,
) {
  if (!startDate || !endDate) return cabinMaxCapacity;

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // For a range, we need to find the MINIMUM remaining capacity across all dates
  // This ensures the user can book the entire range
  const daysInRange = eachDayOfInterval({
    start: startDateObj,
    end: addDays(endDateObj, -1), // endDate is exclusive
  });

  if (daysInRange.length === 0) return cabinMaxCapacity;

  const capacitiesPerDay = daysInRange.map((date) =>
    calculateRemainingCapacity(cabinMaxCapacity, bookings, date),
  );

  return Math.min(...capacitiesPerDay);
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data;
}

export async function getCountries() {
  try {
    const res = await fetch("https://api.restcountries.com/countries/v5", {
      headers: {
        Authorization: `Bearer ${process.env.REST_COUNTRIES_API_KEY}`,
      },
    });
    const countries = await res.json();
    return countries;
  } catch {
    throw new Error("Could not fetch countries");
  }
}

/////////////
// CREATE

export async function createGuest(newGuest) {
  const { data, error } = await supabase.from("guests").insert([newGuest]);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }

  return data;
}

/////////////
// UPDATE

// The updatedFields is an object which should ONLY contain the updated data
// export async function updateGuest(id, updatedFields) {
//   const { data, error } = await supabase
//     .from("guests")
//     .update(updatedFields)
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) {
//     console.error(error);
//     throw new Error("Guest could not be updated");
//   }
//   return data;
// }

// export async function updateBooking(id, updatedFields) {
//   const { data, error } = await supabase
//     .from("bookings")
//     .update(updatedFields)
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) {
//     console.error(error);
//     throw new Error("Booking could not be updated");
//   }
//   return data;
// }

/////////////
// DELETE

export async function deleteBooking(id) {
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  return data;
}
