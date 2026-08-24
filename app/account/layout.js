import SideNavigation from "../_components/SideNavigation";

export default function Layout({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[16rem_minmax(0,1fr)] h-full gap-4 sm:gap-6 md:gap-12">
      <SideNavigation />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
