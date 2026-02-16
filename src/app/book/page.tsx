import BookingClient from "./BookingClient";
export const dynamic = "force-dynamic";
import { getServices, getStaffWithShifts } from "@/lib/actions";

export default async function BookingPage() {
    const [services, staff] = await Promise.all([
        getServices(),
        getStaffWithShifts()
    ]);

    return (
        <BookingClient
            services={services as any[]}
            staffMembers={staff as any[]}
        />
    );
}
