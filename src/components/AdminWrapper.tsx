import { Outlet } from "react-router-dom";
import { AdminLayout } from "./admin-layout";

export function AdminWrapper() {
  return (
    <AdminLayout>
      <Outlet />   {/* Pages will render here */}
    </AdminLayout>
  );
}
